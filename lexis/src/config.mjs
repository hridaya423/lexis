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
    const userConfig = JSON.parse(raw);
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
