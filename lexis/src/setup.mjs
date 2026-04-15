import { spawn } from "node:child_process";
import { loadConfig, saveConfig } from "./config.mjs";
import { installHooks, normalizeHookMode } from "./hooks.mjs";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

const MODEL_PROFILES = {
  mlx: {
    light: ["mlx-community/Qwen2.5-Coder-3B-Instruct-4bit"],
    balanced: ["mlx-community/Qwen2.5-Coder-7B-Instruct-4bit"],
    heavy: ["mlx-community/Qwen2.5-Coder-14B-Instruct-4bit"],
  },
  vllm: {
    light: ["Qwen/Qwen2.5-Coder-3B-Instruct-AWQ"],
    balanced: ["Qwen/Qwen2.5-Coder-7B-Instruct-AWQ"],
    heavy: ["Qwen/Qwen2.5-Coder-14B-Instruct-AWQ"],
  },
  llamacpp: {
    light: ["bartowski/Qwen2.5-Coder-3B-Instruct-GGUF"],
    balanced: ["bartowski/Qwen2.5-Coder-7B-Instruct-GGUF"],
    heavy: ["bartowski/Qwen2.5-Coder-14B-Instruct-GGUF"],
  },
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
  const config = await loadConfig();
  const provider = await detectRuntimeProvider();

  const modelList = resolveModelList({
    provider,
    models,
    modelProfile,
    currentDefaultModel: config.model,
  });

  const chosenDefaultModel =
    typeof defaultModel === "string" && defaultModel.trim().length > 0
      ? defaultModel.trim()
      : modelList[0] || config.model;

  const runtime = await ensureRuntimeAvailable({
    provider,
    model: chosenDefaultModel,
    baseUrl: config.llm?.baseUrl || DEFAULT_BASE_URL,
  });

  const warmup = await warmupModel({
    provider,
    baseUrl: runtime.baseUrl,
    model: chosenDefaultModel,
  });

  config.model = chosenDefaultModel;
  config.llm = {
    ...(config.llm || {}),
    provider,
    baseUrl: runtime.baseUrl,
    model: chosenDefaultModel,
    start: runtime.start,
    apiKey: typeof config.llm?.apiKey === "string" ? config.llm.apiKey : "",
  };

  if (enableWebSearch) {
    config.webSearch.enabled = true;
  }

  if (webProvider && ["mcp"].includes(webProvider)) {
    config.webSearch.provider = webProvider;
  }

  if (config.webSearch.provider === "mcp" && !config.webSearch.mcp.command) {
    config.webSearch.mcp.command = "lexis";
  }

  if (
    config.webSearch.provider === "mcp" &&
    (!Array.isArray(config.webSearch.mcp.args) || config.webSearch.mcp.args.length === 0)
  ) {
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
    runtime: {
      provider,
      baseUrl: runtime.baseUrl,
      python: runtime.python,
      warmed: warmup.ok,
      warmupMessage: warmup.message,
    },
    webSearch: {
      provider: config.webSearch.provider,
      command: config.webSearch.mcp.command,
      toolName: config.webSearch.mcp.toolName,
    },
  };
}

function resolveModelList({ provider, models, modelProfile, currentDefaultModel }) {
  if (Array.isArray(models) && models.length > 0) {
    return unique(models);
  }

  const profileTable = MODEL_PROFILES[provider] || MODEL_PROFILES.llamacpp;
  if (typeof modelProfile === "string" && profileTable[modelProfile]) {
    return [...profileTable[modelProfile]];
  }

  return unique([...profileTable.balanced, currentDefaultModel]);
}

async function detectRuntimeProvider() {
  if (process.platform === "darwin") {
    return "mlx";
  }

  if (process.platform === "win32") {
    return "llamacpp";
  }

  if (process.platform === "linux" && (await hasNvidiaGpu())) {
    return "vllm";
  }

  return "llamacpp";
}

async function hasNvidiaGpu() {
  const result = await run("nvidia-smi", ["-L"], { stdio: "pipe" });
  return result.exitCode === 0;
}

async function ensureRuntimeAvailable({ provider, model, baseUrl }) {
  const python = await ensurePythonAvailable();
  await ensurePipAvailable(python);
  await installProviderDependencies(provider, python);

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const start = buildStartCommand({ provider, python, model, baseUrl: normalizedBaseUrl });
  await ensureServerReady({ baseUrl: normalizedBaseUrl, start });

  return {
    baseUrl: normalizedBaseUrl,
    start,
    python: formatPythonForDisplay(python),
  };
}

