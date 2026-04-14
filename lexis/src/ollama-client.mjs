import fs from "node:fs/promises";
import process from "node:process";
import { parsePlanFromText } from "./plan-schema.mjs";
import { RISK_LEVELS } from "./constants.mjs";

const MAX_WEB_ITEMS_FOR_PROMPT = 1;
const MAX_TOP_WEB_CHARS = 1400;
const MAX_OTHER_WEB_CHARS = 500;

export async function loadSystemPrompt() {
  const promptUrl = new URL("../prompts/system-prompt.txt", import.meta.url);
  return fs.readFile(promptUrl, "utf8");
}

export async function generatePlanWithOllama({
  baseUrl,
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
        baseUrl,
        model: candidateModel,
        systemPrompt,
        enhancedPrompt,
        optionCandidates,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Ollama planning failed");
}

export async function reviewPlanRiskWithOllama({
  baseUrl,
  model,
  userPrompt,
  context,
  plan,
}) {
  const systemPrompt = [
    "You are a terminal safety reviewer.",
    "Return strict JSON only.",
    "Decide if the plan should remain critical or be downgraded.",
    "Mark critical only for broad irreversible destructive impact.",
    "Examples that are usually not critical: deleting node_modules, cache, temp directories.",
  ].join("\n");

  const enhancedPrompt = [
    `User intent: ${userPrompt}`,
    "",
    "Execution context:",
    `- platform: ${context.platform}`,
    `- shell: ${context.shell}`,
    `- cwd: ${context.cwd}`,
    "",
    "Plan JSON:",
    JSON.stringify(plan),
    "",
    "Return JSON object with fields:",
    "- revised_overall_risk: low|moderate|high|critical",
    "- force_double_confirmation: boolean",
    "- reason: string (<= 120 chars)",
  ].join("\n");

  const content = await requestOllamaPlan({
    baseUrl,
    model,
    systemPrompt,
    enhancedPrompt,
    options: {
      temperature: 0,
      num_predict: 220,
      num_ctx: 4096,
    },
    timeoutMs: 14000,
  });

  const review = parseJsonObject(content);
  const revisedRisk = normalizeRiskLevel(review?.revised_overall_risk) || "critical";

  return {
    revisedOverallRisk: revisedRisk,
    forceDoubleConfirmation:
      typeof review?.force_double_confirmation === "boolean"
        ? review.force_double_confirmation
        : revisedRisk === "critical",
    reason: typeof review?.reason === "string" ? review.reason.trim().slice(0, 240) : "",
  };
}

function isRetriablePlanningError(error) {
  const message = String(error?.message || "");
  return /json|empty response|unterminated|expected/i.test(message);
}

async function requestOllamaPlan({
  baseUrl,
  model,
  systemPrompt,
  enhancedPrompt,
  options,
  timeoutMs,
}) {
  const effectiveTimeoutMs =
    typeof timeoutMs === "number"
      ? timeoutMs
      : String(model).endsWith(":1.5b")
        ? 9000
        : 18000;

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    signal: AbortSignal.timeout(effectiveTimeoutMs),
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      keep_alive: "30m",
      options,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: enhancedPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  const content = payload?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("Ollama returned an empty response");
  }

  return content;
}

async function repairPlanJsonWithOllama({ baseUrl, model, rawContent }) {
  const repairPrompt = [
    "Repair the following broken JSON into valid JSON.",
    "Return JSON only, no markdown.",
    "Do not add extra explanation.",
    "Broken JSON:",
    rawContent.slice(0, 6000),
  ].join("\n");

  return requestOllamaPlan({
    baseUrl,
    model,
    systemPrompt: "You are a strict JSON repair tool.",
    enhancedPrompt: repairPrompt,
    options: {
      temperature: 0,
      num_predict: 900,
      num_ctx: 4096,
    },
    timeoutMs: 7000,
  });
}

async function generatePlanForModel({
  baseUrl,
  model,
  systemPrompt,
  enhancedPrompt,
  optionCandidates,
}) {
  let lastError;

  for (const options of optionCandidates) {
    try {
      const content = await requestOllamaPlan({
        baseUrl,
        model,
        systemPrompt,
        enhancedPrompt,
        options,
        timeoutMs: String(model).endsWith(":1.5b") ? 9000 : 18000,
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
          const repaired = await repairPlanJsonWithOllama({
            baseUrl,
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

function buildOptionCandidates(baseOptions) {
  return [
    baseOptions,
    {
      ...baseOptions,
      num_predict: Math.min(baseOptions.num_predict * 2, 1000),
      num_ctx: Math.min(baseOptions.num_ctx + 1024, 8192),
    },
  ];
}

function getFallbackModelCandidates(model) {
  if (process.env.LEXIS_ENABLE_MODEL_FALLBACK !== "1") {
    return [];
  }

  const candidates = [];
  if (String(model).endsWith(":1.5b")) {
    candidates.push("qwen2.5-coder:14b", "qwen3:14b");
  }

  return candidates.filter((candidate) => candidate !== model);
}

function parseJsonObject(text) {
  const trimmed = String(text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first === -1 || last === -1 || last <= first) {
      return {};
    }

    try {
      return JSON.parse(trimmed.slice(first, last + 1));
    } catch {
      return {};
    }
  }
}

function normalizeRiskLevel(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "medium") {
    return "moderate";
  }
  return RISK_LEVELS.includes(normalized) ? normalized : "";
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

  let numPredict = 240;
  if (score >= 2) {
    numPredict = 360;
  }
  if (score >= 3) {
    numPredict = 520;
  }
  if (score >= 4) {
    numPredict = 760;
  }

  const numCtx = hasWebContext ? 4096 : 1536;

  return {
    temperature: 0,
    num_predict: numPredict,
    num_ctx: numCtx,
  };
}
