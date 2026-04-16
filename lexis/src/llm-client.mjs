import fs from "node:fs/promises";
import process from "node:process";
import { parsePlanFromText } from "./plan-schema.mjs";

const MAX_WEB_ITEMS_FOR_PROMPT = 1;
const MAX_TOP_WEB_CHARS = 1400;
const MAX_OTHER_WEB_CHARS = 500;

export async function loadSystemPrompt() {
  const promptUrl = new URL("../prompts/system-prompt.txt", import.meta.url);
  return fs.readFile(promptUrl, "utf8");
}

export async function generatePlanWithLLM({
  llm,
  model,
  systemPrompt,
  userPrompt,
  context,
  webContext,
}) {
  const enhancedPrompt = buildUserPrompt({ userPrompt, context, webContext });
  const generationOptions = buildGenerationOptions({
    userPrompt,
    webContext,
  });

  const optionCandidates = buildOptionCandidates(generationOptions);
  const modelCandidates = [model, ...getFallbackModelCandidates(model)];

  let lastError;
  for (const candidateModel of modelCandidates) {
    try {
      return await generatePlanForModel({
        llm,
        model: candidateModel,
        systemPrompt,
        enhancedPrompt,
        optionCandidates,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("LLM planning failed");
}

function isRetriablePlanningError(error) {
  const message = String(error?.message || "");
  return /json|empty response|unterminated|expected|gateway timeout|bad gateway/i.test(message);
}

async function requestLLMPlan({
  llm,
  model,
  systemPrompt,
  enhancedPrompt,
  options,
  timeoutMs,
}) {
  const baseUrl = String(llm?.baseUrl || "http://127.0.0.1:8000").replace(/\/+$/, "");
  const effectiveTimeoutMs = typeof timeoutMs === "number" ? timeoutMs : 60000;
  const headers = {
    "content-type": "application/json",
  };

  if (typeof llm?.apiKey === "string" && llm.apiKey.trim()) {
    headers.authorization = `Bearer ${llm.apiKey.trim()}`;
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(effectiveTimeoutMs),
    body: JSON.stringify({
      model,
      stream: false,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      ...(String(llm?.provider || "").toLowerCase() === "mlx" ? {} : { response_format: { type: "json_object" } }),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: enhancedPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LLM request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((part) => part?.text || "").join("") : "";

  if (typeof text !== "string" || text.trim().length === 0) {
    throw new Error("LLM returned an empty response");
  }

  return text;
}

async function repairPlanJsonWithLLM({ llm, model, rawContent }) {
  const repairPrompt = [
    "Repair the following broken JSON into valid JSON.",
    "Return JSON only, no markdown.",
    "Do not add extra explanation.",
    "Broken JSON:",
    rawContent.slice(0, 6000),
  ].join("\n");

  return requestLLMPlan({
    llm,
    model,
    systemPrompt: "You are a strict JSON repair tool.",
    enhancedPrompt: repairPrompt,
    options: {
      temperature: 0,
      max_tokens: 900,
    },
    timeoutMs: 20000,
  });
}

async function generatePlanForModel({
  llm,
  model,
  systemPrompt,
  enhancedPrompt,
  optionCandidates,
}) {
  let lastError;

  for (const options of optionCandidates) {
    try {
      const content = await requestLLMPlan({
        llm,
        model,
        systemPrompt,
        enhancedPrompt,
        options,
        timeoutMs: estimateModelTimeoutMs(model),
      });

      try {
        return parsePlanFromText(content);
      } catch (error) {
        error.rawContent = content;
        throw error;
      }
    } catch (error) {
      if (error?.rawContent && isRetriablePlanningError(error)) {
        try {
          const repaired = await repairPlanJsonWithLLM({
            llm,
            model,
            rawContent: error.rawContent,
          });
          return parsePlanFromText(repaired);
        } catch {
          // Fall through to next option candidate.
        }
      }

      lastError = error;
      if (!isRetriablePlanningError(error)) {
        break;
      }
    }
  }

  throw lastError || new Error("Planning failed for model");
}

function estimateModelTimeoutMs(model) {
  const text = String(model || "").toLowerCase();
  const sizeMatch = text.match(/(\d+(?:\.\d+)?)b/);
  const sizeInBillions = sizeMatch ? Number.parseFloat(sizeMatch[1]) : Number.NaN;

  if (Number.isFinite(sizeInBillions) && sizeInBillions >= 14) {
    return 150000;
  }
  if (Number.isFinite(sizeInBillions) && sizeInBillions >= 7) {
    return 90000;
  }
  if (Number.isFinite(sizeInBillions) && sizeInBillions <= 3) {
    return 50000;
  }
  return 80000;
}

function buildOptionCandidates(baseOptions) {
  return [
    baseOptions,
    {
      ...baseOptions,
      max_tokens: Math.min(baseOptions.max_tokens + 180, 720),
    },
  ];
}

function getFallbackModelCandidates(model) {
  if (process.env.LEXIS_ENABLE_MODEL_FALLBACK !== "1") {
    return [];
  }

  const text = String(model || "").toLowerCase();
  const sizeMatch = text.match(/(\d+(?:\.\d+)?)b/);
  const sizeInBillions = sizeMatch ? Number.parseFloat(sizeMatch[1]) : Number.NaN;
  const candidates = [];
  if (Number.isFinite(sizeInBillions) && sizeInBillions <= 3) {
    candidates.push("Qwen/Qwen2.5-Coder-7B-Instruct", "Qwen/Qwen2.5-Coder-14B-Instruct");
  }

  return candidates.filter((candidate) => candidate !== model);
}

function buildUserPrompt({ userPrompt, context, webContext }) {
  const parts = [
    `User intent: ${userPrompt}`,
    "",
    "Execution context:",
    `- platform: ${context.platform}`,
    `- shell: ${context.shell}`,
    `- cwd: ${context.cwd}`,
  ];

  if (webContext && webContext.length > 0) {
    parts.push("", "Web context:");
    for (const [index, item] of webContext.slice(0, MAX_WEB_ITEMS_FOR_PROMPT).entries()) {
      parts.push(`- ${item.title} (${item.url})`);
      const limit = index === 0 ? MAX_TOP_WEB_CHARS : MAX_OTHER_WEB_CHARS;
      const content = String(item.content || "").slice(0, limit);
      if (content.trim().length > 0) {
        parts.push(`  ${content}`);
      }
    }

    const allowedUrls = webContext
      .slice(0, MAX_WEB_ITEMS_FOR_PROMPT)
      .map((item) => item.url)
      .filter((url) => typeof url === "string" && url.length > 0);

    if (allowedUrls.length > 0) {
      parts.push("", "Allowed URLs (must match exactly if you output URLs):");
      for (const url of allowedUrls) {
        parts.push(`- ${url}`);
      }
    }
  }

  parts.push("", "Return JSON object only.");
  return parts.join("\n");
}

function buildGenerationOptions({ userPrompt, webContext }) {
  const prompt = String(userPrompt || "");
  const hasWebContext = Array.isArray(webContext) && webContext.length > 0;

  let score = 0;
  if (prompt.length > 120) {
    score += 1;
  }
  if (prompt.length > 260) {
    score += 1;
  }
  if (/\b(and|then|after|before|also|plus|while|meanwhile|except)\b/i.test(prompt)) {
    score += 1;
  }
  if (/\n|;|\d\.|\(|\)/.test(prompt)) {
    score += 1;
  }
  if (hasWebContext) {
    score += 1;
  }

  let maxTokens = 140;
  if (score >= 2) {
    maxTokens = 220;
  }
  if (score >= 3) {
    maxTokens = 320;
  }
  if (score >= 4) {
    maxTokens = 420;
  }

  return {
    temperature: 0,
    max_tokens: maxTokens,
  };
}
