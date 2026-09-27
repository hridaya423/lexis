import { loadConfig, saveConfig, resetConfig } from "../config.mjs";
import { installHooks } from "../shell/install.mjs";

const SETTABLE = {
  "provider.active": { type: "enum", values: ["auto", "apple-fm", "llama-server", "ollama", "openai-compat"] },
  "provider.openaiCompat.baseUrl": { type: "string" },
  "provider.openaiCompat.model": { type: "string" },
  "provider.openaiCompat.apiKeyEnv": { type: "string" },
  "webSearch.enabled": { type: "bool" },
  "webSearch.mode": { type: "enum", values: ["off", "auto", "always"] },
  "webSearch.provider": { type: "enum", values: ["builtin", "mcp"] },
  "webSearch.autoRetryBelowConfidence": { type: "number", min: 0, max: 1 },
  "webSearch.maxResults": { type: "number", min: 1, max: 10 },
  "webSearch.timeoutMs": { type: "number", min: 1000, max: 120000 },
  "webSearch.mcp.command": { type: "string" },
  "webSearch.mcp.toolName": { type: "string" },
  "execution.askConfirmationAt": { type: "enum", values: ["low", "moderate", "high", "critical"] },
  "execution.hookMode": { type: "enum", values: ["auto", "lx"] },
  "execution.autoExecuteLowRisk": { type: "bool" },
  "runtime.backend": { type: "enum", values: ["auto", "cpu", "vulkan", "cuda", "metal"] },
  "runtime.idleTimeoutSec": { type: "number", min: 0, max: 86400 },
  "runtime.port": { type: "number", min: 0, max: 65535 },
  "history.maxEvents": { type: "number", min: 10, max: 100000 },
};

export async function configCommand(args) {
  const mode = args[0] || "show";

  if (mode === "show") {
    const config = await loadConfig();
    const clean = { ...config };
    delete clean.__migrationNotes;
    process.stdout.write(JSON.stringify(clean, null, 2) + "\n");
    return;
  }

  if (mode === "reset") {
    const file = await resetConfig();
    process.stdout.write(`Reset ${file}\n`);
    return;
  }

  if (mode === "set") {
    const key = args[1];
    const value = args.slice(2).join(" ");
    const spec = SETTABLE[key];
    if (!spec) {
      throw new Error(`Unknown key '${key}'. Keys:\n  ${Object.keys(SETTABLE).join("\n  ")}`);
    }
    const config = await loadConfig();
    setPath(config, key, coerce(value, spec, key));
    const file = await saveConfig(config);
    process.stdout.write(`Updated ${file}\n`);
    if (key === "execution.hookMode") {
      const result = await installHooks({ mode: coerce(value, spec, key) });
      for (const item of result.results) {
        process.stdout.write(`  ${item.changed ? "updated" : "unchanged"} ${item.filePath}\n`);
      }
    }
    return;
  }

    const legacy = {
    "set-model": async (v) => {
      const { modelCommand } = await import("./model.mjs");
      return modelCommand(["use", v]);
    },
    "set-hook-mode": async (v) => configCommand(["set", "execution.hookMode", v]),
    "enable-web": async () => configCommand(["set", "webSearch.enabled", "true"]),
    "disable-web": async () => configCommand(["set", "webSearch.enabled", "false"]),
    "set-web-provider": async (v) => configCommand(["set", "webSearch.provider", v]),
    "set-web-mode": async (v) => configCommand(["set", "webSearch.mode", v]),
    "set-web-max-results": async (v) => configCommand(["set", "webSearch.maxResults", v]),
    "set-web-timeout": async (v) => configCommand(["set", "webSearch.timeoutMs", v]),
    "set-web-auto-threshold": async (v) => configCommand(["set", "webSearch.autoRetryBelowConfidence", v]),
    "set-mcp-command": async (v) => configCommand(["set", "webSearch.mcp.command", v]),
    "set-mcp-tool": async (v) => configCommand(["set", "webSearch.mcp.toolName", v]),
  };
  if (legacy[mode]) {
    await legacy[mode](args[1]);
    return;
  }

  throw new Error(`Usage: lx config <show|reset|set <key> <value>>\nKeys:\n  ${Object.keys(SETTABLE).join("\n  ")}`);
}

function coerce(value, spec, key) {
  if (spec.type === "bool") {
    if (/^(true|1|yes|on)$/i.test(value)) return true;
    if (/^(false|0|no|off)$/i.test(value)) return false;
    throw new Error(`${key} expects true/false`);
  }
  if (spec.type === "number") {
    const n = Number(value);
    if (!Number.isFinite(n) || n < spec.min || n > spec.max) {
      throw new Error(`${key} expects a number in [${spec.min}, ${spec.max}]`);
    }
    return n;
  }
  if (spec.type === "enum") {
    if (!spec.values.includes(value)) {
      throw new Error(`${key} must be one of: ${spec.values.join(", ")}`);
    }
    return value;
  }
  return String(value);
}

function setPath(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}
