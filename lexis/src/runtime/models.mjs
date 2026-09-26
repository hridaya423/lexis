import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { modelsDir } from "../paths.mjs";
import { recordManifestEntry } from "../manifest.mjs";

export const MODEL_CATALOG = [
  {
    id: "qwen3-linuxcmd-4b",
    repo: "dieegorenan/Qwen3-linux-commands",
    file: "qwen3-4b-instruct-2507.Q4_K_M.gguf",
    sha256: "4e5dadb77cd482c23aa213b816edaa649a1c2297aca128b1edfe9c8fd2e6cf3e",
    tier: "experimental",
    minRamGb: 6,
    approxMb: 2500,
    format: "plain",
    platforms: ["unix", "windows"],
  },
  {
    id: "kitty-bash-0.5b",
    repo: "sahellx/kitty-bash-llm",
    file: "kitty-bash-llm-q4_k_m.gguf",
    sha256: "2ce919b9c7632721396b2cd37fd1801dcd084f94162c398b0b2f8731cabf8119",
    tier: "experimental",
    minRamGb: 2,
    approxMb: 400,
    format: "plain",
    platforms: ["unix"],
    dialectHint: false,
    webContext: false,
  },
];

export function catalogEntry(id) {
  return MODEL_CATALOG.find((m) => m.id === id) || null;
}

export function defaultModelFor() {
  return "kitty-bash-0.5b";
}

export function modelFilePath(id) {
  const entry = catalogEntry(id);
  if (!entry) return null;
  return path.join(modelsDir(), entry.file);
}

export async function listDownloadedModels() {
  const dir = modelsDir();
  let files = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  return files
    .filter((f) => f.endsWith(".gguf"))
    .map((f) => ({ file: f, path: path.join(dir, f), id: MODEL_CATALOG.find((m) => m.file === f)?.id || f }));
}

export async function downloadModel(id, { onProgress } = {}) {
  const entry = catalogEntry(id);
  if (!entry) {
    throw new Error(`Unknown model '${id}'. Run 'lx model list' for choices.`);
  }
  const dir = modelsDir();
  await fs.mkdir(dir, { recursive: true });
  const dest = path.join(dir, entry.file);
  const partial = `${dest}.partial`;
  const sizeFile = `${dest}.size`;

  try {
    const stat = await fs.stat(dest);
    const expected = Number(await fs.readFile(sizeFile, "utf8").catch(() => 0));
    const intact = expected > 0 ? stat.size === expected : stat.size > 0 && (await hasGgufMagic(dest));
    if (intact) {
      return { path: dest, cached: true };
    }
    onProgress?.(`Existing ${entry.file} looks incomplete — re-downloading.`);
    await fs.rm(dest, { force: true }).catch(() => {});
  } catch {}

  const url = `https://huggingface.co/${entry.repo}/resolve/main/${entry.file}`;
  onProgress?.(`Downloading ${entry.file} (~${entry.approxMb} MB)`);

  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(7200000) });
  if (!response.ok) {
    throw new Error(`Model download failed (${response.status}): ${url}`);
  }

  const total = Number(response.headers.get("content-length") || 0);
  const out = fsSync.createWriteStream(partial);
  let received = 0;
  let lastPct = -1;
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
        const pct = Math.round((received / total) * 100);
        if (pct !== lastPct) {
          lastPct = pct;
          onProgress?.(`${entry.file}: ${pct}%`, { received, total });
        }
      }
    }
  } catch (error) {
    out.destroy();
    await fs.rm(partial, { force: true }).catch(() => {});
    throw error;
  }
  await new Promise((resolve, reject) => out.end((err) => (err ? reject(err) : resolve())));

  if (total > 0 && received !== total) {
    await fs.rm(partial, { force: true }).catch(() => {});
    throw new Error(`Truncated download: got ${received} of ${total} bytes for ${entry.file}`);
  }
  if (entry.sha256) {
    onProgress?.(`Verifying ${entry.file}`);
    const actual = await sha256File(partial);
    if (actual !== entry.sha256) {
      await fs.rm(partial, { force: true }).catch(() => {});
      throw new Error(`sha256 mismatch for ${entry.file}: expected ${entry.sha256}, got ${actual}`);
    }
  }

  await fs.rename(partial, dest);
  await fs.writeFile(sizeFile, String(received), "utf8").catch(() => {});
  await recordManifestEntry("files", dest);
  return { path: dest, cached: false };
}

async function hasGgufMagic(file) {
  let fd;
  try {
    fd = await fs.open(file, "r");
    const buf = Buffer.alloc(4);
    await fd.read(buf, 0, 4, 0);
    return buf.toString("latin1") === "GGUF";
  } catch {
    return false;
  } finally {
    await fd?.close().catch(() => {});
  }
}

async function sha256File(file) {
  const hash = createHash("sha256");
  for await (const chunk of fsSync.createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

export async function removeModel(id) {
  const entry = catalogEntry(id);
  const targets = entry ? [modelFilePath(id)] : (await listDownloadedModels()).filter((m) => m.id === id).map((m) => m.path);
  const removed = [];
  for (const t of targets) {
    try {
      await fs.rm(t, { force: true });
      await fs.rm(`${t}.size`, { force: true });
      await fs.rm(`${t}.sha256`, { force: true });
      removed.push(t);
    } catch {}
  }
  return removed;
}
