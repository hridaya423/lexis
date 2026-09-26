import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import net from "node:net";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { runtimeDir, runtimeLogPath, runtimeStatePath, modelsDir } from "../paths.mjs";
import { catalogEntry, modelFilePath } from "./models.mjs";
import { installedRuntime } from "./installer.mjs";

const READY_TIMEOUT_MS = 240000;

async function writeState(state) {
  const statePath = runtimeStatePath();
  const tmp = `${statePath}.tmp-${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(state), { mode: 0o600 });
  await fs.rename(tmp, statePath);
}

export function serverFlagList() {
  return [
    "-c", "4096",
    "-ngl", "99",
    "--jinja",
    "--no-ui",
    "--alias", "lexis",
    ...(process.env.LEXIS_SERVER_ARGS || "").split(/\s+/).filter(Boolean),
  ];
}

export async function supervisorMain(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) args[argv[i].slice(2)] = argv[i + 1];
  }
  const binary = args.binary;
  const modelFile = args.model;
  const port = Number(args.port);
  const idleSec = Number(args.idle || 600);

  if (!binary || !modelFile || !port) {
    process.stderr.write("supervisor: missing --binary/--model/--port\n");
    process.exit(1);
  }

  const statePath = runtimeStatePath();
  await fs.mkdir(runtimeDir(), { recursive: true });

  const apiKey = process.env.LEXIS_SERVER_API_KEY || args.key || "";
  const childArgs = [
    "-m", modelFile,
    "--host", "127.0.0.1",
    "--port", String(port),
    ...serverFlagList(),
  ];
  const childEnv = { ...process.env };
  delete childEnv.LEXIS_SERVER_API_KEY;
  if (apiKey) childEnv.LLAMA_API_KEY = apiKey;
  if (process.platform === "darwin" && process.env.LEXIS_METAL_RESIDENCY !== "1") {
    childEnv.GGML_METAL_NO_RESIDENCY = "1";
  }

  const logFd = fsSync.openSync(runtimeLogPath(), "a");
  let child = spawn(binary, childArgs, {
    detached: false,
    stdio: ["ignore", logFd, logFd],
    windowsHide: true,
    env: childEnv,
  });

  const state = {
    supervisorPid: process.pid,
    serverPid: child.pid,
    port,
    binary,
    modelFile,
    backend: args.backend || "",
    serverFlags: serverFlagList(),
    apiKey,
    startedAt: new Date().toISOString(),
    lastUsedAt: Date.now(),
    status: "running",
  };
  await writeState(state);
  fsSync.closeSync(logFd);

  if (apiKey) {
    const authed = await waitForAuthEnforced(port, apiKey, 30000);
    if (!authed && !child.killed && child.exitCode === null) {
      child.kill("SIGKILL");
      await new Promise((r) => child.once("exit", r));
      const logFd2 = fsSync.openSync(runtimeLogPath(), "a");
      fsSync.writeSync(logFd2, "supervisor: LLAMA_API_KEY ignored; respawning with --api-key flag\n");
      child = spawn(binary, [...childArgs, "--api-key", apiKey], {
        detached: false,
        stdio: ["ignore", logFd2, logFd2],
        windowsHide: true,
        env: childEnv,
      });
      fsSync.closeSync(logFd2);
      state.serverPid = child.pid;
      state.keyViaArgv = true;
      await writeState(state);
    }
  }

  let exited = false;
  child.on("exit", (code, signal) => {
    exited = true;
    (async () => {
      try {
        const cur = JSON.parse(await fs.readFile(statePath, "utf8"));
        if (cur.supervisorPid !== process.pid) return;
        await writeState({ ...state, serverPid: child.pid, status: "crashed", exitCode: code, signal: signal || null });
      } catch {}
    })().finally(() => process.exit(code ?? 1));
  });

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  let shuttingDown = false;
  function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    if (!exited) child.kill("SIGTERM");
    setTimeout(() => { if (!exited) child.kill("SIGKILL"); }, 5000).unref();
    setTimeout(() => process.exit(0), 6000).unref();
  }

  setInterval(async () => {
    if (exited) return;
    try {
      const raw = JSON.parse(await fs.readFile(statePath, "utf8"));
      if (raw.supervisorPid && raw.supervisorPid !== process.pid) {
        shutdown();
        return;
      }
      const lastUsed = Number(raw.lastUsedAt || 0);
      if (idleSec > 0 && Date.now() - lastUsed > idleSec * 1000) {
        shutdown();
      }
    } catch {
      shutdown();
    }
  }, 5000).unref();
}

async function waitForAuthEnforced(port, apiKey, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/v1/models`, { signal: AbortSignal.timeout(1500) });
      if (res.status === 401 || res.status === 403) return true;
      if (res.ok) {
        const withKey = await fetch(`http://127.0.0.1:${port}/v1/models`, {
          headers: { authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(1500),
        });
        if (withKey.ok) return false;
      }
    } catch {}
    await sleep(500);
  }
  return false;
}

