#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn, spawnSync } from "node:child_process";
import readline from "node:readline/promises";
import { loadConfig, saveConfig, getConfigPath } from "./config.mjs";
import { loadSystemPrompt, generatePlanWithLLM } from "./llm-client.mjs";
import { shouldRequireConfirmation } from "./risk-policy.mjs";
import { executePlan } from "./executor.mjs";
import { installHooks, normalizeHookMode, uninstallHooks } from "./hooks.mjs";
import { runSetup } from "./setup.mjs";
import { fetchWebContext } from "./mcp-web-search.mjs";
import { runLocalWebSearchMcpServer } from "./mcp-local-web-server.mjs";
import { getAuditLogPath } from "./audit-log.mjs";
import { loadModelHistory, recordModelUsage } from "./model-history.mjs";
import {
  buildWarmupRequest,
  defaultBaseUrlForProvider,
  defaultModelForProvider,
  getCurrentMachineProfile,
  getProviderReadinessEndpoints,
  getProviderSupportError,
  isProviderSupported,
  mapModelIdForProvider,
  normalizeBaseUrl,
  normalizeProvider,
  rewriteStartArgsForModel,
  uniqueStrings,
} from "./providers.mjs";

const argv = process.argv.slice(2);
const MODEL_ARG_FLAGS = new Set(["--model", "--hf_model_repo_id", "--served-model-name"]);

main().catch((error) => {
  console.error(`Lexis error: ${error.message}`);
  process.exit(1);
});

async function main() {
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
    printHelp();
    return;
  }

  const command = argv[0];

  if (command === "setup") {
    await handleSetup(argv.slice(1));
    return;
  }

  if (command === "hooks") {
    await handleHooks(argv.slice(1));
    return;
  }

  if (command === "uninstall") {
    await handleUninstall(argv.slice(1));
    return;
  }

  if (command === "config") {
    await handleConfig(argv.slice(1));
    return;
  }

  if (command === "doctor") {
    await handleDoctor();
    return;
  }

  if (command === "web-search") {
    await handleWebSearch(argv.slice(1));
    return;
  }

  if (command === "mcp") {
    await handleMcp(argv.slice(1));
    return;
  }

  if (command === "help") {
    printHelp();
    return;
  }

  if (command === "run") {
    await handleRun(argv.slice(1));
    return;
  }

  await handleRun(argv);
}

async function handleRun(runArgs) {
  const { options, positional } = parseFlags(runArgs);
  const prompt = positional.join(" ").trim();

  if (!prompt) {
    throw new Error("No prompt provided. Example: lexis run setup hackatime in zsh");
  }

  const config = await loadConfig();
  const llm = resolveLlmConfig(config.llm);

  if (isBareHelpPrompt(prompt)) {
    const hookMode = normalizeHookMode(config.execution?.hookMode) || "auto";
    printNaturalHelp({ hookMode });
    return;
  }

  const model = options.model || config.model || llm.model;
  const platform = process.platform === "win32" ? "windows" : "unix";
  const shell = detectShell();
  const context = {
    platform,
    shell,
    cwd: process.cwd(),
    hostname: os.hostname(),
    username: os.userInfo().username,
  };

  const webMode = resolveWebMode({
    optionValue: options["web-mode"],
    configValue: config.webSearch.mode,
  });

  const allowWeb = Boolean(options["allow-web"]) || Boolean(config.webSearch.enabled);
  const shouldSearchWeb = shouldUseWebSearch({
    allowWeb,
    mode: webMode,
  });

  let webContext = [];
  if (shouldSearchWeb) {
    webContext = await fetchWebContext({
      query: prompt,
      config: config.webSearch,
    });
  }

  const systemPrompt = await loadSystemPrompt();
  let plan;

  try {
    plan = await generatePlanWithRecovery({
      llm,
      model,
      systemPrompt,
      userPrompt: prompt,
      context,
      webContext,
    });
  } catch (error) {
    if (webContext.length > 0) {
      plan = buildManualReviewFallbackPlan({
        platform,
        webContext,
      });
    } else {
      throw error;
    }
  }

  if (
    allowWeb &&
    webMode === "auto" &&
    webContext.length === 0 &&
    shouldRetryWithWeb({
      plan,
      autoRetryBelowConfidence: config.webSearch?.autoRetryBelowConfidence,
    })
  ) {
    const fetched = await fetchWebContext({
      query: prompt,
      config: config.webSearch,
    });

    if (fetched.length > 0) {
      webContext = fetched;
      try {
        plan = await generatePlanWithRecovery({
          llm,
          model,
          systemPrompt,
          userPrompt: prompt,
          context,
          webContext,
        });
      } catch (error) {
        if (webContext.length > 0) {
          plan = buildManualReviewFallbackPlan({
            platform,
            webContext,
          });
        } else {
          throw error;
        }
      }
    }
  }

  for (const step of plan.commands) {
    step.platform = reconcileCommandPlatform({
      plannedPlatform: step.platform,
      runtimePlatform: platform,
      command: step.command,
    });
    step.requires_confirmation =
      step.requires_confirmation ||
      shouldRequireConfirmation({
        risk: step.risk,
        confidence: plan.confidence,
        configuredThreshold: config.execution.askConfirmationAt,
      });
  }

  const requiresConfirmation =
    plan.requires_confirmation ||
    plan.commands.some((step) => step.requires_confirmation) ||
    shouldRequireConfirmation({
      risk: plan.overall_risk,
      confidence: plan.confidence,
      configuredThreshold: config.execution.askConfirmationAt,
    });

  const dryRun = Boolean(options["dry-run"]);
  const force = Boolean(options.force);
  const autoYes = Boolean(options.yes);
  const requiresDoubleConfirmation =
    !force &&
    !dryRun &&
    isPlanCritical(plan);

  const quiet = Boolean(options.quiet);

  if (options.json) {
    process.stdout.write(JSON.stringify({ plan }, null, 2) + "\n");
  } else if (!quiet) {
    printPlan({ plan, model });
  }

  const executeWithoutPrompt = !requiresDoubleConfirmation && (autoYes || (!requiresConfirmation && !dryRun));
  let approved = executeWithoutPrompt;

  if (!executeWithoutPrompt && !dryRun) {
    if (requiresDoubleConfirmation) {
      approved = await askForCriticalConfirmation({
        prompt,
        commands: plan.commands,
      });
    } else {
      approved = await askForConfirmation({
        risk: plan.overall_risk,
        prompt,
        commands: plan.commands,
      });
    }
  }

  if (!approved) {
    process.exit(0);
  }

  const results = await executePlan(plan, {
    dryRun,
    platform: process.platform,
  });

  const failed = results.find((result) => result.exitCode && result.exitCode !== 0);
  if (failed) {
    process.exit(failed.exitCode ?? 1);
  }

  if (quiet && !dryRun && isPlanSilent(results)) {
    process.stdout.write(`Lexis: ${plan.summary}\n`);
  }
}

