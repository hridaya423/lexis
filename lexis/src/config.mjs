import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { DEFAULT_CONFIG } from "./constants.mjs";
import {
  defaultModelForProvider,
  mapModelIdForProvider,
  normalizeProvider,
  rewriteStartArgsForModel,
} from "./providers.mjs";

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
    migrated.llm.baseUrl = migrated.llm.baseUrl || migrated.ollamaBaseUrl.trim();
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
      } else {
        migrated.llm.model = defaultModelForProvider(migrated.llm.provider);
      }
    }

    migrated.llm.model = mapModelIdForProvider(migrated.llm.model, migrated.llm.provider);
    migrated.llm.start = rewriteStartArgsForModel(
      migrated.llm.start,
      normalizeProvider(migrated.llm.provider),
      migrated.llm.model,
      migrated.llm.baseUrl
    );
  }

  migrated.model = mapModelIdForProvider(migrated.model || migrated.llm.model, migrated.llm.provider);

  return migrated;
}
