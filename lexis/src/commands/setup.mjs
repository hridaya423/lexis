import { loadConfig, saveConfig } from "../config.mjs";
import { installHooks } from "../shell/install.mjs";
import { getMachine } from "../machine.mjs";
import { describeProviders } from "../providers/index.mjs";
import { catalogIdToOllamaTag } from "../providers/ollama.mjs";
import { installRuntime } from "../runtime/installer.mjs";
import { downloadModel, defaultModelFor, catalogEntry, MODEL_CATALOG } from "../runtime/models.mjs";
import { ensureServer } from "../runtime/supervisor.mjs";
import { configDir } from "../paths.mjs";
import { applyPolicyToPlan } from "../policy.mjs";
import { executePlan } from "../executor.mjs";
import { loadSystemPrompt } from "../prompt.mjs";
import { generatePlan, estimateTimeoutMs } from "../planner.mjs";
import { resolveProvider } from "../providers/index.mjs";
import * as ui from "../ui.mjs";

export async function setupCommand(args) {
  const { options } = parseFlags(args);
  const machine = getMachine();
  const config = await loadConfig();
  const providers = await describeProviders(config, machine);
  const isTTY = process.stdin.isTTY && process.stdout.isTTY;

  ui.line(`\n${ui.bold("Lexis setup")}`);
  ui.info(ui.dim(`${machine.platformName} ${machine.arch} · ${machine.totalMemoryGb} GB RAM · ${machine.shell}`));

  let providerId = typeof options.provider === "string" ? options.provider.trim() : "";
  const recommended = "llama-server";
  if (!providerId) {
    providerId = isTTY ? await askProvider(providers, recommended) : recommended;
  }

  let modelId = typeof options.model === "string" ? options.model.trim() : "";
  if (providerId === "llama-server" && !modelId) {
    const suggested = defaultModelFor();
    modelId = isTTY ? await askModel(machine, suggested) : suggested;
  } else if (providerId === "ollama" && !modelId) {
    modelId = defaultModelFor();
  }

  let hookMode = typeof options["hook-mode"] === "string" ? options["hook-mode"].trim().toLowerCase() : "";
  if (!["auto", "lx"].includes(hookMode)) {
    hookMode = isTTY ? await askHookMode() : "auto";
  }

  ui.info(`${ui.dim("provider:")} ${providerId}`);
  if (modelId) ui.info(`${ui.dim("model:")}    ${modelId}`);
  ui.info(`${ui.dim("hooks:")}    ${hookMode} (${machine.shell})`);

  if (providerId === "llama-server") {
    ui.step("Installing llama.cpp runtime");
    const backend = typeof options.backend === "string" ? options.backend : config.runtime?.backend || "auto";
    const rt = await installRuntime(machine, { backend, onProgress: ui.progress("llama.cpp") });
    ui.ok(`runtime ready — ${rt.backend} backend${rt.cached ? " (cached)" : ""}`);

    ui.step("Downloading model");
    const entry = catalogEntry(modelId);
    if (!entry) throw new Error(`Unknown model '${modelId}'.`);
    const dl = await downloadModel(modelId, { onProgress: ui.progress(entry.file) });
    ui.ok(dl.cached ? `${entry.file} (cached)` : `${entry.file} downloaded`);

    config.model = modelId;
    ui.step("Starting model server");
    const s = ui.spin("loading model (first load can take a minute)");
    try {
      await ensureServer(config, { onProgress: (m) => s.update(m) });
      s.succeed("server running");
    } catch (error) {
      s.fail("server failed to start");
      throw error;
    }
  } else if (providerId === "ollama") {
    const { availability, ensureReady } = await import("../providers/ollama.mjs");
    const avail = await availability();
    if (!avail.ok) throw new Error(avail.detail || "Ollama not installed.");
    ui.step("Preparing Ollama");
    const s = ui.spin(`pulling ${modelId}`);
    await ensureReady(config);
    s.succeed("Ollama ready");
    config.model = modelId.includes(":") ? modelId : catalogIdToOllamaTag(modelId);
  } else if (providerId === "apple-fm") {
    const { availability } = await import("../providers/apple-fm.mjs");
    const avail = await availability(machine, config);
    if (!avail.ok) {
      throw new Error(`Apple Foundation Models unavailable (${avail.reason}). ${avail.detail || ""}`);
    }
    config.model = "apple-on-device";
    ui.ok("Apple Foundation Models ready (0 MB download)");
  } else if (providerId === "openai-compat") {
    const baseUrl = typeof options["base-url"] === "string" ? options["base-url"].trim() : "";
    if (!baseUrl) throw new Error("openai-compat needs --base-url <url> [--model <id>] [--api-key-env VAR]");
    config.provider.openaiCompat = {
      baseUrl: baseUrl.replace(/\/+$/, ""),
      model: typeof options["model-id"] === "string" ? options["model-id"].trim() : modelId,
      apiKeyEnv: typeof options["api-key-env"] === "string" ? options["api-key-env"].trim() : "",
    };
  }

  config.provider.active = providerId;
  config.execution.hookMode = hookMode;
  config.webSearch.enabled = true;
  config.webSearch.provider = "builtin";
  await saveConfig(config);

  ui.step("Installing shell hooks");
  const hookResult = await installHooks({ mode: hookMode });
  for (const item of hookResult.results) {
    ui.info(`${item.changed ? ui.green("updated") : ui.dim("unchanged")}  ${item.filePath}${item.error ? ui.dim(` — ${item.error}`) : ""}`);
  }

  await readinessCheck(config, machine, providerId);

  ui.line(`\n${ui.bold(ui.green("Done."))} Open a new terminal and run: ${ui.cyan("lx doctor")}`);
  ui.info(ui.dim(`config: ${configDir()}/config.json`));
}