async function handleSetup(args) {
  const { options } = parseFlags(args);
  const models = parseCsv(options.models);
  const modelProfile = typeof options.profile === "string" ? options.profile.trim().toLowerCase() : "";
  if (modelProfile && !["light", "balanced", "heavy"].includes(modelProfile)) {
    throw new Error("Usage: lexis setup --profile <light|balanced|heavy>");
  }

  const defaultModel = typeof options["default-model"] === "string" ? options["default-model"].trim() : "";
  const mcpCommand = typeof options["mcp-command"] === "string" ? options["mcp-command"].trim() : "";
  const mcpArgs = parseCsv(options["mcp-args"]);
  const mcpEnv = parseEnvCsv(options["mcp-env"]);
  const hookMode = await resolveSetupHookMode(options["hook-mode"]);

  const result = await runSetup({
    models,
    modelProfile,
    defaultModel,
    enableWebSearch: Boolean(options["enable-web-search"]),
    webProvider: typeof options["web-provider"] === "string" ? options["web-provider"].trim() : "",
    mcpCommand,
    mcpArgs,
    mcpTool: typeof options["mcp-tool"] === "string" ? options["mcp-tool"].trim() : "",
    mcpEnv,
    hookMode,
  });

  process.stdout.write("Lexis setup completed.\n");
  process.stdout.write(`- config: ${result.configPath}\n`);
  process.stdout.write(`- profile: ${result.modelProfile}\n`);
  process.stdout.write(`- models: ${result.models.join(", ")}\n`);
  process.stdout.write(`- default model: ${result.defaultModel}\n`);
  process.stdout.write(`- hooks touched: ${result.hookResult.results.length}\n`);
  process.stdout.write(`- hook mode: ${result.hookMode}\n`);
  process.stdout.write(`- change model later: lx config set-model <model>\n`);
  process.stdout.write(`- change hook mode later: lx config set-hook-mode <auto|lx>\n`);
  process.stdout.write(`- runtime provider: ${result.runtime.provider}\n`);
  process.stdout.write(`- runtime endpoint: ${result.runtime.baseUrl}\n`);
  process.stdout.write(`- python: ${result.runtime.python}\n`);
  process.stdout.write(`- runtime warmup: ${result.runtime.warmed ? "ok" : "incomplete"}\n`);
  if (result.runtime.warmupMessage) {
    process.stdout.write(`- warmup note: ${result.runtime.warmupMessage}\n`);
  }
  if (process.platform === "win32") {
    process.stdout.write("- windows note: PowerShell supports hook mode; cmd.exe supports explicit lx/lexis commands only.\n");
    if (result.runtime.provider === "llamacpp") {
      process.stdout.write("- gpu note: GTX 10xx-class cards cannot use vLLM here; Lexis will try CUDA-enabled llama.cpp and otherwise fall back to CPU.\n");
    }
  }

  if (result.webSearch) {
    process.stdout.write(`- web provider: ${result.webSearch.provider}\n`);
    if (result.webSearch.provider === "mcp") {
      process.stdout.write(`- mcp command: ${result.webSearch.command || "(not set)"}\n`);
      process.stdout.write(`- mcp tool: ${result.webSearch.toolName || "(auto)"}\n`);
    }
  }
}

async function handleHooks(args) {
  const action = args[0];
  const { options } = parseFlags(args.slice(1));

  if (action === "install") {
    const config = await loadConfig();
    const selectedMode =
      normalizeHookMode(options.mode) || normalizeHookMode(config.execution?.hookMode) || "auto";
    const result = await installHooks({ mode: selectedMode });

    process.stdout.write(`hook mode: ${selectedMode}\n`);
    for (const item of result.results) {
      process.stdout.write(`${item.changed ? "updated" : "unchanged"} ${item.filePath}\n`);
    }
    return;
  }

  if (action === "uninstall") {
    const result = await uninstallHooks();
    for (const item of result.results) {
      process.stdout.write(`${item.changed ? "updated" : "unchanged"} ${item.filePath}\n`);
    }
    return;
  }

  throw new Error("Usage: lexis hooks <install|uninstall> [--mode auto|lx]");
}

async function handleUninstall(args) {
  const { options } = parseFlags(args);
  const autoYes = Boolean(options.yes);
  const config = await loadConfig();
  const history = await loadModelHistory();

  let approved = autoYes;
  if (!approved) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      const answer = (await rl.question("Uninstall Lexis (hooks + global package)? [y/N] ")).trim();
      approved = /^y(es)?$/i.test(answer);
    } finally {
      rl.close();
    }
  }

  if (!approved) {
    process.stdout.write("Uninstall cancelled.\n");
    return;
  }

  const hookResult = await uninstallHooks();
  for (const item of hookResult.results) {
    process.stdout.write(`${item.changed ? "updated" : "unchanged"} ${item.filePath}\n`);
  }

  const packageResults = uninstallGlobalPackages();
  for (const item of packageResults) {
    process.stdout.write(`${item.ok ? "ok" : "skip"} npm uninstall -g ${item.packageName}\n`);
  }

  const cleanupResults = await cleanupLexisRuntimeArtifacts(config, history);
  for (const item of cleanupResults) {
    if (item.status === "removed") {
      process.stdout.write(`removed ${item.label}: ${item.path}\n`);
      continue;
    }
    if (item.status === "failed") {
      process.stdout.write(`warn ${item.label}: ${item.path} (${item.message})\n`);
    }
  }

  process.stdout.write("Lexis uninstall complete.\n");
}

