import fs from "node:fs/promises";
import { loadConfig, saveConfig } from "../config.mjs";
import { getMachine } from "../machine.mjs";
import { describeProviders } from "../providers/index.mjs";
import { MODEL_CATALOG, downloadModel, removeModel, listDownloadedModels, modelFilePath } from "../runtime/models.mjs";
import { installRuntime } from "../runtime/installer.mjs";
import { readRuntimeState, ensureServer, stopServer } from "../runtime/supervisor.mjs";
import { appleHelperPath } from "../paths.mjs";
import { spawn } from "node:child_process";
import * as ui from "../ui.mjs";

export async function modelCommand(args) {
  const sub = args[0] || "status";
  const { options, positional } = parseFlags(args.slice(1));
  const config = await loadConfig();
  const machine = getMachine();

  if (sub === "status") {
    const rows = await describeProviders(config, machine);
    process.stdout.write(`Active provider: ${config.provider.active || "auto"}\n`);
    for (const row of rows) {
      const mark = row.ok ? "ok" : "--";
      process.stdout.write(`  ${mark} ${row.id}${row.reason ? ` (${row.reason})` : ""}${row.detail ? ` — ${row.detail}` : ""}\n`);
    }
    const { installedRuntime } = await import("../runtime/installer.mjs");
    const installed = await installedRuntime();
    const state = await readRuntimeState();
    if (installed) {
      process.stdout.write(`llama-server: ${state.running ? `running on :${state.port}${state.backend ? ` (${state.backend})` : ""}` : `installed (${installed.backend || "unknown backend"}, stopped)`}\n`);
      if (state.modelFile) process.stdout.write(`  model: ${state.modelFile}\n`);
      if (state.running && state.serverFlags?.length) {
        process.stdout.write(`  flags: ${state.serverFlags.join(" ")}\n`);
      }
    }
    const downloaded = await listDownloadedModels();
    if (downloaded.length) {
      process.stdout.write("Downloaded models:\n");
      for (const m of downloaded) process.stdout.write(`  ${m.id}\n`);
    }
    return;
  }

  if (sub === "list") {
    const downloaded = new Set((await listDownloadedModels()).map((m) => m.id));
    for (const m of MODEL_CATALOG) {
      process.stdout.write(`  ${downloaded.has(m.id) ? "*" : " "} ${m.id}  [${m.tier}] ~${m.approxMb} MB  needs >= ${m.minRamGb} GB RAM\n`);
    }
    return;
  }

  if (sub === "use") {
    const target = positional[0] || args[1];
    if (!target) throw new Error("Usage: lx model use <apple-fm|llama-server|ollama|openai-compat|model-id>");
    if (target === "apple-fm" || target === "llama-server" || target === "ollama" || target === "openai-compat" || target === "auto") {
      config.provider.active = target;
      if (target === "openai-compat") {
        const baseUrl = options["base-url"];
        if (baseUrl) config.provider.openaiCompat.baseUrl = String(baseUrl).replace(/\/+$/, "");
        if (options["api-key-env"]) config.provider.openaiCompat.apiKeyEnv = String(options["api-key-env"]);
        if (options["model-id"]) config.provider.openaiCompat.model = String(options["model-id"]);
      }
      const file = await saveConfig(config);
      process.stdout.write(`Provider set to ${target} (${file})\n`);
      if (target === "apple-fm") {
        process.stdout.write("Note: apple-fm is experimental — MUCH slower per plan (spawns a helper + on-device generation) and less accurate than llama-server.\n");
      }
      return;
    }
        if (!modelFilePath(target) && !MODEL_CATALOG.some((m) => m.id === target) && !target.includes(":")) {
      process.stdout.write(`Note: '${target}' is not in the catalog; storing as a custom model id.\n`);
    }
    config.model = target;
    const file = await saveConfig(config);
    process.stdout.write(`Model set to ${target} (${file})\n`);
    return;
  }

  if (sub === "download") {
    const id = positional[0] || args[1];
    if (!id) throw new Error("Usage: lx model download <id>");
    const res = await downloadModel(id, { onProgress: ui.progress(id) });
    process.stdout.write(`${res.cached ? "Already present" : "Downloaded"}: ${res.path}\n`);
    if (!config.model) {
      config.model = id;
      await saveConfig(config);
      process.stdout.write(`Active model: ${id}\n`);
    }
    return;
  }

  if (sub === "remove") {
    const id = positional[0] || args[1];
    if (!id) throw new Error("Usage: lx model remove <id>");
    const removed = await removeModel(id);
    for (const r of removed) process.stdout.write(`removed ${r}\n`);
    if (!removed.length) process.stdout.write("Nothing removed.\n");
    return;
  }

  if (sub === "start") {
    await ensureServer(config, { onProgress: (m) => process.stdout.write(`  ${m}\n`) });
    process.stdout.write("llama-server running.\n");
    return;
  }

  if (sub === "stop") {
    const stopped = await stopServer();
    process.stdout.write(stopped ? "llama-server stopped.\n" : "llama-server was not running.\n");
    return;
  }


  if (sub === "runtime") {
    const action = positional[0] || args[1] || "install";
    if (action === "install") {
      const rt = await installRuntime(machine, { backend: options.backend || config.runtime?.backend || "auto", onProgress: ui.progress("llama.cpp") });
      process.stdout.write(`Runtime installed: ${rt.binary} (backend ${rt.backend})\n`);
      return;
    }
    if (action === "build-apple") {
      await buildAppleHelper();
      return;
    }
    throw new Error("Usage: lx model runtime <install|build-apple> [--backend cpu|vulkan|cuda|metal]");
  }

  throw new Error("Usage: lx model <status|list|use|download|remove|start|stop|runtime>");
}

async function buildAppleHelper() {
  if (process.platform !== "darwin" || process.arch !== "arm64") {
    throw new Error("The Apple helper can only be built on Apple Silicon macOS.");
  }
  const { packageRoot } = await import("../paths.mjs");
  const helperSrc = `${packageRoot()}/../platform/apple-fm-helper`;
  const out = appleHelperPath();
  await fs.mkdir(`${packageRoot()}/bin/darwin-arm64`, { recursive: true });
  const code = await new Promise((resolve) => {
    const child = spawn("sh", ["-c", `cd ${JSON.stringify(helperSrc)} && swift build -c release 2>&1 | tail -5 && cp .build/release/lexis-apple-fm ${JSON.stringify(out)} && chmod +x ${JSON.stringify(out)}`], { stdio: "inherit" });
    child.on("exit", (c) => resolve(c ?? 1));
    child.on("error", () => resolve(1));
  });
  if (code !== 0) throw new Error("swift build failed — install Xcode Command Line Tools (xcode-select --install).");
  process.stdout.write(`Built ${out}\n`);
}

function parseFlags(args) {
  const options = {};
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const v = args[i];
    if (!v.startsWith("--")) { positional.push(v); continue; }
    const key = v.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) { options[key] = true; continue; }
    options[key] = next;
    i += 1;
  }
  return { options, positional };
}