async function readinessCheck(config, machine, providerId) {
  ui.step("Readiness check");
  const s = ui.spin("asking the model to plan a harmless command");
  let plan;
  try {
    const { impl: providerImpl } = await resolveProvider(config, machine);
    const shell = machine.shell || (machine.platform === "win32" ? "powershell" : "sh");
    const platform = machine.platform === "win32" ? "windows" : "unix";
    const context = {
      platform,
      shell,
      os: `${machine.platformName} ${machine.osRelease} ${machine.arch}`,
      cwd: process.cwd(),
    };
    const model = providerId === "apple-fm" ? "apple-on-device" : config.model;
    plan = await generatePlan({
      providerImpl,
      providerId,
      model,
      systemPrompt: await loadSystemPrompt(),
      userPrompt: "print the current date",
      context,
      config,
      timeoutMs: estimateTimeoutMs(model),
    });
    s.succeed("model responded");
  } catch (error) {
    s.fail(`readiness check failed: ${error.message}`);
    ui.warn("setup completed, but the provider could not answer — run 'lx doctor' to diagnose");
    return;
  }

  const shell = machine.shell || (machine.platform === "win32" ? "powershell" : "sh");
  const platform = machine.platform === "win32" ? "windows" : "unix";
  const policy = applyPolicyToPlan(plan, { shell, platform });
  const commands = plan.commands.map((cmd) => cmd.command).filter(Boolean);
  if (!commands.length) {
    ui.warn("model returned no commands — run 'lx doctor' to diagnose");
    return;
  }
  for (const cmd of commands) {
    ui.info(`${ui.dim("›")} ${cmd}`);
  }
  if (!policy.readonly) {
    ui.warn("generated command is not provably read-only — skipping execution");
    return;
  }
  const results = await executePlan(plan, { platform: machine.platform, shell });
  if (results.some((r) => r.exitCode)) {
    ui.warn("readiness command failed — run 'lx doctor' to diagnose");
    return;
  }
  ui.ok("provider, runtime, and execution verified end-to-end");
}

const PROVIDER_HINTS = {
  "llama-server": "local model, private, fast (~0.4 GB download)",
  "apple-fm": "on-device, 0 MB download — experimental, much slower",
  ollama: "uses your Ollama install",
  "openai-compat": "remote / LM Studio / OpenAI-compatible",
};

function askProvider(providers, recommended) {
  return ui.select(
    "How should Lexis think?",
    providers.map((p) => ({
      id: p.id,
      label: p.id,
      tag: p.id === recommended ? "(recommended)" : "",
      hint: p.ok === false ? `unavailable: ${p.reason || ""}` : PROVIDER_HINTS[p.id] || "",
      disabled: p.ok === false,
    })),
    { initial: recommended }
  );
}

function askModel(machine, suggested) {
  const ram = machine.totalMemoryGb || 8;
  const fits = MODEL_CATALOG.filter((m) => m.minRamGb <= ram);
  return ui.select(
    "Pick a model",
    fits.map((m) => ({
      id: m.id,
      label: m.id,
      tag: m.id === suggested ? "(recommended)" : "",
      hint: `~${m.approxMb} MB · ${m.platforms?.join("+") || "all platforms"}`,
    })),
    { initial: suggested }
  );
}

function askHookMode() {
  return ui.select("How do you want to talk to Lexis?", [
    { id: "auto", label: "auto", tag: "(recommended)", hint: "just type English in your terminal — no prefix" },
    { id: "lx", label: "lx", hint: "only via the 'lx' prefix — terminal stays untouched" },
  ], { initial: "auto" });
}

function parseFlags(args) {
  const options = {};
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const value = args[i];
    if (!value.startsWith("--")) { positional.push(value); continue; }
    const key = value.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) { options[key] = true; continue; }
    options[key] = next;
    i += 1;
  }
  return { options, positional };
}