export async function readRuntimeState() {
  try {
    const state = JSON.parse(await fs.readFile(runtimeStatePath(), "utf8"));
    const supervisorAlive = state.supervisorPid ? pidAlive(state.supervisorPid) : false;
    const serverAlive = state.serverPid ? pidAlive(state.serverPid) : false;
    return {
      ...state,
      running: supervisorAlive && serverAlive && state.status === "running",
    };
  } catch {
    return { running: false };
  }
}

export async function ensureServer(config, { onProgress } = {}) {
  const wanted = await resolveServeTarget(config);
  if (!wanted.binary) {
    throw new Error("llama-server runtime not installed. Run: lx model runtime install");
  }
  if (!wanted.modelFile) {
    throw new Error("No model installed. Run: lx model download kitty-bash-0.5b");
  }

  const state = await readRuntimeState();
  const wantedFlags = serverFlagList();
  const sameTarget =
    state.running &&
    state.modelFile === wanted.modelFile &&
    state.binary === wanted.binary &&
    sameFlags(state.serverFlags, wantedFlags);

  if (sameTarget) {
    const deadline = Date.now() + READY_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const current = await readRuntimeState();
      if (!current.running || current.modelFile !== wanted.modelFile) break;
      if (await healthOk(current.port, current.apiKey)) {
        await touchState();
        return current;
      }
      await sleep(500);
    }
    await stopServer();
  } else if (state.running) {
    await stopServer();
  }

  const lockDir = `${runtimeStatePath()}.lock`;
  let locked = false;
  try {
    await fs.mkdir(lockDir);
    locked = true;
  } catch {}
  while (!locked) {
    const waited = await waitForPeerStartup(lockDir, wanted);
    if (waited) return waited;
    await fs.rm(lockDir, { recursive: true, force: true }).catch(() => {});
    try {
      await fs.mkdir(lockDir);
      locked = true;
    } catch {
      await sleep(50);
    }
  }

  try {
    const port = config?.runtime?.port > 0 ? config.runtime.port : await pickPort();
    const supervisorScript = path.join(path.dirname(fileURLToPath(import.meta.url)), "supervisor.mjs");
    const idleSec = Math.max(0, Number(config?.runtime?.idleTimeoutSec ?? 600));
    const apiKey = crypto.randomBytes(16).toString("hex");

    onProgress?.("Starting local model server...");
    const logFd = fsSync.openSync(runtimeLogPath(), "a");
    const child = spawn(process.execPath, [
      supervisorScript,
      "--supervise",
      "--binary", wanted.binary,
      "--model", wanted.modelFile,
      "--port", String(port),
      "--idle", String(idleSec),
      "--backend", wanted.backend || "",
    ], {
      detached: true,
      stdio: ["ignore", logFd, logFd],
      windowsHide: true,
      env: { ...process.env, LEXIS_SERVER_API_KEY: apiKey },
    });
    fsSync.closeSync(logFd);
    child.unref();

    await writeState({
      supervisorPid: child.pid,
      port,
      binary: wanted.binary,
      modelFile: wanted.modelFile,
      backend: wanted.backend || "",
      serverFlags: serverFlagList(),
      apiKey,
      startedAt: new Date().toISOString(),
      lastUsedAt: Date.now(),
      status: "starting",
    });

    const startedAt = Date.now();
    while (Date.now() - startedAt < READY_TIMEOUT_MS) {
      if (await healthOk(port, apiKey)) {
        await touchState();
        const current = await readRuntimeState();
        return { ...current, port, running: true, modelFile: wanted.modelFile, binary: wanted.binary, apiKey };
      }
      const current = await readRuntimeState();
      if (current.status === "crashed") {
        const logs = tailLog();
        throw new Error(`llama-server exited during startup (code ${current.exitCode}).${logs ? `\n${logs}` : ""}`);
      }
      await sleep(500);
    }
    throw new Error(`llama-server did not become ready within ${READY_TIMEOUT_MS / 1000}s. Logs: ${runtimeLogPath()}`);
  } finally {
    await fs.rm(lockDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function waitForPeerStartup(lockDir, wanted, timeoutMs = READY_TIMEOUT_MS) {
  const startedAt = Date.now();
  let lockGoneTicks = 0;
  while (Date.now() - startedAt < timeoutMs) {
    const state = await readRuntimeState();
    if (
      state.running &&
      state.modelFile === wanted.modelFile &&
      (await healthOk(state.port, state.apiKey))
    ) {
      return state;
    }
    if (fsSync.existsSync(lockDir)) {
      lockGoneTicks = 0;
    } else {
      lockGoneTicks += 1;
      if (lockGoneTicks >= 4) return null;
    }
    await sleep(500);
  }
  return null;
}

function sameFlags(a, b) {
  return Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);
}

export async function touchState() {
  try {
    const state = JSON.parse(await fs.readFile(runtimeStatePath(), "utf8"));
    state.lastUsedAt = Date.now();
    await writeState(state);
  } catch {}
}

export async function stopServer() {
  const state = await readRuntimeState();
  const pids = [state.supervisorPid, state.serverPid].filter((p) => p && pidAlive(p));
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {}
  }
  const deadline = Date.now() + 8000;
  while (pids.some(pidAlive) && Date.now() < deadline) {
    await sleep(150);
  }
  for (const pid of pids) {
    if (pidAlive(pid)) {
      try {
        process.kill(pid, "SIGKILL");
      } catch {}
    }
  }
  await fs.rm(runtimeStatePath(), { force: true }).catch(() => {});
  return pids.length > 0;
}

