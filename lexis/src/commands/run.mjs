import readline from "node:readline/promises";
import { loadConfig } from "../config.mjs";
import { loadSystemPrompt } from "../prompt.mjs";
import { generatePlan, estimateTimeoutMs } from "../planner.mjs";
import { applyPolicyToPlan, RISK_SCORE, headBinary, isInstalled, installedAlternative, isRefusalCommand, packageManager } from "../policy.mjs";
import { executePlan } from "../executor.mjs";
import { resolveProvider } from "../providers/index.mjs";
import { catalogIdToOllamaTag } from "../providers/ollama.mjs";
import { fetchWebContext, shouldSearchWeb } from "../web-context.mjs";
import { appendAuditEvent, readAuditEvents } from "../audit.mjs";
import { getMachine, detectShell } from "../machine.mjs";
import { catalogEntry } from "../runtime/models.mjs";
import * as ui from "../ui.mjs";

const LOOKUP_INTENT = /^(what|which|who|whom|whose|where|when|why|how|show|list|check|find|display|print|see|get|tell|look|search|is|are|do|does|can|read|view|inspect|monitor|measure|count|describe|explain)\b/i;
const REFERENT_RE = /\b(it|that|them|those|this)\b/i;
const ENGLISH_HEAD_RE = /^(what|why|how|when|where|which|who|whom|whose|is|are|was|were|am|can|could|should|would|will|do|does|did|please|hey|ok|okay|install|remove|delete|show|find|get|set|make|run|open|close|start|stop|tell|give|list|check|use|need|want|man|help|fix)$/i;
const normalizeUtterance = (s) => String(s || "").toLowerCase().replace(/[\s?!.,;:'"`]+$/, "").replace(/\s+/g, " ").trim();

export function resolveFollowUp(prompt, events, { now = Date.now(), cwd } = {}) {
  if (!REFERENT_RE.test(prompt)) return null;
  const pool = [...events].reverse().filter((e) =>
    e.prompt && e.prompt !== prompt && e.type !== "retry" &&
    Date.parse(e.ts) > now - 10 * 60 * 1000 && LOOKUP_INTENT.test(e.prompt));
  const prev = pool.find((e) => !e.cwd || e.cwd === cwd) || pool[0];
  if (!prev) return null;
  const cleaned = prompt.replace(/^(now|then|also|and)\b[,:\s-]*/i, "");
  return { prompt: `${prev.prompt.replace(/[.\s]+$/, "")}, then ${cleaned}`, anchor: prev.prompt };
}

export async function runCommand(runArgs, { dryRunOnly = false, memory = true } = {}) {
  const { options, positional } = parseFlags(runArgs);
  const prompt = positional.join(" ").trim();
  if (!prompt) {
    throw new Error("No prompt provided. Example: lx show node version");
  }
  if (/^help$/i.test(prompt)) {
    const config = await loadConfig();
    printNaturalHelp({ hookMode: config.execution?.hookMode || "auto" });
    return;
  }

  const config = await loadConfig();
  for (const note of config.__migrationNotes || []) {
    process.stderr.write(`[lexis] ${note}\n`);
  }

  const machine = getMachine();
  const shell = detectShell();
  const platform = machine.platform === "win32" ? "windows" : "unix";
  const audit = (ev) => appendAuditEvent({ cwd: process.cwd(), ...ev });

  let modelPrompt = prompt;
  if (memory && REFERENT_RE.test(prompt)) {
    const events = await readAuditEvents({ limit: 20 });
    const followUp = resolveFollowUp(prompt, events, { cwd: process.cwd() });
    if (followUp) {
      modelPrompt = followUp.prompt;
      if (process.stderr.isTTY && !options.quiet && !options.json) {
        process.stderr.write(ui.dim(`  ↳ following up on "${followUp.anchor}"\n`));
      }
    }
  }

  const context = {
    platform,
    shell,
    os: `${machine.platformName} ${machine.osRelease} ${machine.arch}`,
    cwd: process.cwd(),
  };

  const { id: providerId, impl: provider } = await resolveProvider(config, machine);
  const model = options.model || resolveModelFor(config, providerId);
  await provider.ensureReady?.(config, {
    onProgress: (msg) => options.quiet || process.stderr.write(`[lexis] ${msg}\n`),
  });

  const systemPrompt = await loadSystemPrompt();
  const webMode = resolveWebMode(options["web-mode"], config.webSearch.mode);
  const allowWeb = Boolean(options["allow-web"]) || Boolean(config.webSearch.enabled);
  const entry = catalogEntry(model);

  let webContext = [];
  if (allowWeb && webMode === "always" && entry?.webContext !== false) {
    webContext = await fetchWebContext({ query: prompt, config: config.webSearch });
  }

  const spinner = makeSpinner(providerId, model, options);
  const planOnce = (userPrompt, web, task) => generatePlan({
    providerImpl: provider,
    providerId,
    model,
    systemPrompt,
    userPrompt,
    context,
    webContext: web,
    config,
    timeoutMs: estimateTimeoutMs(model),
    task,
  });
  let plan;
  try {
    spinner.start();
    plan = await planOnce(modelPrompt, webContext);
  } catch (error) {
    if (providerId === "apple-fm") {
      process.stderr.write(`[lexis] ${error.message}\n[lexis] Fallback: lx model use llama-server (downloads a model) or lx model use ollama.\n`);
    }
    if (webContext.length > 0) {
      plan = manualReviewFallback({ platform, webContext });
    } else {
      await audit({ type: "plan_error", prompt, provider: providerId, error: error.message });
      throw error;
    }
  } finally {
    spinner.stop();
  }

  if (allowWeb && webMode === "auto" && webContext.length === 0) {
    const plain = entry?.format === "plain";
    const wantsWeb = plain
      ? entry?.webContext !== false && shouldSearchWeb(prompt, plan)
      : plan.confidence < (config.webSearch?.autoRetryBelowConfidence ?? 0.82);
    if (wantsWeb) {
      if (process.stderr.isTTY && !options.quiet) process.stderr.write("[lexis] searching the web…\n");
      const fetched = await fetchWebContext({ query: prompt, config: config.webSearch });
      if (fetched.length > 0) {
        webContext = fetched;
        spinner.start();
        try {
          plan = await planOnce(modelPrompt, webContext);
        } catch {
          plan = manualReviewFallback({ platform, webContext });
        } finally {
          spinner.stop();
        }
      }
    }
  }

  const dryRun = dryRunOnly || Boolean(options["dry-run"]);
  const force = Boolean(options.force);
  const autoYes = Boolean(options.yes);
  const quiet = Boolean(options.quiet);
  const askAt = config.execution?.askConfirmationAt || "moderate";

  const replan = async (suffix, withWeb = true, replace = false, task) => {
    const before = plan.commands.map((c) => c.command).join("\n");
    spinner.start();
    try {
      plan = await planOnce(replace ? suffix : `${modelPrompt}${suffix}`, withWeb ? webContext : [], task);
      return plan.commands.map((c) => c.command).join("\n") !== before;
    } catch {
      return false;
    } finally {
      spinner.stop();
    }
  };

  let pmInstallPath = false;
  for (let attempt = 0; ; attempt++) {
    const policy = applyPolicyToPlan(plan, { shell, platform });
    const verdict = planVerdict(plan, { platform, askAt });
    let { applicable, critical, requiresConfirmation } = verdict;

    if (options.json) {
      process.stdout.write(JSON.stringify({ plan, provider: providerId, model, skipped: plan.commands.length - applicable.length, policy: { readonly: policy.readonly } }, null, 2) + "\n");
      await audit({ type: "planned", prompt, provider: providerId, model, mode: "json", commands: plan.commands.map((c) => c.command) });
      return;
    }

    const parroted = applicable.length === 1 && applicable[0].command.trim().split(/\s+/).length > 1 &&
      normalizeUtterance(applicable[0].command) === normalizeUtterance(modelPrompt) &&
      ENGLISH_HEAD_RE.test(headBinary(applicable[0].command));
    if (applicable.length === 1 && (isRefusalCommand(applicable[0].command) || parroted)) {
      process.stdout.write(`lexis: couldn't turn "${prompt}" into a command\n`);
      const installMatch = prompt.match(/\b(?:install|get|set\s?up|add)\s+([a-z0-9][a-z0-9._-]*)/i);
      if (installMatch) {
        process.stdout.write(ui.dim(`  try: lx install ${installMatch[1]}\n`));
      } else {
        process.stdout.write(ui.dim("  try describing it in more words\n"));
      }
      await audit({ type: "no_command", prompt, provider: providerId, model });
      process.exit(1);
    }

    if (applicable.length === 0) {
      process.stdout.write(`No commands apply to this platform (${platform}). Nothing to run.\n`);
      await audit({ type: "planned", prompt, provider: providerId, model, mode: "no-applicable-steps" });
      return;
    }

    if (dryRun) {
      ui.commandCard({
        commands: applicable.map((c) => c.command),
        meta: `${plan.overall_risk} · ${policy.readonly ? "read-only" : "mutating"} · ${model}`,
      });
      if (plan.sources?.length) {
        for (const s of plan.sources) process.stdout.write(ui.dim(`    src: ${s.title} — ${s.url}\n`));
      }
      await audit({ type: "planned", prompt, provider: providerId, model, mode: "dry-run", commands: applicable.map((c) => c.command) });
      return;
    }

    let missingHead = null;
    let sawInstaller = false;
    for (const s of applicable) {
      const head = headBinary(s.command);
      if (head && !isInstalled(head) && !sawInstaller) {
        missingHead = head;
        break;
      }
      if (/\b(install|add)\b/.test(s.command)) sawInstaller = true;
    }
    if (missingHead) {
      if (attempt === 0) {
        const alts = installedAlternative(missingHead);
        const pm = alts ? null : packageManager(missingHead);
        pmInstallPath = Boolean(pm);
        let suffix = null;
        let note = `  \`${missingHead}\` isn't installed`;
        if (alts) {
          suffix = ` using ${alts.map((a) => `\`${a}\``).join(" or ")}`;
          note += ` — trying ${alts.map((a) => `\`${a}\``).join(" or ")}`;
        } else if (pm) {
          suffix = ` install ${missingHead} using ${pm}`;
          note += ` — trying ${pm}`;
        }
        if (suffix) {
          process.stderr.write(ui.dim(`${note}\n`));
          await audit({ type: "retry", prompt, reason: "missing_binary", head: missingHead });
          if (await replan(suffix, false)) {
            continue;
          }
        }
      }
      if (attempt === 1 && pmInstallPath && packageManager(missingHead)) {
        pmInstallPath = false;
        process.stderr.write(ui.dim(`  \`${missingHead}\` isn't installed — installing it\n`));
        await audit({ type: "retry", prompt, reason: "missing_binary_install", head: missingHead });
        if (await replan(`install ${missingHead}`, false, true)) {
          continue;
        }
      }
      process.stdout.write(`lexis: \`${missingHead}\` isn't installed\n`);
      process.stdout.write(ui.dim(`  try: lx install ${missingHead}\n`));
      await audit({ type: "missing_binary", prompt, provider: providerId, commands: plan.commands.map((c) => c.command), head: missingHead });
      process.exit(127);
    }

    let approved = false;
    let autoDecided = false;
    let editedPlan = false;
    for (;;) {
      const decision = decideApproval({
        critical,
        requiresConfirmation,
        risk: plan.overall_risk,
        autoExecuteLowRisk: config.execution?.autoExecuteLowRisk,
        autoYes,
        force,
      });
      if (decision === "auto") {
        approved = true;
        autoDecided = true;
        break;
      }
      if (decision === "critical") {
        approved = await askCritical(applicable);
        break;
      }
      const answer = await ui.confirmCard({
        commands: applicable.map((c) => c.command),
        reason: firstReason(applicable),
        risk: plan.overall_risk,
      });
      if (answer === "run") {
        approved = true;
        break;
      }
      if (answer === "edit") {
        const edited = await editInline(applicable);
        if (!edited.length) break;
        editedPlan = true;
        plan.commands = edited;
        plan.overall_risk = "low";
        applyPolicyToPlan(plan, { shell, platform });
        const reVerdict = planVerdict(plan, { platform, askAt });
        ({ applicable, critical, requiresConfirmation } = reVerdict);
        if (!applicable.length) break;
        continue;
      }
      break;
    }

    if (!approved) {
      await audit({ type: "declined", prompt, provider: providerId, commands: plan.commands.map((c) => c.command) });
      process.stdout.write(ui.dim("  cancelled\n"));
      process.exit(1);
    }

    if (autoDecided) {
      for (const s of applicable) process.stderr.write(ui.dim(`› ${s.command}\n`));
    }

    await audit({
      type: "execute",
      prompt,
      provider: providerId,
      model,
      commands: plan.commands.map((c) => ({ command: c.command, risk: c.risk })),
    });
    const results = await executePlan(plan, {
      dryRun,
      platform: machine.platform,
      shell,
      timeoutMs: autoDecided ? Math.max(5, Number(config.execution?.autoRunTimeoutSec) || 120) * 1000 : 0,
      onEvent: (r) => audit({ type: "command_result", command: r.command, exitCode: r.exitCode, durationMs: r.durationMs, stderrTail: r.stderrTail?.slice(0, 500) }),
    });

    const failed = results.find((r) => r.exitCode && r.exitCode !== 0);
    if (failed && !failed.signal && failed.exitCode < 128 && policy.readonly && !failed.stderrTail?.trim() && !(failed.stdoutBytes > 0)) {
      process.stderr.write(ui.dim(`  no matches (exit ${failed.exitCode})\n`));
      await audit({ type: "no_matches", prompt, failedCommand: failed.command, exitCode: failed.exitCode });
      process.exit(failed.exitCode);
    }
    const retryable = failed && !failed.signal && !editedPlan && attempt === 0;
    if (retryable) {
      const errLine = (failed.stderrTail || `exited ${failed.exitCode}`).trim().split("\n").slice(0, 3).join(" ").slice(0, 300);
      if (failed.stderrTail?.trim()) process.stderr.write(ui.dim(`  ${errLine}\n`));
      process.stderr.write(ui.dim(`  failed — replanning with the error\n`));
      await audit({ type: "retry", prompt, failedCommand: failed.command, exitCode: failed.exitCode });
      if (await replan(`$ ${failed.command}\n${errLine}`, false, true, "fixcmd")) {
        continue;
      }
    }
    if (failed) {
      process.exit(failed.exitCode ?? 1);
    }
    if (quiet && !dryRun && plan.summary !== "single command" && results.every((r) => !(r.stdoutBytes + (r.stderrBytes || 0)))) {
      process.stdout.write(`Lexis: ${plan.summary}\n`);
    }
    return;
  }
}

