import fs from "node:fs/promises";
import { PLAN_JSON_SCHEMA } from "../plan-schema.mjs";
import { ensureServer } from "../runtime/supervisor.mjs";
import { runtimeDir, modelsDir } from "../paths.mjs";

export const id = "llama-server";
export const capabilities = {
  structuredOutput: true,
  streaming: false,
  onDevice: true,
  maxContextTokens: 8192,
};

async function installed() {
  try {
    const dirs = (await fs.readdir(runtimeDir())).filter((d) => d.startsWith("llama-"));
    const models = (await fs.readdir(modelsDir())).filter((f) => f.endsWith(".gguf"));
    return { runtime: dirs.length > 0, model: models.length > 0 };
  } catch {
    return { runtime: false, model: false };
  }
}

export async function availability() {
  const { runtime, model } = await installed();
  if (!runtime) {
    return { ok: false, reason: "runtime-not-installed", detail: "Run: lx model runtime install" };
  }
  if (!model) {
    return { ok: false, reason: "model-not-installed", detail: "Run: lx model download kitty-bash-0.5b" };
  }
  return { ok: true };
}

export async function ensureReady(config, { onProgress } = {}) {
  await ensureServer(config, { onProgress });
}

export function buildChatBody({ systemPrompt, userPrompt, maxTokens, raw = false, shots = null, temperature = 0, sample = null }) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...(shots || []).flatMap((s) => [
      { role: "user", content: s.request },
      { role: "assistant", content: s.answer },
    ]),
    { role: "user", content: userPrompt },
  ];
  const body = {
    model: "lexis",
    stream: false,
    temperature,
    max_tokens: maxTokens,
    messages,
    ...(sample || {}),
  };
  if (!raw) {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: PLAN_JSON_SCHEMA.name, schema: PLAN_JSON_SCHEMA.schema, strict: true },
    };
  }
  return body;
}

export async function chatCompletion(state, body, timeoutMs = 60000) {
  const headers = { "content-type": "application/json" };
  if (state.apiKey) headers.authorization = `Bearer ${state.apiKey}`;
  const response = await fetch(`http://127.0.0.1:${state.port}/v1/chat/completions`, {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`llama-server request failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
  }
  return response.json();
}

export async function plan({ systemPrompt, userPrompt, maxTokens, timeoutMs, raw = false, shots, temperature, sample }, { config } = {}) {
  const state = await ensureServer(config);
  const payload = await chatCompletion(state, buildChatBody({ systemPrompt, userPrompt, maxTokens, raw, shots, temperature, sample }), timeoutMs);
  const message = payload?.choices?.[0]?.message || {};
  const text = message.content || "";
  if (!text.trim()) {
    const reasoning = typeof message.reasoning_content === "string" ? message.reasoning_content.trim() : "";
    throw new Error(
      reasoning
        ? `llama-server returned only reasoning, no answer (${reasoning.slice(-160)})`
        : "llama-server returned an empty response"
    );
  }
  return { text, usage: payload?.usage, timings: payload?.timings, logprobs: payload?.choices?.[0]?.logprobs };
}

export async function stop() {
  const { stopServer } = await import("../runtime/supervisor.mjs");
  return stopServer();
}