function uninstallGlobalPackages() {
  const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
  const packageCandidates = uniqueStrings([
    process.env.LEXIS_NPM_PACKAGE,
    "@hridyacodes/lexis",
    "lexis-cli",
    "lexis",
  ]);
  const results = [];

  for (const packageName of packageCandidates) {
    const run = spawnSync(npmBin, ["uninstall", "-g", packageName], {
      stdio: "pipe",
      encoding: "utf8",
    });

    const combined = `${run.stdout || ""}\n${run.stderr || ""}`;
    const ok = run.status === 0;
    const notInstalled = /not\s+installed|up to date|not in the npm registry|missing/i.test(combined);

    results.push({
      packageName,
      ok: ok || notInstalled,
    });
  }

  return results;
}

async function cleanupLexisRuntimeArtifacts(config, history) {
  const cleanupTargets = [
    {
      label: "runtime venv",
      path: getRuntimeVenvDir(),
    },
    {
      label: "config",
      path: path.dirname(getConfigPath()),
    },
    {
      label: "data",
      path: path.dirname(getAuditLogPath()),
    },
    {
      label: "web cache",
      path: path.join(os.homedir(), ".cache", "lexis"),
    },
  ];

  const configuredModels = uniqueStrings([
    ...collectConfiguredModels(config),
    ...(Array.isArray(history?.models) ? history.models : []),
  ]);
  const modelCacheTargets = buildModelCacheTargets(configuredModels);
  const providerCacheTargets = buildProviderCacheTargets(config, history);

  for (const target of modelCacheTargets) {
    cleanupTargets.push({
      label: `model cache (${target.model})`,
      path: target.path,
    });
  }

  for (const target of providerCacheTargets) {
    cleanupTargets.push(target);
  }

  const uniqueTargets = dedupeCleanupTargets(cleanupTargets);
  const results = [];

  for (const target of uniqueTargets) {
    const result = await removePathIfPresent(target.path);
    results.push({
      ...result,
      label: target.label,
      path: target.path,
    });
  }

  return results;
}