export async function fixCommand() {
  const events = await readAuditEvents({ limit: 30 });
  const here = process.cwd();
  const lastIdx = events.map((e, i) => i).reverse().find((i) =>
    events[i].type === "command_result" && events[i].exitCode && (!events[i].cwd || events[i].cwd === here)) ??
    events.map((e, i) => i).reverse().find((i) => events[i].type === "command_result" && events[i].exitCode);
  if (lastIdx === undefined) {
    process.stdout.write("Nothing failed recently — there's nothing to fix.\n");
    return;
  }
  const lastFail = events[lastIdx];
  const anchor = [...events.slice(0, lastIdx)].reverse().find((e) => e.prompt && e.type !== "retry");
  const err = (lastFail.stderrTail || `exit code ${lastFail.exitCode}`).trim().split("\n").slice(0, 3).join(" ").slice(0, 300);
  const base = anchor?.prompt || `run ${lastFail.command}`;
  await runCommand([`${base} — the command \`${lastFail.command}\` failed (${err}). give the correct command`], { memory: false });
}

function resolveModelFor(config, providerId) {
  const explicit = String(config.model || "").trim();
  if (providerId === "ollama") {
    return explicit.includes(":") ? explicit : explicit ? catalogIdToOllamaTag(explicit) : "qwen2.5-coder:3b";
  }
  if (providerId === "openai-compat") {
    return String(config.provider?.openaiCompat?.model || explicit || "");
  }
  if (providerId === "apple-fm") return "apple-on-device";
  return explicit;
}

