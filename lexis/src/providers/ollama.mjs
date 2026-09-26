import { spawnSync } from "node:child_process";
import { PLAN_JSON_SCHEMA } from "../plan-schema.mjs";

export const id = "ollama";
export const capabilities = {
  structuredOutput: true,   streaming: false,
  onDevice: true,
  maxContextTokens: 8192,
};

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";

function baseUrl(config) {
  return (config?.provider?.ollamaBaseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

export async function availability() {
  try {
    const check = spawnSync("ollama", ["--version"], {
      stdio: "pipe",
      encoding: "utf8",
      windowsHide: true,
      timeout: 4000,
    });
    if (check.status !== 0) {
      return { ok: false, reason: "ollama-not-installed", detail: "Install Ollama: https://ollama.com" };
    }
  } catch {
    return { ok: false, reason: "ollama-not-installed", detail: "Install Ollama: https://ollama.com" };
  }
  return { ok: true };
}

export async function ensureReady(config, { onProgress } = {}) {
  const url = baseUrl(config);
  const startedAt = Date.now();
  while (Date.now() - startedAt < 30000) {
    try {
      const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return;
    } catch {}
        if (Date.now() - startedAt > 3000 && !ensureReady._triedStart) {
      ensureReady._triedStart = true;
      try {
        const { spawn } = await import("node:child_process");
        const child = spawn("ollama", ["serve"], { detached: true, stdio: "ignore", windowsHide: true });
        child.unref();
        onProgress?.("Starting Ollama...");
      } catch {}
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Ollama not reachable at ${url}. Run 'ollama serve' or install Ollama.`);
}
ensureReady._triedStart = false;

export async function plan({ systemPrompt, userPrompt, model, maxTokens, timeoutMs }, { config } = {}) {
  const url = baseUrl(config);
  const body = {
    model,
    stream: false,
    keep_alive: "10m",
    format: PLAN_JSON_SCHEMA.schema,
    options: { temperature: 0, num_predict: maxTokens },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
  const response = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Ollama request failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
  }
  const payload = await response.json();
  const text = payload?.message?.content || "";
  if (!text.trim()) {
    throw new Error("Ollama returned an empty response");
  }
  return { text };
}

const OLLAMA_TAG_BY_CATALOG_ID = {
  "qwen2.5-coder-1.5b": "qwen2.5-coder:1.5b",
  "qwen2.5-coder-3b": "qwen2.5-coder:3b",
  "qwen2.5-coder-7b": "qwen2.5-coder:7b",
  "qwen2.5-coder-14b": "qwen2.5-coder:14b",
  "qwen3-4b": "qwen3:4b",
  "qwen3-linuxcmd-4b": "qwen3:4b",
  "kitty-bash-0.5b": "qwen2.5-coder:0.5b",
};

export function catalogIdToOllamaTag(id) {
  return OLLAMA_TAG_BY_CATALOG_ID[id] || id;
}