async function removePathIfPresent(targetPath) {
  if (!targetPath || typeof targetPath !== "string") {
    return { status: "skipped" };
  }

  const exists = await pathExists(targetPath);
  if (!exists) {
    return { status: "skipped" };
  }

  try {
    await fs.rm(targetPath, { recursive: true, force: true });
    return { status: "removed" };
  } catch (error) {
    return {
      status: "failed",
      message: error?.message || "unknown error",
    };
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function getRuntimeVenvDir() {
  if (process.platform === "win32") {
    const localAppData =
      typeof process.env.LOCALAPPDATA === "string" && process.env.LOCALAPPDATA.trim()
        ? process.env.LOCALAPPDATA.trim()
        : path.join(os.homedir(), "AppData", "Local");

    return path.join(localAppData, "Lexis", "runtime-venv");
  }

  const xdgDataHome =
    typeof process.env.XDG_DATA_HOME === "string" && process.env.XDG_DATA_HOME.trim()
      ? process.env.XDG_DATA_HOME.trim()
      : path.join(os.homedir(), ".local", "share");

  return path.join(xdgDataHome, "lexis", "runtime-venv");
}

function collectConfiguredModels(config) {
  const models = uniqueStrings([
    config?.model,
    config?.llm?.model,
  ]);

  const startArgs = Array.isArray(config?.llm?.start?.args) ? config.llm.start.args.map((item) => String(item)) : [];
  for (let index = 0; index < startArgs.length; index += 1) {
    const value = startArgs[index];
    if (!MODEL_ARG_FLAGS.has(value)) {
      continue;
    }

    const next = startArgs[index + 1];
    if (typeof next === "string" && next.trim()) {
      models.push(next.trim());
      index += 1;
    }
  }

  return uniqueStrings(models);
}

function buildModelCacheTargets(models) {
  if (!Array.isArray(models) || models.length === 0) {
    return [];
  }

  const hubRoots = getHuggingFaceHubRoots();
  const targets = [];

  for (const model of models) {
    const normalized = normalizeModelRepoId(model);
    if (!normalized || !normalized.includes("/")) {
      continue;
    }

    const modelDir = `models--${normalized.replace(/\//g, "--")}`;
    for (const root of hubRoots) {
      targets.push({
        model: normalized,
        path: path.join(root, modelDir),
      });
    }
  }

  return dedupeModelTargets(targets);
}

function getHuggingFaceHubRoots() {
  const roots = [];

  if (typeof process.env.HF_HUB_CACHE === "string" && process.env.HF_HUB_CACHE.trim()) {
    roots.push(process.env.HF_HUB_CACHE.trim());
  }

  if (typeof process.env.HUGGINGFACE_HUB_CACHE === "string" && process.env.HUGGINGFACE_HUB_CACHE.trim()) {
    roots.push(process.env.HUGGINGFACE_HUB_CACHE.trim());
  }

  if (typeof process.env.HF_HOME === "string" && process.env.HF_HOME.trim()) {
    roots.push(path.join(process.env.HF_HOME.trim(), "hub"));
  }

  if (typeof process.env.TRANSFORMERS_CACHE === "string" && process.env.TRANSFORMERS_CACHE.trim()) {
    roots.push(process.env.TRANSFORMERS_CACHE.trim());
  }

  const homeCacheRoot = path.join(os.homedir(), ".cache", "huggingface", "hub");
  roots.push(homeCacheRoot);

  const xdgCacheHome =
    typeof process.env.XDG_CACHE_HOME === "string" && process.env.XDG_CACHE_HOME.trim()
      ? process.env.XDG_CACHE_HOME.trim()
      : path.join(os.homedir(), ".cache");
  roots.push(path.join(xdgCacheHome, "huggingface", "hub"));

  if (process.platform === "win32") {
    const localAppData =
      typeof process.env.LOCALAPPDATA === "string" && process.env.LOCALAPPDATA.trim()
        ? process.env.LOCALAPPDATA.trim()
        : path.join(os.homedir(), "AppData", "Local");
    roots.push(path.join(localAppData, "huggingface", "hub"));

    const appData =
      typeof process.env.APPDATA === "string" && process.env.APPDATA.trim()
        ? process.env.APPDATA.trim()
        : path.join(os.homedir(), "AppData", "Roaming");
    roots.push(path.join(appData, "huggingface", "hub"));
  }

  return uniqueStrings(roots);
}

function buildProviderCacheTargets(config, history) {
  const providers = uniqueStrings([
    String(config?.llm?.provider || "").trim().toLowerCase(),
    ...(Array.isArray(history?.providers) ? history.providers : []),
  ]);
  const targets = [];

  for (const provider of providers) {
    if (provider === "vllm") {
      for (const cacheRoot of getVllmCacheRoots()) {
        targets.push({
          label: "vllm cache",
          path: cacheRoot,
        });
      }
    }
  }

  return dedupeCleanupTargets(targets);
}

function getVllmCacheRoots() {
  const roots = [];

  if (typeof process.env.VLLM_CACHE_ROOT === "string" && process.env.VLLM_CACHE_ROOT.trim()) {
    roots.push(process.env.VLLM_CACHE_ROOT.trim());
  }

  const xdgCacheHome =
    typeof process.env.XDG_CACHE_HOME === "string" && process.env.XDG_CACHE_HOME.trim()
      ? process.env.XDG_CACHE_HOME.trim()
      : path.join(os.homedir(), ".cache");

  roots.push(path.join(xdgCacheHome, "vllm"));
  roots.push(path.join(os.homedir(), ".cache", "vllm"));

  return uniqueStrings(roots);
}

function normalizeModelRepoId(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function dedupeModelTargets(targets) {
  const seen = new Set();
  const output = [];

  for (const item of targets) {
    const key = `${item.model}|${item.path}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(item);
  }

  return output;
}

function dedupeCleanupTargets(targets) {
  const seen = new Set();
  const output = [];

  for (const item of targets) {
    if (!item?.path || seen.has(item.path)) {
      continue;
    }
    seen.add(item.path);
    output.push(item);
  }

  return output;
}

async function handleConfig(args) {
  const mode = args[0] || "show";

  if (mode === "show") {
    const config = await loadConfig();
    process.stdout.write(JSON.stringify(config, null, 2) + "\n");
    return;
  }

  if (mode === "enable-web") {
    const config = await loadConfig();
    config.webSearch.enabled = true;
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "disable-web") {
    const config = await loadConfig();
    config.webSearch.enabled = false;
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-web-provider") {
    const provider = (args[1] || "").trim();
    if (provider !== "mcp") {
      throw new Error("Usage: lexis config set-web-provider <mcp>");
    }

    const config = await loadConfig();
    config.webSearch.provider = provider;
    if (provider === "mcp" && !config.webSearch.mcp.command) {
      config.webSearch.mcp.command = "lexis";
    }
    if (provider === "mcp" && (!Array.isArray(config.webSearch.mcp.args) || config.webSearch.mcp.args.length === 0)) {
      config.webSearch.mcp.args = ["mcp", "serve-web"];
    }
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-web-max-results") {
    const raw = args[1];
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0 || value > 10) {
      throw new Error("Usage: lexis config set-web-max-results <1-10>");
    }

    const config = await loadConfig();
    config.webSearch.maxResults = Math.floor(value);
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-web-timeout") {
    const raw = args[1];
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 1000 || value > 120000) {
      throw new Error("Usage: lexis config set-web-timeout <1000-120000>");
    }

    const config = await loadConfig();
    config.webSearch.timeoutMs = Math.floor(value);
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-web-mode") {
    const value = (args[1] || "").trim().toLowerCase();
    if (!["off", "auto", "always"].includes(value)) {
      throw new Error("Usage: lexis config set-web-mode <off|auto|always>");
    }

    const config = await loadConfig();
    config.webSearch.mode = value;
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-web-auto-threshold") {
    const raw = args[1];
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error("Usage: lexis config set-web-auto-threshold <0-1>");
    }

    const config = await loadConfig();
    config.webSearch.autoRetryBelowConfidence = Number(value.toFixed(2));
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-mcp-command") {
    const command = (args[1] || "").trim();
    if (!command) {
      throw new Error("Usage: lexis config set-mcp-command <command>");
    }

    const config = await loadConfig();
    config.webSearch.provider = "mcp";
    config.webSearch.mcp.command = command;
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-mcp-args") {
    const argsCsv = args[1] || "";
    const config = await loadConfig();
    config.webSearch.provider = "mcp";
    config.webSearch.mcp.args = parseCsv(argsCsv);
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-mcp-tool") {
    const tool = (args[1] || "").trim();
    if (!tool) {
      throw new Error("Usage: lexis config set-mcp-tool <tool-name>");
    }

    const config = await loadConfig();
    config.webSearch.provider = "mcp";
    config.webSearch.mcp.toolName = tool;
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-mcp-env") {
    const envCsv = args[1] || "";
    const env = parseEnvCsv(envCsv);
    const config = await loadConfig();
    config.webSearch.provider = "mcp";
    config.webSearch.mcp.env = {
      ...(config.webSearch.mcp.env || {}),
      ...env,
    };
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-model") {
    const model = (args[1] || "").trim();
    if (!model) {
      throw new Error("Usage: lexis config set-model <model>");
    }

    const config = await loadConfig();
    const machine = getCurrentMachineProfile();
    const provider = normalizeProvider(config.llm?.provider, machine);
    const mappedModel = mapModelIdForProvider(model, provider, machine) || model;
    config.model = mappedModel;
    config.llm = {
      ...(config.llm || {}),
      provider,
      model: mappedModel,
      start: rewriteStartArgsForModel(config.llm?.start, provider, mappedModel, config.llm?.baseUrl, machine),
    };
    const filePath = await saveConfig(config);
    await recordModelUsage({ provider, models: [mappedModel] });
    process.stdout.write(`Updated ${filePath}\n`);

    const llm = resolveLlmConfig(config.llm);
    process.stdout.write(`Warming model ${mappedModel}...\n`);
    const warmup = await warmupLlmModel({
      llm,
      model: mappedModel,
    });
    process.stdout.write(`Warmup: ${warmup.ok ? "ok" : "incomplete"}\n`);
    if (warmup.message) {
      process.stdout.write(`${warmup.message}\n`);
    }
    return;
  }

  if (mode === "set-llm-provider") {
    const machine = getCurrentMachineProfile();
    const provider = normalizeProvider(args[1], machine);
    if (!["mlx", "vllm", "llamacpp", "ollama"].includes(provider)) {
      throw new Error("Usage: lexis config set-llm-provider <mlx|vllm|llamacpp|ollama>");
    }
    if (!isProviderSupported(provider, machine)) {
      throw new Error(getProviderSupportError(provider, machine));
    }

    const config = await loadConfig();
    const currentModel =
      typeof config.llm?.model === "string" && config.llm.model.trim()
        ? config.llm.model.trim()
        : typeof config.model === "string" && config.model.trim()
          ? config.model.trim()
          : defaultModelForProvider(provider);
    const mappedModel = mapModelIdForProvider(currentModel, provider, machine) || defaultModelForProvider(provider, machine);

    config.model = mappedModel;
    config.llm = {
      ...(config.llm || {}),
      provider,
      baseUrl: defaultBaseUrlForProvider(provider, machine),
      model: mappedModel,
      start: rewriteStartArgsForModel(
        config.llm?.start,
        provider,
        mappedModel,
        defaultBaseUrlForProvider(provider, machine),
        machine
      ),
    };
    const filePath = await saveConfig(config);
    await recordModelUsage({ provider, models: [mappedModel] });
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-llm-base-url") {
    const value = (args[1] || "").trim();
    if (!value) {
      throw new Error("Usage: lexis config set-llm-base-url <url>");
    }

    const config = await loadConfig();
    const machine = getCurrentMachineProfile();
    config.llm = {
      ...(config.llm || {}),
      baseUrl: value.replace(/\/+$/, ""),
      start: rewriteStartArgsForModel(
        config.llm?.start,
        normalizeProvider(config.llm?.provider, machine),
        config.llm?.model || config.model,
        value,
        machine
      ),
    };
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-llm-start-command") {
    const command = (args[1] || "").trim();
    if (!command) {
      throw new Error("Usage: lexis config set-llm-start-command <command>");
    }

    const config = await loadConfig();
    config.llm = {
      ...(config.llm || {}),
      start: {
        ...(config.llm?.start || {}),
        command,
      },
    };
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-llm-start-args") {
    const argsCsv = args[1] || "";
    const startArgs = parseCsv(argsCsv);
    const config = await loadConfig();
    config.llm = {
      ...(config.llm || {}),
      start: {
        ...(config.llm?.start || {}),
        args: startArgs,
      },
    };
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-risk-mode") {
    const value = (args[1] || "").trim().toLowerCase();
    if (value !== "model") {
      throw new Error("Usage: lexis config set-risk-mode <model>");
    }

    const config = await loadConfig();
    config.execution = {
      ...(config.execution || {}),
      riskMode: value,
    };
    const filePath = await saveConfig(config);
    process.stdout.write(`Updated ${filePath}\n`);
    return;
  }

  if (mode === "set-hook-mode") {
    const value = normalizeHookMode(args[1]);
    if (!value) {
      throw new Error("Usage: lexis config set-hook-mode <auto|lx>");
    }

    const config = await loadConfig();
    config.execution = {
      ...(config.execution || {}),
      hookMode: value,
    };
    const filePath = await saveConfig(config);
    const hookResult = await installHooks({ mode: value });

    process.stdout.write(`Updated ${filePath}\n`);
    process.stdout.write(`hook mode: ${value}\n`);
    if (hookResult?.results?.length) {
      for (const item of hookResult.results) {
        process.stdout.write(`${item.changed ? "updated" : "unchanged"} ${item.filePath}\n`);
      }
    }
    return;
  }

  throw new Error(
    "Usage: lexis config [show|set-model|set-llm-provider|set-llm-base-url|set-llm-start-command|set-llm-start-args|set-risk-mode|set-hook-mode|enable-web|disable-web|set-web-provider|set-web-max-results|set-web-timeout|set-mcp-command|set-mcp-args|set-mcp-tool|set-mcp-env]"
  );
}

async function handleDoctor() {
  const config = await loadConfig();

  process.stdout.write("Lexis doctor\n");
  process.stdout.write(`- node: ${process.version}\n`);
  process.stdout.write(`- platform: ${process.platform}\n`);
  process.stdout.write(`- shell: ${detectShell()}\n`);
  process.stdout.write(`- cwd: ${process.cwd()}\n`);
  process.stdout.write(`- config: ${getConfigPath()}\n`);
  process.stdout.write(`- audit log: ${getAuditLogPath()}\n`);
  process.stdout.write(`- model: ${config.model}\n`);
  const llm = resolveLlmConfig(config.llm);
  process.stdout.write(`- runtime provider: ${llm.provider}\n`);
  process.stdout.write(`- runtime endpoint: ${llm.baseUrl}\n`);
  process.stdout.write(`- runtime model: ${llm.model || config.model}\n`);
  process.stdout.write(`- runtime start command: ${llm.start.command || "(not set)"}\n`);
  process.stdout.write(`- web search: ${config.webSearch.enabled ? "enabled" : "disabled"} (${config.webSearch.provider})\n`);
  process.stdout.write(`- web mode: ${config.webSearch.mode || "auto"}\n`);
  process.stdout.write(`- web auto threshold: ${config.webSearch.autoRetryBelowConfidence ?? 0.82}\n`);
  process.stdout.write(`- risk mode: ${config.execution?.riskMode || "model"}\n`);
  process.stdout.write(`- hook mode: ${normalizeHookMode(config.execution?.hookMode) || "auto"}\n`);
  process.stdout.write(`- web max results: ${config.webSearch.maxResults}\n`);
  process.stdout.write(`- web timeout: ${config.webSearch.timeoutMs}ms\n`);

  if (config.webSearch.provider === "mcp") {
    process.stdout.write(`- mcp command: ${config.webSearch.mcp.command || "(not set)"}\n`);
    process.stdout.write(`- mcp args: ${(config.webSearch.mcp.args || []).join(" ") || "(none)"}\n`);
    process.stdout.write(`- mcp tool: ${config.webSearch.mcp.toolName || "(auto)"}\n`);
    const envKeys = Object.keys(config.webSearch.mcp.env || {});
    process.stdout.write(`- mcp env keys: ${envKeys.join(", ") || "(none)"}\n`);
  }
}

async function handleWebSearch(args) {
  const { options, positional } = parseFlags(args);
  const query = positional.join(" ").trim();
  if (!query) {
    throw new Error("Usage: lexis web-search <query>");
  }

  const config = await loadConfig();
  const provider = typeof options.provider === "string" ? options.provider.trim() : config.webSearch.provider;
  if (provider !== "mcp") {
    throw new Error("Only provider 'mcp' is supported. Use: --provider mcp");
  }

  const maxResults =
    typeof options["max-results"] === "string" && Number.isFinite(Number(options["max-results"]))
      ? Math.max(1, Math.min(10, Math.floor(Number(options["max-results"]))))
      : config.webSearch.maxResults;

  const results = await fetchWebContext({
    query,
    config: {
      ...config.webSearch,
      enabled: true,
      provider,
      maxResults,
    },
  });

  process.stdout.write(JSON.stringify({ query, results }, null, 2) + "\n");
}

async function handleMcp(args) {
  const subcommand = args[0] || "";

  if (subcommand === "serve-web") {
    await runLocalWebSearchMcpServer();
    return;
  }

  throw new Error("Usage: lexis mcp serve-web");
}

function parseFlags(args) {
  const booleanFlags = new Set([
    "yes",
    "dry-run",
    "json",
    "allow-web",
    "quiet",
    "force",
    "enable-web-search",
  ]);

  const options = {};
  const positional = [];

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];

    if (!value.startsWith("--")) {
      positional.push(value);
      continue;
    }

    const key = value.slice(2);
    const next = args[index + 1];

    if (booleanFlags.has(key)) {
      options[key] = true;
      continue;
    }

    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return { options, positional };
}

function detectShell() {
  if (typeof process.env.LEXIS_SHELL === "string" && process.env.LEXIS_SHELL.trim()) {
    return process.env.LEXIS_SHELL.trim();
  }

  if (process.platform === "win32") {
    const comSpec = String(process.env.ComSpec || "").trim();
    const comSpecBase = comSpec ? path.win32.basename(comSpec).toLowerCase() : "";
    if (comSpecBase === "powershell.exe" || comSpecBase === "pwsh.exe") {
      return "powershell";
    }
    return "cmd";
  }
  const shell = process.env.SHELL;
  return shell ? path.basename(shell) : "sh";
}

function resolveWebMode({ optionValue, configValue }) {
  const candidate = typeof optionValue === "string" ? optionValue.trim().toLowerCase() : "";
  if (["off", "auto", "always"].includes(candidate)) {
    return candidate;
  }

  const configured = typeof configValue === "string" ? configValue.trim().toLowerCase() : "";
  if (["off", "auto", "always"].includes(configured)) {
    return configured;
  }

  return "auto";
}

function shouldUseWebSearch({ allowWeb, mode }) {
  if (!allowWeb || mode === "off") {
    return false;
  }

  return mode === "always";
}

function shouldRetryWithWeb({ plan, autoRetryBelowConfidence }) {
  const threshold =
    typeof autoRetryBelowConfidence === "number" && Number.isFinite(autoRetryBelowConfidence)
      ? Math.max(0, Math.min(1, autoRetryBelowConfidence))
      : 0.82;

  const confidence = typeof plan?.confidence === "number" ? plan.confidence : 0;
  return confidence < threshold;
}

function isPlanSilent(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return true;
  }

  return results.every((result) => {
    const stdoutBytes = Number(result?.stdoutBytes || 0);
    const stderrBytes = Number(result?.stderrBytes || 0);
    return stdoutBytes + stderrBytes === 0;
  });
}

function reconcileCommandPlatform({ plannedPlatform, runtimePlatform, command }) {
  const normalized = typeof plannedPlatform === "string" ? plannedPlatform.toLowerCase() : "all";
  if (normalized === "all") {
    return "all";
  }

  if (normalized === runtimePlatform) {
    return normalized;
  }

  const text = String(command || "");
  if (runtimePlatform === "unix" && normalized === "windows") {
    return isLikelyWindowsOnly(text) ? "windows" : "all";
  }

  if (runtimePlatform === "windows" && normalized === "unix") {
    return isLikelyUnixOnly(text) ? "unix" : "all";
  }

  return normalized;
}

function isLikelyWindowsOnly(command) {
  return /(^|\s)(powershell|pwsh|cmd|winget|choco|taskkill|tasklist|sc\.exe|reg\.exe|Get-[A-Za-z]+|Set-[A-Za-z]+)(\s|$)|\\|\.exe(\s|$)/i.test(
    command
  );
}

function isLikelyUnixOnly(command) {
  return /(^|\s)(sudo|apt|apt-get|yum|dnf|pacman|brew|systemctl|launchctl|pkill|killall|chmod|chown)(\s|$)|\$\(|\/dev\//i.test(
    command
  );
}

function printPlan({ plan, model }) {
  process.stdout.write("=== Lexis Plan ===\n");
  process.stdout.write(`Model      : ${model}\n`);
  process.stdout.write(`Summary    : ${plan.summary}\n`);
  process.stdout.write(`Risk       : ${plan.overall_risk}\n`);
  process.stdout.write(`Confidence : ${plan.confidence.toFixed(2)}\n`);
  process.stdout.write("Commands:\n");

  for (const [index, step] of plan.commands.entries()) {
    const confirmTag = step.requires_confirmation ? " confirm" : " auto";
    process.stdout.write(`${index + 1}. [${step.risk}${confirmTag}] ${step.command}\n`);
  }

  process.stdout.write("==================\n");
}

function buildManualReviewFallbackPlan({ platform, webContext }) {
  const firstSource = webContext[0];
  const sourceUrl = firstSource?.url || "";
  const sourceTitle = firstSource?.title || "Official documentation";

  const message = sourceUrl
    ? `Unable to derive a reliable install command automatically. Review: ${sourceUrl}`
    : "Unable to derive a reliable install command automatically. Review the official docs.";

  const command =
    platform === "windows"
      ? `powershell -NoProfile -Command \"Write-Output '${message.replace(/'/g, "''")}'\"`
      : `printf '%s\\n' ${JSON.stringify(message)}`;

  return {
    summary: "Manual setup review required",
    overall_risk: "moderate",
    confidence: 0.55,
    requires_confirmation: true,
    commands: [
      {
        command,
        intent: "manual review fallback",
        risk: "moderate",
        requires_confirmation: true,
        platform: platform === "windows" ? "windows" : "unix",
        rollback: "not_applicable",
      },
    ],
    preflight_checks: [
      "Model could not produce a reliable install command in time.",
      "Review official setup instructions before executing install steps.",
    ],
    sources: sourceUrl
      ? [
          {
            title: sourceTitle,
            url: sourceUrl,
          },
        ]
      : [],
  };
}

async function generatePlanWithRecovery({
  llm,
  model,
  systemPrompt,
  userPrompt,
  context,
  webContext,
}) {
  try {
    return await generatePlanWithLLM({
      llm,
      model,
      systemPrompt,
      userPrompt,
      context,
      webContext,
    });
  } catch (error) {
    if (!isLlmConnectionError(error)) {
      throw error;
    }

    await ensureLlmServerReadyForRun(llm);

    return generatePlanWithLLM({
      llm,
      model,
      systemPrompt,
      userPrompt,
      context,
      webContext,
    });
  }
}

function isLlmConnectionError(error) {
  const message = String(error?.message || "").toLowerCase();
  if (!message) {
    return false;
  }

  return (
    message.includes("fetch failed") ||
    message.includes("econnrefused") ||
    message.includes("timed out") ||
    message.includes("connect") ||
    message.includes("network")
  );
}

async function ensureLlmServerReadyForRun(llm) {
  if (await isLlmServerReady(llm.provider, llm.baseUrl)) {
    return true;
  }

  const server = startLlmServerInBackground(llm);
  const maxWaitMs = Math.min(180_000, estimateModelTimeoutMs(llm?.model) + 30_000);
  const startedAt = Date.now();

  while (Date.now() - startedAt < maxWaitMs) {
    await sleep(1000);
    if (await isLlmServerReady(llm.provider, llm.baseUrl)) {
      server?.detach?.();
      return true;
    }

    if (server?.hasExited?.()) {
      if (isPortConflictError(server.getRecentLogs())) {
        const existing = await waitForExistingLlmServer(llm.provider, llm.baseUrl, 10_000);
        if (existing) {
          server.detach();
          return true;
        }
      }

      throw new Error(
        buildBackgroundStartupError({
          baseUrl: llm.baseUrl,
          provider: llm.provider,
          summary: server.getExitSummary(),
          recentLogs: server.getRecentLogs(),
        })
      );
    }
  }

  server?.terminate?.();
  throw new Error(
    buildBackgroundStartupError({
      baseUrl: llm.baseUrl,
      provider: llm.provider,
      summary: `timed out after ${Math.ceil(maxWaitMs / 1000)}s`,
      recentLogs: server?.getRecentLogs?.() || "",
    })
  );
}

async function isLlmServerReady(provider, baseUrl) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  for (const endpoint of getProviderReadinessEndpoints(provider)) {
    try {
      const response = await fetch(`${normalizedBaseUrl}${endpoint}`, {
        method: "GET",
        signal: AbortSignal.timeout(2500),
      });
      if (!response.ok) {
        return false;
      }
      if (endpoint === "/v1/models") {
        const payload = await response.json().catch(() => null);
        if (payload && Array.isArray(payload.data) && payload.data.length === 0) {
          return false;
        }
      }
    } catch {
      return false;
    }
  }

  return true;
}

function startLlmServerInBackground(llm) {
  const command = llm?.start?.command;
  const args = Array.isArray(llm?.start?.args) ? llm.start.args : [];
  if (!command) {
    return null;
  }

  const logChunks = [];
  let exited = false;
  let exitCode = null;
  let signalCode = null;

  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      env: process.env,
    });

    const appendLogs = (streamName, chunk) => {
      const text = String(chunk || "").replace(/\0/g, "");
      if (!text) {
        return;
      }

      logChunks.push(`[${streamName}] ${text}`);
      while (logChunks.join("").length > 12000) {
        logChunks.shift();
      }
    };

    child.stdout?.on("data", (chunk) => appendLogs("stdout", chunk));
    child.stderr?.on("data", (chunk) => appendLogs("stderr", chunk));
    child.once("exit", (code, signal) => {
      exited = true;
      exitCode = code;
      signalCode = signal;
    });

    return {
      hasExited() {
        return exited;
      },
      getExitSummary() {
        if (!exited) {
          return "process exited before readiness";
        }
        if (signalCode) {
          return `process exited with signal ${signalCode}`;
        }
        return `process exited with code ${exitCode ?? "unknown"}`;
      },
      getRecentLogs() {
        return logChunks
          .join("")
          .trim()
          .split(/\r?\n/)
          .filter(Boolean)
          .slice(-24)
          .join("\n");
      },
      detach() {
        child.stdout?.destroy();
        child.stderr?.destroy();
        child.unref();
      },
      terminate() {
        if (!exited) {
          child.kill();
        }
      },
    };
  } catch (error) {
    return {
      hasExited() {
        return true;
      },
      getExitSummary() {
        return `failed to spawn process: ${error?.message || "unknown error"}`;
      },
      getRecentLogs() {
        return "";
      },
      detach() {},
      terminate() {},
    };
  }
}

