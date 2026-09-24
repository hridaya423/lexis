import fs from "node:fs/promises";
import path from "node:path";
import { configPath } from "./paths.mjs";

export const CONFIG_VERSION = 2;

export const DEFAULT_CONFIG = {
  version: CONFIG_VERSION,
  model: "",
  provider: {
    active: "auto",
    openaiCompat: { baseUrl: "", apiKeyEnv: "", model: "" },
  },
  webSearch: {
    enabled: true,
    mode: "auto",
    autoRetryBelowConfidence: 0.82,
    maxResults: 5,
    timeoutMs: 15000,
    provider: "builtin",
    mcp: { command: "", args: [], toolName: "", env: {} },
  },
  execution: {
    autoExecuteLowRisk: true,
    askConfirmationAt: "moderate",
    hookMode: "auto",
  },
  runtime: {
    backend: "auto",
    idleTimeoutSec: 1800,
    port: 0,
  },
  history: {
    maxEvents: 500,
  },
};

const PROVIDER_MAP_V1 = {
  mlx: "llama-server",
  vllm: "llama-server",
  llamacpp: "llama-server",
  ollama: "ollama",
};

export async function ensureConfigDir() {
  const dir = path.dirname(configPath());
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function loadConfig() {
  const file = configPath();
  let raw;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      return structuredClone(DEFAULT_CONFIG);
    }
    throw error;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      `Config file is corrupt: ${file}\nFix it manually or run 'lx config reset' to restore defaults.`
    );
  }

  const { config, notes } = migrateConfig(parsed);
  const merged = deepMerge(DEFAULT_CONFIG, config);
  merged.version = CONFIG_VERSION;
  if (notes.length > 0) {
    merged.__migrationNotes = notes;
  }
  return merged;
}

export async function saveConfig(config) {
  await ensureConfigDir();
  const file = configPath();
  const clean = { ...config };
  delete clean.__migrationNotes;
  const tmp = `${file}.tmp-${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(clean, null, 2) + "\n", { mode: 0o600 });
  await fs.rename(tmp, file);
  return file;
}

export async function resetConfig() {
  const file = await saveConfig(structuredClone(DEFAULT_CONFIG));
  return file;
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

function migrateConfig(input) {
  const notes = [];
  if (!isObject(input)) {
    return { config: {}, notes };
  }
  if (Number(input.version) >= CONFIG_VERSION) {
    return { config: input, notes };
  }

  const out = { ...input };
  delete out.version;
  delete out.ollamaBaseUrl;

    const llm = isObject(input.llm) ? input.llm : {};
  const rawProvider = String(llm.provider || "").trim().toLowerCase();
  if (rawProvider) {
    if (rawProvider === "ollama") {
      out.provider = { ...(isObject(out.provider) ? out.provider : {}), active: "ollama" };
      notes.push("Provider 'ollama' preserved.");
    } else if (PROVIDER_MAP_V1[rawProvider]) {
      out.provider = { ...(isObject(out.provider) ? out.provider : {}), active: "llama-server" };
      notes.push(`Provider '${rawProvider}' migrated to 'llama-server' (prebuilt llama.cpp, no Python).`);
    } else if (rawProvider === "apple-fm" || rawProvider === "openai-compat" || rawProvider === "auto") {
      out.provider = { ...(isObject(out.provider) ? out.provider : {}), active: rawProvider };
    }
  }
  if (typeof llm.model === "string" && llm.model.trim() && !out.model) {
    out.model = llm.model.trim();
  } else if (typeof input.model === "string" && input.model.trim()) {
    out.model = input.model.trim();
  }
  if (typeof llm.apiKey === "string" && llm.apiKey.trim()) {
    notes.push("Plaintext API key dropped from config. Set LEXIS_API_KEY in your environment and run: lx model use openai-compat --api-key-env LEXIS_API_KEY");
  }
  if (typeof llm.baseUrl === "string" && llm.baseUrl.trim() && rawProvider && !PROVIDER_MAP_V1[rawProvider] && rawProvider !== "ollama") {
    out.provider = isObject(out.provider) ? out.provider : {};
    out.provider.openaiCompat = { baseUrl: llm.baseUrl.trim(), apiKeyEnv: "", model: out.model || "" };
  }
  delete out.llm;

  if (isObject(out.execution)) {
    delete out.execution.riskMode;
    delete out.execution.criticalReview;
  }
  if (isObject(out.webSearch) && out.webSearch.provider === "mcp") {
    notes.push("Web search provider 'mcp' preserved (external MCP server). Default is now 'builtin' (in-process).");
  }

  notes.push("Config migrated to v2.");
  return { config: out, notes };
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