async function ensurePythonAvailable() {
  const candidates =
    process.platform === "win32"
      ? [
          { command: "python", prefix: [] },
          { command: "py", prefix: ["-3"] },
        ]
      : [
          { command: "python3", prefix: [] },
          { command: "python", prefix: [] },
        ];

  const found = await findWorkingPython(candidates);
  if (found) {
    return found;
  }

  await installPython();

  const afterInstall = await findWorkingPython(candidates);
  if (afterInstall) {
    return afterInstall;
  }

  throw new Error("Python 3 is required but could not be installed automatically.");
}

async function findWorkingPython(candidates) {
  for (const candidate of candidates) {
    const probe = await run(candidate.command, [...candidate.prefix, "-c", "print('ok')"], {
      stdio: "pipe",
    });
    if (probe.exitCode === 0) {
      return candidate;
    }
  }

  return null;
}

async function installPython() {
  if (process.platform === "darwin") {
    await ensureHomebrewAvailable();
    await runOrThrow("brew", ["install", "python"], "Failed to install Python with Homebrew");
    return;
  }

  if (process.platform === "win32") {
    await runOrThrow(
      "powershell",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        "winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements",
      ],
      "Failed to install Python via winget"
    );
    return;
  }

  if (process.platform === "linux") {
    if (await canRun("apt-get")) {
      await runOrThrow("sh", ["-c", "sudo apt-get update && sudo apt-get install -y python3 python3-pip"], "Failed to install Python via apt-get");
      return;
    }
    if (await canRun("dnf")) {
      await runOrThrow("sh", ["-c", "sudo dnf install -y python3 python3-pip"], "Failed to install Python via dnf");
      return;
    }
    if (await canRun("yum")) {
      await runOrThrow("sh", ["-c", "sudo yum install -y python3 python3-pip"], "Failed to install Python via yum");
      return;
    }
    if (await canRun("pacman")) {
      await runOrThrow("sh", ["-c", "sudo pacman -Sy --noconfirm python python-pip"], "Failed to install Python via pacman");
      return;
    }
  }
}

async function ensurePipAvailable(python) {
  const pip = await run(python.command, [...python.prefix, "-m", "pip", "--version"], {
    stdio: "pipe",
  });
  if (pip.exitCode === 0) {
    return;
  }

  await runOrThrow(
    python.command,
    [...python.prefix, "-m", "ensurepip", "--upgrade"],
    "Failed to initialize pip"
  );
}

async function installProviderDependencies(provider, python) {
  const pkg =
    provider === "mlx" ? "mlx-lm" : provider === "vllm" ? "vllm" : "llama-cpp-python[server]";

  await runOrThrow(
    python.command,
    [...python.prefix, "-m", "pip", "install", "--upgrade", "--user", pkg],
    `Failed to install ${provider} runtime dependencies`
  );
}

function buildStartCommand({ provider, python, model, baseUrl }) {
  const { hostname, port } = parseHostPort(baseUrl);

  if (provider === "mlx") {
    return {
      command: python.command,
      args: [...python.prefix, "-m", "mlx_lm.server", "--model", model, "--host", hostname, "--port", String(port)],
    };
  }

  if (provider === "vllm") {
    return {
      command: python.command,
      args: [
        ...python.prefix,
        "-m",
        "vllm.entrypoints.openai.api_server",
        "--model",
        model,
        "--host",
        hostname,
        "--port",
        String(port),
        "--served-model-name",
        model,
      ],
    };
  }

  const modelFile = resolveLlamaCppModelFile(model);
  return {
    command: python.command,
    args: [
      ...python.prefix,
      "-m",
      "llama_cpp.server",
      "--hf_model_repo_id",
      model,
      ...(modelFile ? ["--hf_model_file", modelFile] : []),
      "--host",
      hostname,
      "--port",
      String(port),
      "--n_ctx",
      "4096",
    ],
  };
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

async function ensureServerReady({ baseUrl, start }) {
  if (await isServerReady(baseUrl)) {
    return;
  }

  startServer(start);

  process.stdout.write(`[lexis-setup] Starting ${start.command} ${start.args.join(" ")}\n`);
  process.stdout.write("[lexis-setup] Waiting for local LLM server (first run may take several minutes for model download)...\n");

  for (let attempt = 0; attempt < 600; attempt += 1) {
    await sleep(1000);
    if (await isServerReady(baseUrl)) {
      return;
    }

    if ((attempt + 1) % 30 === 0) {
      process.stdout.write(`[lexis-setup] Still waiting... ${attempt + 1}s\n`);
    }
  }

  throw new Error(`LLM server did not become ready at ${baseUrl}.`);
}

async function warmupModel({ provider, baseUrl, model }) {
  const timeoutSeconds = estimateWarmupTimeoutSeconds({ provider, model });
  const endpoint = `${normalizeBaseUrl(baseUrl)}/v1/chat/completions`;

  process.stdout.write(
    `[lexis-setup] Warming ${provider} model ${model} (this can take a while on first download)...\n`
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      signal: AbortSignal.timeout(timeoutSeconds * 1000),
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0,
        max_tokens: 24,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Return JSON only.",
          },
          {
            role: "user",
            content: "Return {'ok':true} as valid JSON.",
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        message: `Warmup request failed (${response.status}): ${body.slice(0, 160)}`,
      };
    }

    return {
      ok: true,
      message: "Model warmup completed.",
    };
  } catch (error) {
    return {
      ok: false,
      message: `Warmup did not complete: ${error.message}`,
    };
  }
}