function buildBackgroundStartupError({ baseUrl, provider, summary, recentLogs }) {
  let message = `Cannot connect to LLM server at ${baseUrl} for provider ${provider} (${summary}).`;
  if (recentLogs) {
    message += `\nRecent server output:\n${recentLogs}`;
  }
  return message;
}

async function waitForExistingLlmServer(provider, baseUrl, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isLlmServerReady(provider, baseUrl)) {
      return true;
    }
    await sleep(1000);
  }
  return false;
}

function isPortConflictError(text) {
  const message = String(text || "").toLowerCase();
  return (
    message.includes("address already in use") ||
    message.includes("eaddrinuse") ||
    message.includes("errno 48")
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function warmupLlmModel({ llm, model }) {
  const baseUrl = normalizeBaseUrl(llm?.baseUrl || defaultBaseUrlForProvider(llm?.provider));
  const timeoutMs = estimateModelTimeoutMs(model) + 60_000;
  const request = buildWarmupRequest(llm?.provider, model);
  const headers = {
    "content-type": "application/json",
  };

  if (typeof llm?.apiKey === "string" && llm.apiKey.trim()) {
    headers.authorization = `Bearer ${llm.apiKey.trim()}`;
  }

  try {
    const response = await fetch(`${baseUrl}${request.path}`, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify(request.body),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        message: `Warmup request failed (${response.status}): ${body.slice(0, 180)}`,
      };
    }

    const payload = await response.json().catch(() => null);
    const content = payload?.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content.trim() : "";
    if (!text) {
      return {
        ok: false,
        message: "Warmup completed without any assistant content.",
      };
    }

    return {
      ok: true,
      message: "Model warmup completed.",
    };
  } catch (error) {
    return {
      ok: false,
      message: `Warmup did not complete: ${error.message}`,
    };
  }
}

function estimateModelTimeoutMs(model) {
  const text = String(model || "").toLowerCase();
  const sizeMatch = text.match(/(\d+(?:\.\d+)?)b/);
  const sizeInBillions = sizeMatch ? Number.parseFloat(sizeMatch[1]) : Number.NaN;

  if (Number.isFinite(sizeInBillions) && sizeInBillions >= 14) {
    return 150000;
  }
  if (Number.isFinite(sizeInBillions) && sizeInBillions >= 7) {
    return 90000;
  }
  if (Number.isFinite(sizeInBillions) && sizeInBillions <= 3) {
    return 50000;
  }
  return 80000;
}

function resolveLlmConfig(rawLlmConfig) {
  const llm = rawLlmConfig && typeof rawLlmConfig === "object" ? rawLlmConfig : {};
  const provider = normalizeProvider(llm.provider);
  const defaultModel = defaultModelForProvider(provider);
  const defaultBaseUrl = defaultBaseUrlForProvider(provider);

  return {
    provider,
    baseUrl:
      typeof llm.baseUrl === "string" && llm.baseUrl.trim()
        ? llm.baseUrl.trim().replace(/\/+$/, "")
        : defaultBaseUrl,
    apiKey: typeof llm.apiKey === "string" ? llm.apiKey : "",
    model:
      typeof llm.model === "string" && llm.model.trim()
        ? llm.model.trim()
        : defaultModel,
    start: {
      command:
        typeof llm.start?.command === "string" && llm.start.command.trim() ? llm.start.command.trim() : "",
      args: Array.isArray(llm.start?.args) ? llm.start.args.map((item) => String(item)) : [],
    },
  };
}

function isPlanCritical(plan) {
  if (String(plan?.overall_risk || "").toLowerCase() === "critical") {
    return true;
  }

  const commands = Array.isArray(plan?.commands) ? plan.commands : [];
  return commands.some((step) => String(step?.risk || "").toLowerCase() === "critical");
}

async function askForConfirmation({ risk, prompt, commands }) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const defaultYes = risk === "moderate" || risk === "low";
    const suffix = defaultYes ? "[Y/n]" : "[y/N]";
    const commandPreview = (commands || [])
      .slice(0, 3)
      .map((step, index) => `  ${index + 1}. ${step.command}`)
      .join("\n");

    const question =
      `Review before execution:\n` +
      `- Prompt: ${prompt}\n` +
      `- Risk: ${risk}\n` +
      `- Commands:\n${commandPreview || "  (none)"}\n` +
      `Execute ${suffix} `;

    const answer = (await rl.question(question)).trim();
    if (answer.length === 0) {
      return defaultYes;
    }
    return /^y(es)?$/i.test(answer);
  } finally {
    rl.close();
  }
}