function makeSpinner(providerId, model, options) {
  const enabled = process.stderr.isTTY && !options.quiet && !options.json;
  let timer = null;
  const startedAt = Date.now();
  return {
    start() {
      if (!enabled) return;
      timer = setInterval(() => {
        const s = ((Date.now() - startedAt) / 1000).toFixed(0);
        process.stderr.write(`\r[lexis] planning with ${providerId}${model ? ` (${model})` : ""} … ${s}s `);
      }, 250);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
        process.stderr.write("\r" + " ".repeat(80) + "\r");
      }
    },
  };
}

function resolveWebMode(optionValue, configValue) {
  const candidate = typeof optionValue === "string" ? optionValue.trim().toLowerCase() : "";
  if (["off", "auto", "always"].includes(candidate)) return candidate;
  const configured = typeof configValue === "string" ? configValue.trim().toLowerCase() : "";
  return ["off", "auto", "always"].includes(configured) ? configured : "auto";
}

function platformApplies(stepPlatform, platform) {
  const p = String(stepPlatform || "all").toLowerCase();
  return p === "all" || p === platform;
}

export function decideApproval({ critical, requiresConfirmation, risk, autoExecuteLowRisk, autoYes, force }) {
  if (critical) return "critical";
  if (!requiresConfirmation && autoExecuteLowRisk !== false) return "auto";
  if (autoYes && RISK_SCORE[risk] <= RISK_SCORE.moderate) return "auto";
  if (force) return "auto";
  return "review";
}

