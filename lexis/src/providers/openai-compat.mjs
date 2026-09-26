
export const id = "openai-compat";
export const capabilities = {
  structuredOutput: false,   streaming: false,
  onDevice: false,
  maxContextTokens: 32768,
};

function settings(config) {
  const c = config?.provider?.openaiCompat || {};
  return {
    baseUrl: String(c.baseUrl || "").replace(/\/+$/, ""),
    model: String(c.model || ""),
    apiKey: c.apiKeyEnv ? process.env[c.apiKeyEnv] || "" : "",
  };
}

export async function availability(_machine, config) {
  const { baseUrl, model } = settings(config);
  if (!baseUrl) return { ok: false, reason: "not-configured", detail: "Run: lx model use openai-compat --base-url <url> --model <id>" };
  return { ok: true, detail: model ? `model: ${model}` : "set a model with --model" };
}

export async function ensureReady() {
  return;
}

export async function plan({ systemPrompt, userPrompt, model, maxTokens, timeoutMs }, { config } = {}) {
  const { baseUrl, model: configuredModel, apiKey } = settings(config);
  const useModel = configuredModel || model;
  const headers = { "content-type": "application/json" };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  const body = {
    model: useModel,
    stream: false,
    temperature: 0,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`OpenAI-compatible request failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
  }
  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content || "";
  if (!text.trim()) throw new Error("Provider returned an empty response");
  return { text, usage: payload?.usage };
}