async function askForCriticalConfirmation({ prompt, commands }) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Critical-risk plan requires interactive confirmation. Re-run with --force if intentional.");
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const commandPreview = (commands || [])
      .slice(0, 5)
      .map((step, index) => `  ${index + 1}. ${step.command}`)
      .join("\n");

    process.stdout.write("CRITICAL RISK ACTION\n");
    process.stdout.write(`Prompt: ${prompt}\n`);
    process.stdout.write(`This will run:\n${commandPreview || "  (none)"}\n`);

    const first = (await rl.question("Type YES to continue: ")).trim();
    if (first !== "YES") {
      return false;
    }

    const second = (await rl.question("Final confirmation - type EXECUTE: ")).trim();
    return second === "EXECUTE";
  } finally {
    rl.close();
  }
}

async function resolveSetupHookMode(inputMode) {
  const explicit = normalizeHookMode(inputMode);
  if (explicit) {
    return explicit;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return "auto";
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = (
      await rl.question(
        "Hook mode: auto route every terminal command, or lx-only command? [A/lx] "
      )
    )
      .trim()
      .toLowerCase();

    if (!answer || answer === "a" || answer === "auto") {
      return "auto";
    }

    if (answer === "lx" || answer === "l" || answer === "manual") {
      return "lx";
    }

    return "auto";
  } finally {
    rl.close();
  }
}

