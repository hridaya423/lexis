import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { appleHelperPath, cacheDir } from "../paths.mjs";
import path from "node:path";

export const id = "apple-fm";
export const capabilities = {
  structuredOutput: true,   streaming: false,
  onDevice: true,
  maxContextTokens: 4096,
};

const AVAILABILITY_CACHE_MS = 10 * 60 * 1000;

function helperBin() {
  return appleHelperPath();
}

export async function availability() {
  if (process.platform !== "darwin" || process.arch !== "arm64") {
    return { ok: false, reason: "not-apple-silicon", detail: "Apple Foundation Models requires macOS 26+ on Apple Silicon." };
  }
  const bin = helperBin();
  try {
    await fs.access(bin, fs.constants?.X_OK ?? 1);
  } catch {
    return { ok: false, reason: "helper-missing", detail: "Helper binary not installed. Run: lx model runtime build-apple" };
  }

  const cached = await readAvailabilityCache();
  if (cached) return cached;

  const result = await runHelper(["availability"], null, 6000);
  const parsed = { ok: Boolean(result?.ok), reason: result?.reason, detail: result?.detail, contextSize: result?.contextSize };
  await writeAvailabilityCache(parsed);
  return parsed;
}

async function readAvailabilityCache() {
  try {
    const raw = JSON.parse(await fs.readFile(path.join(cacheDir(), "apple-fm-availability.json"), "utf8"));
    if (Date.now() - raw.ts < AVAILABILITY_CACHE_MS && typeof raw.ok === "boolean") {
      return { ok: raw.ok, reason: raw.reason, detail: raw.detail, contextSize: raw.contextSize };
    }
  } catch {}
  return null;
}

async function writeAvailabilityCache(result) {
  try {
    await fs.mkdir(cacheDir(), { recursive: true });
    await fs.writeFile(path.join(cacheDir(), "apple-fm-availability.json"), JSON.stringify({ ts: Date.now(), ...result }), "utf8");
  } catch {}
}

export async function ensureReady() {
  const avail = await availability();
  if (!avail.ok) {
    const hint =
      avail.reason === "appleIntelligenceNotEnabled"
        ? "Enable Apple Intelligence: System Settings > Apple Intelligence & Siri."
        : avail.reason === "modelNotReady"
          ? "The on-device model is still preparing. Retry in a minute."
          : avail.detail || "Apple Foundation Models is unavailable on this Mac.";
    throw new Error(`apple-fm unavailable (${avail.reason || "unknown"}): ${hint}\nSwitch: lx model use llama-server`);
  }
}

export async function plan({ systemPrompt, userPrompt, maxTokens, timeoutMs }) {
  const request = { instructions: systemPrompt, prompt: userPrompt, maxTokens };
  const result = await runHelper(["plan"], JSON.stringify(request) + "\n", timeoutMs || 60000);
  if (!result) {
    throw new Error("apple-fm helper returned no output");
  }
  if (result.ok && result.plan) {
    return { plan: result.plan, latencyMs: result.latencyMs };
  }
  const code = result.error || "unknown";
  const err = new Error(`apple-fm error (${code}): ${result.message || "generation failed"}`);
  err.code = code;
  throw err;
}

function runHelper(args, stdin, timeoutMs) {
  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn(helperBin(), args, { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    } catch (error) {
      reject(error);
      return;
    }
    const chunks = [];
    const errChunks = [];
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`lexis-apple-fm timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (c) => chunks.push(c));
    child.stderr.on("data", (c) => errChunks.push(c));
    child.on("error", (e) => { clearTimeout(timer); reject(e); });
    child.on("exit", (code) => {
      clearTimeout(timer);
      const stdout = Buffer.concat(chunks).toString("utf8").trim();
      const firstLine = stdout.split("\n").find((l) => l.trim().startsWith("{"));
      if (firstLine) {
        try {
          resolve(JSON.parse(firstLine));
          return;
        } catch {}
      }
      if (code === 0 && !stdout) {
        resolve(null);
        return;
      }
      reject(new Error(`lexis-apple-fm exited ${code}: ${Buffer.concat(errChunks).toString("utf8").slice(0, 300)}`));
    });
    if (stdin !== null) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}