function planVerdict(plan, { platform, askAt }) {
  const applicable = plan.commands.filter((s) => platformApplies(s.platform, platform));
  const applicableRisk = applicable.reduce((m, s) => (RISK_SCORE[s.risk] > RISK_SCORE[m] ? s.risk : m), "low");
  plan.overall_risk = RISK_SCORE[applicableRisk] > RISK_SCORE[plan.overall_risk] ? applicableRisk : plan.overall_risk;
  const critical = applicable.some((s) => s.risk === "critical") || plan.overall_risk === "critical";
  const requiresConfirmation =
    plan.requires_confirmation ||
    applicable.some((s) => s.requires_confirmation) ||
    RISK_SCORE[plan.overall_risk] >= RISK_SCORE[askAt] ||
    plan.confidence < 0.75;
  return { applicable, critical, requiresConfirmation };
}

function firstReason(commands) {
  for (const s of commands) {
    const r = s.policy?.reasons?.[0];
    if (r) return r;
  }
  return "";
}

async function editInline(commands) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const edited = [];
    for (const c of commands) {
      rl.setPrompt("  edit: ");
      rl.prompt();
      rl.write(c.command);
      const line = await new Promise((r) => rl.once("line", r));
      const cmd = String(line || "").trim();
      if (cmd) edited.push({ command: cmd, intent: "edited", risk: "low", requires_confirmation: false, platform: c.platform || "all" });
    }
    return edited;
  } finally {
    rl.close();
  }
}