function isBareHelpPrompt(prompt) {
  return /^help$/i.test(String(prompt || "").trim());
}

function printNaturalHelp({ hookMode }) {
  process.stdout.write("Lexis Help\n");
  if (hookMode === "auto") {
    process.stdout.write("- exit: disable Lexis for this shell session only\n");
    process.stdout.write("- uninstall: remove Lexis completely\n");
    return;
  }

  process.stdout.write("- uninstall: remove Lexis completely\n");
}

function printHelp() {
  process.stdout.write(`Lexis CLI\n\n`);
  process.stdout.write(`Usage:\n`);
  process.stdout.write(`  lexis help\n`);
  process.stdout.write(
    `  lexis run <prompt> [--model <model>] [--allow-web] [--web-mode off|auto|always] [--yes] [--dry-run] [--json] [--quiet]\n`
  );
  process.stdout.write(`  lexis <prompt>\n`);
  process.stdout.write(
    `  lexis setup [--profile light|balanced|heavy] [--models model1,model2] [--default-model model] [--hook-mode auto|lx] [--enable-web-search] [--web-provider mcp] [--mcp-command cmd] [--mcp-args arg1,arg2] [--mcp-tool tool] [--mcp-env K=V,K2=V2]\n`
  );
  process.stdout.write(`  lexis hooks <install|uninstall> [--mode auto|lx]\n`);
  process.stdout.write(`  lexis uninstall [--yes]\n`);
  process.stdout.write(
    `  lexis config [show|set-model|set-llm-provider|set-llm-base-url|set-llm-start-command|set-llm-start-args|set-risk-mode|set-hook-mode|enable-web|disable-web|set-web-provider|set-web-max-results|set-web-timeout|set-mcp-command|set-mcp-args|set-mcp-tool|set-mcp-env]\n`
  );
  process.stdout.write(`  lexis web-search <query> [--provider mcp] [--max-results 1-10]\n`);
  process.stdout.write(`  lexis mcp serve-web\n`);
  process.stdout.write(`  lexis doctor\n`);
}

function parseCsv(value) {
  if (!value || typeof value !== "string") {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseEnvCsv(value) {
  const pairs = parseCsv(value);
  const env = {};

  for (const pair of pairs) {
    const index = pair.indexOf("=");
    if (index <= 0) {
      continue;
    }
    const key = pair.slice(0, index).trim();
    const raw = pair.slice(index + 1);
    if (!key) {
      continue;
    }
    env[key] = raw;
  }

  return env;
}
