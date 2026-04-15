import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { DEFAULT_CONFIG } from "./constants.mjs";

export function getConfigPath() {
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, "lexis", "config.json");
  }
  return path.join(os.homedir(), ".config", "lexis", "config.json");
}

export async function ensureConfigDir() {
  const configPath = getConfigPath();
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  return configPath;
}

export async function loadConfig() {
  const configPath = getConfigPath();

  try {
    const raw = await fs.readFile(configPath, "utf8");
    const userConfig = migrateConfig(JSON.parse(raw));
    return deepMerge(DEFAULT_CONFIG, userConfig);
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

export async function saveConfig(config) {
  const configPath = await ensureConfigDir();
  await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");
  return configPath;
}

export function deepMerge(base, override) {
  if (!isObject(base) || !isObject(override)) {
    return override ?? base;
  }

  const result = { ...base };

  for (const key of Object.keys(override)) {
    const baseValue = result[key];
    const overrideValue = override[key];

    if (isObject(baseValue) && isObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
      continue;
    }

    result[key] = overrideValue;
  }

  return result;
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function migrateConfig(config) {
  if (!isObject(config)) {
    return config;
  }

  const migrated = { ...config };

  if (!isObject(migrated.llm)) {
    migrated.llm = {};
  }

  if (typeof migrated.ollamaBaseUrl === "string" && migrated.ollamaBaseUrl.trim()) {
    migrated.llm.baseUrl = migrated.llm.baseUrl || "http://127.0.0.1:8000";
    if (!migrated.llm.provider) {
      migrated.llm.provider = process.platform === "darwin" ? "mlx" : process.platform === "win32" ? "llamacpp" : "llamacpp";
    }
  }

  delete migrated.ollamaBaseUrl;

  if (isObject(migrated.execution)) {
    delete migrated.execution.criticalReview;
  }

  if (isObject(migrated.llm)) {
    if (!isObject(migrated.llm.start)) {
      migrated.llm.start = { command: "", args: [] };
    }
    if (typeof migrated.llm.apiKey !== "string") {
      migrated.llm.apiKey = "";
    }
    if (typeof migrated.llm.model !== "string" || !migrated.llm.model.trim()) {
      if (typeof migrated.model === "string" && migrated.model.trim()) {
        migrated.llm.model = migrated.model.trim();
      }
    }

    migrated.llm.model = mapLegacyModelId(migrated.llm.model, migrated.llm.provider);
    migrated.llm.start = rewriteStartArgsForModel(
      migrated.llm.start,
      normalizeProvider(migrated.llm.provider),
      migrated.llm.model
    );
  }

  migrated.model = mapLegacyModelId(migrated.model, migrated.llm.provider);

  return migrated;
}

function mapLegacyModelId(value, provider) {
  const model = String(value || "").trim();
  if (!model) {
    return model;
  }

  if (/^mlx-community\//i.test(model) || /^bartowski\//i.test(model)) {
    return model;
  }

  const resolvedProvider = normalizeProvider(provider);
  const normalized = model.toLowerCase();
  const sizeMatch = normalized.match(/(\d+(?:\.\d+)?)b/);
  const sizeInBillions = sizeMatch ? Number.parseFloat(sizeMatch[1]) : Number.NaN;
  const hasQwenCoder = normalized.includes("qwen2.5-coder") || normalized.includes("qwen3");

  const isSmall = hasQwenCoder && Number.isFinite(sizeInBillions) && sizeInBillions <= 3;
  const isMedium = hasQwenCoder && Number.isFinite(sizeInBillions) && sizeInBillions > 3 && sizeInBillions < 14;
  const isLarge = hasQwenCoder && Number.isFinite(sizeInBillions) && sizeInBillions >= 14;

  if (!isSmall && !isMedium && !isLarge) {
    return model;
  }

  if (resolvedProvider === "llamacpp") {
    if (isSmall) {
      return "bartowski/Qwen2.5-Coder-3B-Instruct-GGUF";
    }
    if (isMedium) {
      return "bartowski/Qwen2.5-Coder-7B-Instruct-GGUF";
    }
    return "bartowski/Qwen2.5-Coder-14B-Instruct-GGUF";
  }

  if (resolvedProvider === "mlx") {
    if (isSmall) {
      return "mlx-community/Qwen2.5-Coder-3B-Instruct-4bit";
    }
    if (isMedium) {
      return "mlx-community/Qwen2.5-Coder-7B-Instruct-4bit";
    }
    return "mlx-community/Qwen2.5-Coder-14B-Instruct-4bit";
  }

  if (resolvedProvider === "vllm") {
    if (isSmall) {
      return "Qwen/Qwen2.5-Coder-3B-Instruct-AWQ";
    }
    if (isMedium) {
      return "Qwen/Qwen2.5-Coder-7B-Instruct-AWQ";
    }
    return "Qwen/Qwen2.5-Coder-14B-Instruct-AWQ";
  }

  if (isSmall) {
    return "Qwen/Qwen2.5-Coder-3B-Instruct";
  }
  if (isMedium) {
    return "Qwen/Qwen2.5-Coder-7B-Instruct";
  }
  return "Qwen/Qwen2.5-Coder-14B-Instruct";
}

function normalizeProvider(provider) {
  const value = String(provider || "")
    .trim()
    .toLowerCase();

  if (value === "mlx" || value === "vllm" || value === "llamacpp") {
    return value;
  }

  if (process.platform === "darwin") {
    return "mlx";
  }
  if (process.platform === "win32") {
    return "llamacpp";
  }
  return "llamacpp";
}

function rewriteStartArgsForModel(start, provider, model) {
  const output = {
    command:
      typeof start?.command === "string" && start.command.trim() ? start.command.trim() : "",
    args: Array.isArray(start?.args) ? [...start.args.map((item) => String(item))] : [],
  };

  if (!model) {
    return output;
  }

  const replaceOrAppend = (flag, value) => {
    const index = output.args.indexOf(flag);
    if (index >= 0 && index + 1 < output.args.length) {
      output.args[index + 1] = value;
      return;
    }
    output.args.push(flag, value);
  };

  if (provider === "llamacpp") {
    replaceOrAppend("--hf_model_repo_id", model);
    const modelFile = resolveLlamaCppModelFile(model);
    if (modelFile) {
      replaceOrAppend("--hf_model_file", modelFile);
    }
    return output;
  }

  replaceOrAppend("--model", model);
  if (provider === "vllm") {
    replaceOrAppend("--served-model-name", model);
  }

  return output;
}

function resolveLlamaCppModelFile(repoId) {
  const model = String(repoId || "");
  if (model.includes("Qwen2.5-Coder-3B-Instruct-GGUF")) {
    return "Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf";
  }
  if (model.includes("Qwen2.5-Coder-7B-Instruct-GGUF")) {
    return "Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf";
  }
  if (model.includes("Qwen2.5-Coder-14B-Instruct-GGUF")) {
    return "Qwen2.5-Coder-14B-Instruct-Q4_K_M.gguf";
  }
  return "";
}