async function resolveServeTarget(config) {
  const installed = await installedRuntime();
  const binary = installed?.binary || "";
  const modelId = String(config?.model || "").trim();
  let modelFile = "";
  if (modelId) {
    const entry = catalogEntry(modelId);
    if (entry) {
      modelFile = modelFilePath(entry.id);
    } else if (modelId.includes(path.sep) || modelId.endsWith(".gguf")) {
      modelFile = fsSync.existsSync(modelId) ? modelId : path.join(modelsDir(), modelId);
    } else {
      const downloaded = await listGguf();
      const slug = modelId.toLowerCase().replace(/[^\w.-]+/g, "");
      modelFile = downloaded.find((f) => path.basename(f).toLowerCase().includes(slug)) || downloaded[0] || "";
    }
  } else {
    const downloaded = await listGguf();
    modelFile = downloaded[0] || "";
  }
  if (modelFile && !fsSync.existsSync(modelFile)) modelFile = "";
  return { binary, modelFile, backend: installed?.backend || "" };
}

async function listGguf() {
  try {
    return (await fs.readdir(modelsDir()))
      .filter((f) => f.endsWith(".gguf") && fsSync.statSync(path.join(modelsDir(), f)).size > 0)
      .map((f) => path.join(modelsDir(), f));
  } catch {
    return [];
  }
}

async function healthOk(port, apiKey) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return false;
    if (!apiKey) return true;
    const authed = await fetch(`http://127.0.0.1:${port}/v1/models`, {
      headers: { authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(1500),
    });
    return authed.ok;
  } catch {
    return false;
  }
}

async function pickPort() {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on("error", () => resolve(8000));
  });
}

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function tailLog() {
  try {
    const raw = fsSync.readFileSync(runtimeLogPath(), "utf8");
    return raw.trim().split("\n").filter(Boolean).slice(-15).join("\n");
  } catch {
    return "";
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly && process.argv.includes("--supervise")) {
  const start = process.argv.indexOf("--supervise") + 1;
  supervisorMain(process.argv.slice(start)).catch((error) => {
    process.stderr.write(`supervisor: ${error?.message || error}\n`);
    process.exit(1);
  });
}
