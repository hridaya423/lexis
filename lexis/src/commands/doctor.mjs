import fs from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "../config.mjs";
import { getMachine, detectShell } from "../machine.mjs";
import { describeProviders, resolveProvider } from "../providers/index.mjs";
import { readRuntimeState, stopServer } from "../runtime/supervisor.mjs";
import { installHooks, hooksDiff } from "../shell/install.mjs";
import { auditLogPath, configPath, appleHelperPath, runtimeDir } from "../paths.mjs";
export async function doctorCommand(args) {
  const fix = args.includes("--fix");
  const asJson = args.includes("--json");
  const machine = getMachine();

  let configError = "";
  let config = null;
  try {
    config = await loadConfig();
  } catch (e) {
    configError = e.message;
    config = null;
  }

  const checks = [];
  const check = (name, status, detail, fixCmd) => checks.push({ name, status, detail, fixCmd });
  const ok = (n, d) => check(n, "ok", d);
  const warn = (n, d, f) => check(n, "warn", d, f);
  const fail = (n, d, f) => check(n, "fail", d, f);

  check("node", Number(process.versions.node.split(".")[0]) >= 20 ? "ok" : "fail", `v${process.versions.node}`, "install Node >= 20");

  if (configError) {
    fail("config", configError, "lx config reset");
    if (fix) await import("../config.mjs").then((m) => m.resetConfig());
  } else {
    ok("config", configPath());
  }

    const providerRows = config ? await describeProviders(config, machine) : [];
  const active = config?.provider?.active || "auto";
  if (config) {
    const { id: resolvedId } = await resolveProvider(config, machine);
    const row = providerRows.find((r) => r.id === resolvedId);
    if (row?.ok) ok("provider", `${resolvedId} (active: ${active})`);
    else warn("provider", `${resolvedId}: ${row?.detail || row?.reason || "unavailable"}`, "lx model runtime install");
  }

      const { installedRuntime } = await import("../runtime/installer.mjs");
  const { listDownloadedModels } = await import("../runtime/models.mjs");
  const installed = await installedRuntime();
  const state = await readRuntimeState();
  if (!installed) {
    warn("runtime", "llama-server not installed", "lx model runtime install");
    if (fix) {
      try {
        const { installRuntime } = await import("../runtime/installer.mjs");
        await installRuntime(machine, { onProgress: (m) => process.stdout.write(`  ${m}\n`) });
        check("runtime:fix", "ok", "installed llama-server");
      } catch (e) {
        check("runtime:fix", "fail", e.message);
      }
    }
  } else {
    check(
      "runtime",
      "ok",
      state.running
        ? `running on :${state.port}${state.backend ? ` (${state.backend})` : ""}${state.serverFlags?.length ? ` — ${state.serverFlags.join(" ")}` : ""}`
        : `installed (${installed.backend || "unknown backend"}) — not running`,
      state.running ? undefined : "lx model start"
    );
  }
  if (state.status === "crashed") {
    warn("runtime:last-run", `server crashed (code ${state.exitCode}) — see ${runtimeDir()}/llama-server.log`, "lx model stop && lx model start");
    if (fix) await stopServer();
  }

  const downloaded = await listDownloadedModels();
  if (!downloaded.length && installed) {
    warn("model", "no model downloaded", "lx model download qwen3-linuxcmd-4b");
  } else if (downloaded.length) {
    ok("model", state.modelFile || downloaded.map((m) => m.id).join(", "));
  }

    if (machine.platform === "darwin" && machine.arch === "arm64") {
    const helper = appleHelperPath();
    try {
      await fs.access(helper);
      ok("apple-fm helper", helper);
    } catch {
      warn("apple-fm helper", `missing at ${helper}`, "lx model runtime build-apple");
      if (fix) {
        try {
          const { modelCommand } = await import("./model.mjs");
          await modelCommand(["runtime", "build-apple"]);
        } catch (e) {
          check("apple-fm:fix", "fail", e.message);
        }
      }
    }
  }

    const shell = detectShell();
  if (["bash", "zsh", "fish", "powershell"].includes(shell)) {
    const diffs = await hooksDiff({ shells: [shell] }).catch(() => []);
    const installed = diffs.some((d) => d.alreadyInstalled);
    check("hooks", installed ? "ok" : "warn", installed ? `installed in ${shell}` : `not installed in ${shell}`, "lx hooks install");
    if (!installed && fix) {
      const r = await installHooks({ mode: config?.execution?.hookMode || "auto" });
      for (const item of r.results) check("hooks:fix", item.changed ? "ok" : "warn", item.filePath);
    }
  }

    try {
    await fs.mkdir(path.dirname(auditLogPath()), { recursive: true });
    ok("audit log", auditLogPath());
  } catch (e) {
    warn("audit log", e.message);
  }

  if (asJson) {
    process.stdout.write(JSON.stringify({ checks }, null, 2) + "\n");
    return;
  }
  const icon = { ok: "✓", warn: "!", fail: "✗" };
  for (const c of checks) {
    process.stdout.write(`${icon[c.status] || "?"} ${c.name.padEnd(18)} ${c.detail || ""}${c.fixCmd ? `  → ${c.fixCmd}` : ""}\n`);
  }
  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  process.stdout.write(fails ? `\n${fails} failure(s).` : warns ? `\nAll good (${warns} suggestion(s)).` : "\nAll checks passed.");
  process.stdout.write("\n");
}
