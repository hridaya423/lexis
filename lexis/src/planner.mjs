import { parsePlanFromText, validatePlan } from "./plan-schema.mjs";
import { buildUserPrompt } from "./prompt.mjs";
import { catalogEntry } from "./runtime/models.mjs";

export const PLAIN_SYSTEM_PROMPT = `You are a bash command generator. Given a natural language request, output only the bash command that accomplishes it. No explanation, no markdown fences.`;

export const FIXCMD_SYSTEM_PROMPT = `You fix broken bash commands. Given a failed command and its error output, output only the corrected command. No explanation.`;


export async function generatePlan({
  providerImpl,
  providerId,
  model,
  systemPrompt,
  userPrompt,
  context,
  webContext,
  config,
  timeoutMs,
  onResult,
  task,
}) {
  const entry = catalogEntry(model);
  const plain = entry?.format === "plain";
  if (plain && context?.platform && !(entry.platforms || ["unix"]).includes(context.platform)) {
    throw new Error(`${model} only produces ${(entry.platforms || ["unix"]).join("/")} single commands — pick a schema model for ${context.platform}.`);
  }
  const osHint = entry?.dialectHint === false
    ? context?.platform || "unix"
    : /darwin|macos/i.test(context?.os || "")
      ? "macOS (BSD)"
      : /linux/i.test(context?.os || "")
        ? "Linux (GNU)"
        : context?.platform || "unix";
  let prompt = plain
    ? (task === "fixcmd" ? userPrompt : `${userPrompt}\n(Platform: ${osHint}, shell: ${context?.shell || "sh"})`)
    : buildUserPrompt({ userPrompt, context, webContext, providerId });
  if (plain && webContext?.length && entry?.webContext !== false) {
    const r = webContext[0];
    prompt += `\n\nReference: ${r.title} — ${r.url}\n${String(r.content || "").slice(0, 600)}`;
  }
  const maxTokens = estimateMaxTokens(userPrompt, webContext);

  let lastError;
  const attempts = providerImpl.capabilities?.structuredOutput && !plain ? 1 : 2;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const res = await providerImpl.plan(
        { systemPrompt: plain ? (task === "fixcmd" ? FIXCMD_SYSTEM_PROMPT : PLAIN_SYSTEM_PROMPT) : systemPrompt, userPrompt: prompt, model, maxTokens, timeoutMs, raw: plain },
        { config }
      );
      onResult?.({ usage: res?.usage, timings: res?.timings, attempt });
      if (res?.plan) {
        return validatePlan(res.plan);
      }
      if (plain) {
        return wrapPlainCommand(res?.text, context?.platform || "unix");
      }
      return parsePlanFromText(res?.text || "");
    } catch (error) {
      lastError = error;
      if (!isRetriable(error)) throw error;
    }
  }
  throw lastError || new Error("Planning failed");
}

function wrapPlainCommand(text, platform) {
  const command = String(text || "")
    .split("\n").map((l) => l.trim()).filter((l) => l && !/^```/.test(l))[0] || "";
  if (!command) throw new Error("Model produced no command");
  return {
    summary: "single command",
    overall_risk: "low",
    confidence: 0.8,
    requires_confirmation: false,
    commands: [{ command, intent: "single command", risk: "low", requires_confirmation: false, platform }],
  };
}

function isRetriable(error) {
  const m = String(error?.message || "");
  return /json|empty response|unterminated|expected|timed out|timeout|econnrefused|fetch failed/i.test(m);
}

export function estimateMaxTokens(userPrompt, webContext) {
  const prompt = String(userPrompt || "");
  let score = 0;
  if (prompt.length > 120) score += 1;
  if (prompt.length > 260) score += 1;
  if (/\b(and|then|after|before|also|plus|while|meanwhile|except)\b/i.test(prompt)) score += 1;
  if (/\n|;|\d\.|\(|\)/.test(prompt)) score += 1;
  if (Array.isArray(webContext) && webContext.length > 0) score += 1;
  let maxTokens = 200;
  if (score >= 2) maxTokens = 300;
  if (score >= 3) maxTokens = 400;
  if (score >= 4) maxTokens = 500;
  return maxTokens;
}

export function estimateTimeoutMs(model) {
  const text = String(model || "").toLowerCase();
  const m = text.match(/(\d+(?:\.\d+)?)b/);
  const sizeB = m ? Number.parseFloat(m[1]) : Number.NaN;
  if (Number.isFinite(sizeB) && sizeB >= 14) return 150000;
  if (Number.isFinite(sizeB) && sizeB >= 7) return 90000;
  if (Number.isFinite(sizeB) && sizeB <= 3) return 60000;
  return 80000;
}