function estimateWarmupTimeoutSeconds({ provider, model }) {
  const modelSizeInBillions = parseModelSizeInBillions(model);
  const runtime = String(provider || "").toLowerCase();

  const bucket =
    Number.isFinite(modelSizeInBillions) && modelSizeInBillions <= 3
      ? "small"
      : Number.isFinite(modelSizeInBillions) && modelSizeInBillions <= 7
        ? "medium"
        : Number.isFinite(modelSizeInBillions) && modelSizeInBillions <= 14
          ? "large"
          : "xlarge";

  if (runtime === "mlx") {
    return bucket === "small"
      ? 45
      : bucket === "medium"
        ? 90
        : bucket === "large"
          ? 180
          : 240;
  }

  if (runtime === "vllm") {
    return bucket === "small"
      ? 60
      : bucket === "medium"
        ? 120
        : bucket === "large"
          ? 300
          : 420;
  }

  if (runtime === "llamacpp") {
    return bucket === "small"
      ? 75
      : bucket === "medium"
        ? 150
        : bucket === "large"
          ? 360
          : 480;
  }

  return bucket === "small"
    ? 60
    : bucket === "medium"
      ? 120
      : bucket === "large"
        ? 300
        : 420;
}

function parseModelSizeInBillions(model) {
  const text = String(model || "").toLowerCase();
  const sizeMatch = text.match(/(\d+(?:\.\d+)?)b/);
  return sizeMatch ? Number.parseFloat(sizeMatch[1]) : Number.NaN;
}

async function ensureHomebrewAvailable() {
  if (await canRun("brew")) {
    return;
  }

  if (!(await canRun("curl"))) {
    throw new Error("Homebrew is required on macOS but curl is not available.");
  }

  process.stdout.write("[lexis-setup] Homebrew not found. Installing Homebrew...\n");

  await runOrThrow(
    "sh",
    [
      "-c",
      "NONINTERACTIVE=1 /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"",
    ],
    "Failed to install Homebrew"
  );

  prependHomebrewToPath();

  if (!(await canRun("brew"))) {
    throw new Error("Homebrew installed but brew is still unavailable. Open a new shell and retry setup.");
  }
}

function prependHomebrewToPath() {
  const currentPath = String(process.env.PATH || "");
  const entries = currentPath
    .split(":")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const candidate of ["/opt/homebrew/bin", "/usr/local/bin"]) {
    if (!entries.includes(candidate)) {
      entries.unshift(candidate);
    }
  }

  process.env.PATH = entries.join(":");
}

async function isServerReady(baseUrl) {
  try {
    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/v1/models`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function startServer(start) {
  try {
    const child = spawn(start.command, start.args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
      env: process.env,
    });
    child.unref();
  } catch {
    // If process start fails, readiness check will fail with a clear error.
  }
}

function parseHostPort(baseUrl) {
  const parsed = new URL(normalizeBaseUrl(baseUrl));
  return {
    hostname: parsed.hostname || "127.0.0.1",
    port: parsed.port ? Number(parsed.port) : 8000,
  };
}

function normalizeBaseUrl(baseUrl) {
  const value = typeof baseUrl === "string" && baseUrl.trim() ? baseUrl.trim() : DEFAULT_BASE_URL;
  return value.replace(/\/+$/, "");
}

function formatPythonForDisplay(python) {
  return [python.command, ...python.prefix].join(" ").trim();
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

async function canRun(command) {
  const result = await run(command, ["--version"], { stdio: "pipe" });
  return result.exitCode === 0;
}

async function runOrThrow(command, args, message) {
  const result = await run(command, args, { stdio: "inherit" });
  if (result.exitCode !== 0) {
    throw new Error(message);
  }
}

async function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, options);
    child.on("error", () => {
      resolve({ exitCode: 1, signal: null });
    });
    child.on("exit", (exitCode, signal) => {
      resolve({ exitCode: exitCode ?? 1, signal });
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
