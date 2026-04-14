import { spawn } from "node:child_process";
import { loadConfig, saveConfig } from "./config.mjs";
import { installHooks, normalizeHookMode } from "./hooks.mjs";

const MODEL_PROFILES = {
  light: ["qwen2.5-coder:1.5b"],
  balanced: ["qwen2.5-coder:14b"],
  heavy: ["qwen3:14b", "qwen2.5-coder:14b"],
};

export async function runSetup({
  models,
  modelProfile,
  defaultModel,
  enableWebSearch,
  webProvider,
  mcpCommand,
  mcpArgs,
  mcpTool,
  mcpEnv,
  hookMode,
}) {
  await ensureOllamaAvailable();

  const config = await loadConfig();

  const modelList = resolveModelList({
    models,
    modelProfile,
    currentDefaultModel: config.model,
  });

  for (const model of modelList) {
    await pullModel(model);
  }

  const chosenDefaultModel =
    typeof defaultModel === "string" && defaultModel.trim().length > 0
      ? defaultModel.trim()
      : modelList[0] || config.model;
  config.model = chosenDefaultModel;

  if (enableWebSearch) {
    config.webSearch.enabled = true;
  }

  if (webProvider && ["mcp"].includes(webProvider)) {
    config.webSearch.provider = webProvider;
  }

  if (config.webSearch.provider === "mcp" && !config.webSearch.mcp.command) {
    config.webSearch.mcp.command = "lexis";
  }

  if (config.webSearch.provider === "mcp" && (!Array.isArray(config.webSearch.mcp.args) || config.webSearch.mcp.args.length === 0)) {
    config.webSearch.mcp.args = ["mcp", "serve-web"];
  }

  if (typeof mcpCommand === "string" && mcpCommand.trim()) {
    config.webSearch.provider = "mcp";
    config.webSearch.mcp.command = mcpCommand.trim();
    config.webSearch.mcp.args = Array.isArray(mcpArgs) ? mcpArgs : [];
  }

  if (typeof mcpTool === "string" && mcpTool.trim()) {
    config.webSearch.mcp.toolName = mcpTool.trim();
  }

  if (mcpEnv && typeof mcpEnv === "object" && !Array.isArray(mcpEnv)) {
    config.webSearch.mcp.env = {
      ...config.webSearch.mcp.env,
      ...mcpEnv,
    };
  }

  const selectedHookMode =
    normalizeHookMode(hookMode) || normalizeHookMode(config.execution?.hookMode) || "auto";
  config.execution = {
    ...(config.execution || {}),
    hookMode: selectedHookMode,
  };

  const configPath = await saveConfig(config);
  const hookResult = await installHooks({ mode: selectedHookMode });

  return {
    configPath,
    models: modelList,
    hookResult,
    modelProfile: modelProfile || "custom",
    defaultModel: config.model,
    hookMode: selectedHookMode,
    webSearch: {
      provider: config.webSearch.provider,
      command: config.webSearch.mcp.command,
      toolName: config.webSearch.mcp.toolName,
    },
  };
}

function resolveModelList({ models, modelProfile, currentDefaultModel }) {
  if (Array.isArray(models) && models.length > 0) {
    return unique(models);
  }

  if (typeof modelProfile === "string" && MODEL_PROFILES[modelProfile]) {
    return [...MODEL_PROFILES[modelProfile]];
  }

  return unique([currentDefaultModel, "qwen3:14b"]);
}

function unique(items) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    if (typeof item !== "string") {
      continue;
    }
    const value = item.trim();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    output.push(value);
  }

  return output;
}

async function ensureOllamaAvailable() {
  const result = await run("ollama", ["--version"], { stdio: "pipe" });
  if (result.exitCode === 0) {
    return;
  }

  const installResult = await installOllama();
  if (installResult.exitCode !== 0) {
    throw new Error("Failed to auto-install Ollama. Install manually from https://ollama.com/download");
  }

  const verify = await run("ollama", ["--version"], { stdio: "pipe" });
  if (verify.exitCode !== 0) {
    throw new Error("Ollama installation finished but command is still unavailable in PATH.");
  }
}

async function installOllama() {
  if (process.platform === "win32") {
    return run(
      "powershell",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        "irm https://ollama.com/install.ps1 | iex",
      ],
      { stdio: "inherit" }
    );
  }

  return run("sh", ["-c", "curl -fsSL https://ollama.com/install.sh | sh"], {
    stdio: "inherit",
  });
}

async function pullModel(model) {
  const result = await run("ollama", ["pull", model], { stdio: "inherit" });
  if (result.exitCode !== 0) {
    throw new Error(`Failed to pull model: ${model}`);
  }
}

async function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, options);
    child.on("exit", (exitCode, signal) => {
      resolve({ exitCode: exitCode ?? 1, signal });
    });
  });
}