async function askCritical(commands) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Critical-risk plan requires interactive typed confirmation; it cannot be approved by flags or in a non-interactive shell.");
  }
  const reason = firstReason(commands);
  ui.commandCard({ commands: commands.map((c) => c.command), reason: `critical${reason ? ` · ${reason}` : ""}`, danger: true });
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question("    type yes to run: ")).trim() === "yes";
  } finally {
    rl.close();
  }
}

function manualReviewFallback({ platform, webContext }) {
  const first = webContext[0];
  const url = first?.url || "";
  const message = url
    ? `Unable to derive a reliable command automatically. Review: ${url}`
    : "Unable to derive a reliable command automatically. Review the official docs.";
  const command = platform === "windows"
    ? `Write-Output '${message.replace(/'/g, "''")}'`
    : `printf '%s\\n' ${JSON.stringify(message)}`;
  return {
    summary: "Manual review required",
    overall_risk: "moderate",
    confidence: 0.55,
    requires_confirmation: true,
    commands: [{ command, intent: "manual review fallback", risk: "moderate", requires_confirmation: true, platform: platform === "windows" ? "windows" : "unix", rollback: "not_applicable" }],
    preflight_checks: ["Model could not produce a reliable command in time.", "Review official docs before executing."],
    sources: url ? [{ title: first?.title || "Official documentation", url }] : [],
  };
}

export function parseFlags(args) {
  const booleanFlags = new Set(["yes", "dry-run", "json", "allow-web", "quiet", "force"]);
  const options = {};
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const value = args[i];
    if (!value.startsWith("--")) {
      positional.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = args[i + 1];
    if (booleanFlags.has(key) || !next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    i += 1;
  }
  return { options, positional };
}

function printNaturalHelp({ hookMode }) {
  process.stdout.write("Lexis Help\n");
  if (hookMode === "auto") {
    process.stdout.write("- type plain English to run commands\n");
    process.stdout.write("- lx off: pause Lexis for this terminal; lx on: resume\n");
    process.stdout.write("- uninstall: remove Lexis completely\n");
    return;
  }
  process.stdout.write("- lx <intent>: plan and run a command\n");
  process.stdout.write("- uninstall: remove Lexis completely\n");
}
