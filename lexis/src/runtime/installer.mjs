import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { ASSETS, LLAMA_CPP_TAG, assetKeyFor, assetUrl } from "./llama-release.mjs";
import { runtimeDir } from "../paths.mjs";
import { recordManifestEntry } from "../manifest.mjs";

export function pickBackend(machine, requested) {
  const req = String(requested || "auto").toLowerCase();
  if (["metal", "vulkan", "cuda", "cpu"].includes(req)) {
    if (req === "metal" && !(machine.platform === "darwin" && machine.arch === "arm64")) {
      throw new Error("Metal backend only exists for macOS arm64.");
    }
    return req;
  }
  if (machine.platform === "darwin") {
    return machine.arch === "arm64" ? "metal" : "cpu";
  }
  const detected = machine.gpu?.backend;
  return ["cuda", "vulkan"].includes(detected) ? detected : "cpu";
}

export async function installRuntime(machine, { backend = "auto", onProgress } = {}) {
  const resolved = pickBackend(machine, backend);
  const key = assetKeyFor({ platform: machine.platform, arch: machine.arch, backend: resolved });
  const asset = ASSETS[key];
  if (!asset) {
    throw new Error(`No llama.cpp build for ${machine.platform}-${machine.arch}-${resolved}`);
  }

  const destDir = path.join(runtimeDir(), `llama-${LLAMA_CPP_TAG}-${resolved}`);
  const already = await findLlamaServerBinary(destDir);
  if (already && (await probeBinary(already))) {
    return { dir: destDir, binary: already, backend: resolved, tag: LLAMA_CPP_TAG, cached: true };
  }

      const stageDir = `${destDir}.staging-${process.pid}`;
  await fs.rm(stageDir, { recursive: true, force: true });
  await fs.mkdir(stageDir, { recursive: true });

  try {
    const queue = [asset, ...(asset.extra || [])];
    for (const item of queue) {
      const url = assetUrl(item);
      const archivePath = path.join(stageDir, item.name);
      onProgress?.(`Downloading ${item.name}`);
      await downloadFile(url, archivePath, onProgress);
      if (item.sha256) {
        onProgress?.(`Verifying ${item.name}`);
        await verifySha256(archivePath, item.sha256);
      } else {
        onProgress?.(`Warning: no checksum on record for ${item.name}; skipping verification`);
      }
      onProgress?.(`Extracting ${item.name}`);
      await extractArchive(archivePath, stageDir, item.format);
      await fs.rm(archivePath, { force: true });
    }

    const binary = await findLlamaServerBinary(stageDir);
    if (!binary) {
      throw new Error("llama-server binary not found after extraction.");
    }
    if (!(await probeBinary(binary))) {
      throw new Error("llama-server binary failed its --version probe (broken or wrong-architecture build).");
    }

    await fs.rm(destDir, { recursive: true, force: true });
    await fs.rename(stageDir, destDir);
  } catch (error) {
    await fs.rm(stageDir, { recursive: true, force: true }).catch(() => {});
    const cpuKey = assetKeyFor({ platform: machine.platform, arch: machine.arch, backend: "cpu" });
    if (resolved !== "cpu" && cpuKey !== key && /probe|extract|not found/i.test(String(error?.message))) {
      onProgress?.(`${resolved} build failed (${error.message}); falling back to CPU build.`);
      return installRuntime(machine, { backend: "cpu", onProgress });
    }
    throw error;
  }

  const binary = await findLlamaServerBinary(destDir);
  await recordManifestEntry("dirs", destDir);
  return { dir: destDir, binary, backend: resolved, tag: LLAMA_CPP_TAG, cached: false };
}

export async function installedRuntime() {
  let dirs = [];
  try {
    dirs = (await fs.readdir(runtimeDir()))
      .filter((d) => d.startsWith("llama-") && !d.endsWith(".tmp") && !d.includes("staging"))
      .sort()
      .reverse();
  } catch {
    return null;
  }
  for (const dir of dirs) {
    const full = path.join(runtimeDir(), dir);
    const binary = await findLlamaServerBinary(full);
    if (binary) {
      const backend = dir.split("-").pop() || "";
      return { dir: full, binary, backend };
    }
  }
  return null;
}

async function downloadFile(url, dest, onProgress) {
  const partial = `${dest}.partial`;
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(600000) });
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }
  const total = Number(response.headers.get("content-length") || 0);
  const out = fsSync.createWriteStream(partial);
  let received = 0;
  const reader = response.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (!out.write(Buffer.from(value))) {
        await once(out, "drain");
      }
      if (total > 0) {
        onProgress?.(`Downloaded ${Math.round((received / total) * 100)}%`, { received, total });
      }
    }
  } catch (error) {
    out.destroy();
    await fs.rm(partial, { force: true }).catch(() => {});
    throw error;
  }
  await new Promise((resolve, reject) => {
    out.end((err) => (err ? reject(err) : resolve()));
  });
  if (total > 0 && received !== total) {
    await fs.rm(partial, { force: true }).catch(() => {});
    throw new Error(`Truncated download: got ${received} of ${total} bytes for ${path.basename(dest)}`);
  }
  await fs.rename(partial, dest);
}

async function verifySha256(file, expected) {
  const hash = crypto.createHash("sha256");
  const stream = fsSync.createReadStream(file);
  for await (const chunk of stream) hash.update(chunk);
  const actual = hash.digest("hex");
  if (actual !== expected) {
    throw new Error(`sha256 mismatch for ${path.basename(file)}: expected ${expected}, got ${actual}`);
  }
}

async function extractArchive(archive, destDir, format) {
  if (format === "zip") {
    if (process.platform === "win32") {
      const r = await run("powershell", ["-NoProfile", "-NonInteractive", "-Command", `Expand-Archive -LiteralPath '${archive.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force`]);
      if (r !== 0) throw new Error(`Expand-Archive failed for ${archive}`);
      return;
    }
    const r = await run("unzip", ["-o", "-q", archive, "-d", destDir]);
    if (r !== 0) throw new Error(`unzip failed for ${archive}`);
    return;
  }
  const r = await run("tar", ["-xzf", archive, "-C", destDir]);
  if (r !== 0) throw new Error(`tar extract failed for ${archive}`);
}

async function findLlamaServerBinary(dir) {
  const name = process.platform === "win32" ? "llama-server.exe" : "llama-server";
  const candidates = [];
  async function walk(current, depth) {
    if (depth > 3) return;
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const p = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(p, depth + 1);
      } else if (entry.name === name) {
        candidates.push(p);
      }
    }
  }
  await walk(dir, 0);
  return candidates[0] || "";
}

async function probeBinary(binary) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(binary, ["--version"], { stdio: "ignore", windowsHide: true });
    } catch {
      resolve(false);
      return;
    }
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve(false);
    }, 60000);
    child.on("error", () => { clearTimeout(timer); resolve(false); });
    child.on("exit", (code) => { clearTimeout(timer); resolve(code === 0); });
  });
}

async function run(command, args, { timeout = 120000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "ignore"], windowsHide: true });
    const timer = setTimeout(() => { child.kill("SIGKILL"); resolve(1); }, timeout);
    child.on("error", () => { clearTimeout(timer); resolve(1); });
    child.on("exit", (c) => { clearTimeout(timer); resolve(c ?? 1); });
  });
}
