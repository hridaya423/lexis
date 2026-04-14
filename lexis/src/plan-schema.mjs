import { RISK_LEVELS } from "./constants.mjs";

export function parsePlanFromText(text) {
  const json = extractJson(text);
  validatePlan(json);
  return json;
}

export function validatePlan(plan) {
  if (!isObject(plan)) {
    throw new Error("Plan must be an object");
  }

  assertString(plan.summary, "summary");
  plan.overall_risk = normalizeRisk(plan.overall_risk);
  assertRisk(plan.overall_risk, "overall_risk");
  assertNumber(plan.confidence, "confidence");

  if (plan.confidence < 0 || plan.confidence > 1) {
    throw new Error("confidence must be between 0 and 1");
  }

  assertBoolean(plan.requires_confirmation, "requires_confirmation");

  if (!Array.isArray(plan.commands) || plan.commands.length === 0) {
    throw new Error("commands must be a non-empty array");
  }

  for (const [index, command] of plan.commands.entries()) {
    validateCommand(command, index);
  }

  plan.preflight_checks = normalizeStringList(plan.preflight_checks);

  if (plan.sources !== undefined) {
    if (!Array.isArray(plan.sources)) {
      plan.sources = [];
    }

    plan.sources = plan.sources
      .map((source) => normalizeSource(source))
      .filter((source) => source !== null);

    for (const [index, source] of plan.sources.entries()) {
      assertString(source.title, `sources[${index}].title`);
      assertString(source.url, `sources[${index}].url`);
    }
  }
}

function validateCommand(command, index) {
  if (!isObject(command)) {
    throw new Error(`commands[${index}] must be an object`);
  }

  assertString(command.command, `commands[${index}].command`);
  assertString(command.intent, `commands[${index}].intent`);
  command.risk = normalizeRisk(command.risk);
  assertRisk(command.risk, `commands[${index}].risk`);
  assertBoolean(command.requires_confirmation, `commands[${index}].requires_confirmation`);

  if (command.platform !== undefined) {
    command.platform = normalizePlatform(command.platform);
    const valid = ["all", "unix", "windows"];
    if (!valid.includes(command.platform)) {
      throw new Error(`commands[${index}].platform must be one of ${valid.join(", ")}`);
    }
  }

  if (command.rollback !== undefined) {
    if (typeof command.rollback !== "string") {
      throw new Error(`commands[${index}].rollback must be a string`);
    }

    const normalizedRollback = command.rollback.trim();
    command.rollback = normalizedRollback.length > 0 ? normalizedRollback : "not_applicable";
  }
}

function extractJson(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");

    if (first === -1 || last === -1 || last <= first) {
      throw new Error("Model output did not contain JSON");
    }

    const sliced = trimmed.slice(first, last + 1);
    return JSON.parse(sliced);
  }
}

function assertString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
}

function assertNumber(value, field) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${field} must be a number`);
  }
}

function assertBoolean(value, field) {
  if (typeof value !== "boolean") {
    throw new Error(`${field} must be a boolean`);
  }
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item === null || item === undefined) {
        return "";
      }

      if (typeof item === "object") {
        if (typeof item.message === "string") {
          return item.message.trim();
        }
        if (typeof item.check === "string") {
          return item.check.trim();
        }
        if (typeof item.description === "string") {
          return item.description.trim();
        }
        if (typeof item.title === "string" && typeof item.command === "string") {
          return `${item.title.trim()}: ${item.command.trim()}`.trim();
        }
        if (typeof item.title === "string" && typeof item.url === "string") {
          return `${item.title.trim()}: ${item.url.trim()}`.trim();
        }
        try {
          const serialized = JSON.stringify(item);
          return serialized.length > 0 ? serialized : "";
        } catch {
          return "";
        }
      }

      return String(item).trim();
    })
    .filter(Boolean);
}

function normalizeSource(source) {
  if (isObject(source)) {
    const title = typeof source.title === "string" ? source.title.trim() : "";
    const url = typeof source.url === "string" ? source.url.trim() : "";

    if (!title || !url) {
      return null;
    }

    return { title, url };
  }

  if (typeof source === "string") {
    const text = source.trim();
    if (!text || !text.startsWith("http")) {
      return null;
    }
    return {
      title: text,
      url: text,
    };
  }

  return null;
}

function assertRisk(value, field) {
  if (!RISK_LEVELS.includes(value)) {
    throw new Error(`${field} must be one of: ${RISK_LEVELS.join(", ")}`);
  }
}

function normalizeRisk(value) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "medium") {
    return "moderate";
  }
  return normalized;
}

function normalizePlatform(value) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return "all";
  }

  if (["all", "any", "cross-platform", "cross_platform", "universal"].includes(normalized)) {
    return "all";
  }

  if (
    ["unix", "linux", "darwin", "mac", "macos", "posix", "bash", "zsh", "fish", "sh"].includes(
      normalized
    )
  ) {
    return "unix";
  }

  if (["windows", "win", "win32", "powershell", "pwsh", "cmd"].includes(normalized)) {
    return "windows";
  }

  if (normalized.includes("win")) {
    return "windows";
  }

  if (
    normalized.includes("unix") ||
    normalized.includes("linux") ||
    normalized.includes("darwin") ||
    normalized.includes("mac")
  ) {
    return "unix";
  }

  return "all";
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
