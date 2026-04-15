import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
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
  const systemPython = await ensurePythonAvailable();
  const python = await ensureRuntimePython(systemPython);
  await ensurePipAvailable(python);
  await ensurePackagingToolsAvailable(python);
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

async function ensureRuntimePython(systemPython) {
  const venvDir = runtimeVenvDir();
  await mkdir(venvDir, { recursive: true });

  const existing = await findWorkingPython(runtimeVenvPythonCandidates(venvDir));
  if (existing) {
    return existing;
  }

  const created = await run(systemPython.command, [...systemPython.prefix, "-m", "venv", venvDir], {
    stdio: "inherit",
  });

  if (created.exitCode !== 0 && process.platform === "linux") {
    const installedVenvPackage = await installPythonVenvWithSystemPackageManager();
    if (installedVenvPackage) {
      const retryCreate = await run(
        systemPython.command,
        [...systemPython.prefix, "-m", "venv", venvDir],
        { stdio: "inherit" }
      );
      if (retryCreate.exitCode !== 0) {
        throw new Error("Failed to create Lexis Python virtual environment.");
      }
    } else {
      throw new Error("Failed to create Lexis Python virtual environment.");
    }
  } else if (created.exitCode !== 0) {
    throw new Error("Failed to create Lexis Python virtual environment.");
  }

  const runtimePython = await findWorkingPython(runtimeVenvPythonCandidates(venvDir));
  if (runtimePython) {
    return runtimePython;
  }

  throw new Error("Virtual environment created but Python executable was not found.");
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
    if (await canRun("winget")) {
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

    if (await canRun("choco")) {
      await runOrThrow("choco", ["install", "python", "-y"], "Failed to install Python via choco");
      return;
    }

    if (await canRun("scoop")) {
      await runOrThrow("scoop", ["install", "python"], "Failed to install Python via scoop");
      return;
    }

    throw new Error("Python is required but no supported Windows package manager was found.");
  }

  if (process.platform === "linux") {
    const privilegePrefix = await getPrivilegePrefix();
    if (privilegePrefix === null) {
      throw new Error("Python install requires root privileges. Run setup with sudo or install Python manually.");
    }

    if (await canRun("apt-get")) {
      await runOrThrow(
        "sh",
        ["-c", `${privilegePrefix}apt-get update && ${privilegePrefix}apt-get install -y python3 python3-pip python3-venv`],
        "Failed to install Python via apt-get"
      );
      return;
    }
    if (await canRun("dnf")) {
      await runOrThrow(
        "sh",
        ["-c", `${privilegePrefix}dnf install -y python3 python3-pip`],
        "Failed to install Python via dnf"
      );
      return;
    }
    if (await canRun("yum")) {
      await runOrThrow(
        "sh",
        ["-c", `${privilegePrefix}yum install -y python3 python3-pip`],
        "Failed to install Python via yum"
      );
      return;
    }
    if (await canRun("pacman")) {
      await runOrThrow(
        "sh",
        ["-c", `${privilegePrefix}pacman -Sy --noconfirm python python-pip`],
        "Failed to install Python via pacman"
      );
      return;
    }
    if (await canRun("zypper")) {
      await runOrThrow(
        "sh",
        ["-c", `${privilegePrefix}zypper --non-interactive install python3 python3-pip python3-virtualenv`],
        "Failed to install Python via zypper"
      );
      return;
    }
    if (await canRun("apk")) {
      await runOrThrow(
        "sh",
        ["-c", `${privilegePrefix}apk add --no-cache python3 py3-pip py3-virtualenv`],
        "Failed to install Python via apk"
      );
      return;
    }

    throw new Error("Python is required but no supported Linux package manager was found.");
  }

  throw new Error("Python 3 is required but this platform is not supported for auto-install.");
}

function runtimeVenvDir() {
  if (process.platform === "win32") {
    const localAppData =
      typeof process.env.LOCALAPPDATA === "string" && process.env.LOCALAPPDATA.trim()
        ? process.env.LOCALAPPDATA.trim()
        : path.join(os.homedir(), "AppData", "Local");
    return path.join(localAppData, "Lexis", "runtime-venv");
  }

  const xdgDataHome =
    typeof process.env.XDG_DATA_HOME === "string" && process.env.XDG_DATA_HOME.trim()
      ? process.env.XDG_DATA_HOME.trim()
      : path.join(os.homedir(), ".local", "share");

  return path.join(xdgDataHome, "lexis", "runtime-venv");
}

function runtimeVenvPythonCandidates(venvDir) {
  if (process.platform === "win32") {
    return [
      { command: path.join(venvDir, "Scripts", "python.exe"), prefix: [] },
      { command: path.join(venvDir, "Scripts", "python"), prefix: [] },
    ];
  }

  return [
    { command: path.join(venvDir, "bin", "python3"), prefix: [] },
    { command: path.join(venvDir, "bin", "python"), prefix: [] },
  ];
}

async function ensurePipAvailable(python) {
  const pip = await run(python.command, [...python.prefix, "-m", "pip", "--version"], {
    stdio: "pipe",
  });
  if (pip.exitCode === 0) {
    return;
  }

  const ensurePip = await run(
    python.command,
    [...python.prefix, "-m", "ensurepip", "--upgrade"],
    { stdio: "inherit" }
  );

  if (ensurePip.exitCode === 0) {
    return;
  }

  if (process.platform === "linux") {
    const installedViaSystem = await installPipWithSystemPackageManager();
    if (installedViaSystem) {
      const retry = await run(python.command, [...python.prefix, "-m", "pip", "--version"], {
        stdio: "pipe",
      });
      if (retry.exitCode === 0) {
        return;
      }
    }
  }

  throw new Error("Failed to initialize pip");
}

async function ensurePackagingToolsAvailable(python) {
  const result = await run(
    python.command,
    [...python.prefix, "-m", "pip", "install", "--upgrade", "pip", "setuptools", "wheel"],
    { stdio: "inherit" }
  );

  if (result.exitCode !== 0) {
    process.stdout.write("[lexis-setup] Packaging tool upgrade failed; continuing with existing pip toolchain.\n");
  }
}

async function installProviderDependencies(provider, python) {
  const pkg =
    provider === "mlx" ? "mlx-lm" : provider === "vllm" ? "vllm" : "llama-cpp-python[server]";

  const installArgs = [...python.prefix, "-m", "pip", "install", "--upgrade", pkg];
  const installUserArgs = [...python.prefix, "-m", "pip", "install", "--upgrade", "--user", pkg];
  const preferUserInstall = !isLikelyVirtualEnvironment(python);

  const firstAttempt = await run(
    python.command,
    preferUserInstall ? installUserArgs : installArgs,
    { stdio: "inherit" }
  );
  if (firstAttempt.exitCode === 0) {
    return;
  }

  const secondAttempt = await run(
    python.command,
    preferUserInstall ? installArgs : installUserArgs,
    { stdio: "inherit" }
  );
  if (secondAttempt.exitCode === 0) {
    return;
  }

  const installedBuildDeps = await installProviderBuildDependencies(provider);
  if (installedBuildDeps) {
    const retry = await run(
      python.command,
      preferUserInstall ? installUserArgs : installArgs,
      { stdio: "inherit" }
    );
    if (retry.exitCode === 0) {
      return;
    }
  }

  throw new Error(`Failed to install ${provider} runtime dependencies`);
}

async function installProviderBuildDependencies(provider) {
  if (process.platform === "darwin") {
    const xcode = await run("xcode-select", ["-p"], { stdio: "pipe" });
    if (xcode.exitCode === 0) {
      return false;
    }

    process.stdout.write("[lexis-setup] Xcode Command Line Tools are required; requesting install...\n");
    await run("xcode-select", ["--install"], { stdio: "inherit" });
    return false;
  }

  if (process.platform !== "linux") {
    return false;
  }

  const privilegePrefix = await getPrivilegePrefix();
  if (privilegePrefix === null) {
    return false;
  }

  if (await canRun("apt-get")) {
    const pkgs =
      provider === "vllm"
        ? "build-essential python3-dev"
        : "build-essential cmake ninja-build pkg-config python3-dev";
    const result = await run(
      "sh",
      ["-c", `${privilegePrefix}apt-get update && ${privilegePrefix}apt-get install -y ${pkgs}`],
      { stdio: "inherit" }
    );
    return result.exitCode === 0;
  }

  if (await canRun("dnf")) {
    const pkgs =
      provider === "vllm"
        ? "gcc gcc-c++ make python3-devel"
        : "gcc gcc-c++ make cmake ninja-build pkgconf-pkg-config python3-devel";
    const result = await run("sh", ["-c", `${privilegePrefix}dnf install -y ${pkgs}`], {
      stdio: "inherit",
    });
    return result.exitCode === 0;
  }

  if (await canRun("yum")) {
    const pkgs =
      provider === "vllm"
        ? "gcc gcc-c++ make python3-devel"
        : "gcc gcc-c++ make cmake ninja-build pkgconfig python3-devel";
    const result = await run("sh", ["-c", `${privilegePrefix}yum install -y ${pkgs}`], {
      stdio: "inherit",
    });
    return result.exitCode === 0;
  }

  if (await canRun("pacman")) {
    const pkgs =
      provider === "vllm"
        ? "base-devel python"
        : "base-devel cmake ninja pkgconf python";
    const result = await run("sh", ["-c", `${privilegePrefix}pacman -Sy --noconfirm ${pkgs}`], {
      stdio: "inherit",
    });
    return result.exitCode === 0;
  }

  if (await canRun("zypper")) {
    const pkgs =
      provider === "vllm"
        ? "gcc gcc-c++ make python3-devel"
        : "gcc gcc-c++ make cmake ninja pkg-config python3-devel";
    const result = await run(
      "sh",
      ["-c", `${privilegePrefix}zypper --non-interactive install ${pkgs}`],
      { stdio: "inherit" }
    );
    return result.exitCode === 0;
  }

  if (await canRun("apk")) {
    const pkgs =
      provider === "vllm"
        ? "build-base python3-dev"
        : "build-base cmake ninja pkgconf python3-dev";
    const result = await run("sh", ["-c", `${privilegePrefix}apk add --no-cache ${pkgs}`], {
      stdio: "inherit",
    });
    return result.exitCode === 0;
  }

  return false;
}

async function installPipWithSystemPackageManager() {
  const privilegePrefix = await getPrivilegePrefix();
  if (privilegePrefix === null) {
    return false;
  }

  if (await canRun("apt-get")) {
    const result = await run(
      "sh",
      ["-c", `${privilegePrefix}apt-get update && ${privilegePrefix}apt-get install -y python3-pip`],
      { stdio: "inherit" }
    );
    if (result.exitCode === 0) {
      return true;
    }
  }

  if (await canRun("dnf")) {
    const result = await run("sh", ["-c", `${privilegePrefix}dnf install -y python3-pip`], {
      stdio: "inherit",
    });
    if (result.exitCode === 0) {
      return true;
    }
  }

  if (await canRun("yum")) {
    const result = await run("sh", ["-c", `${privilegePrefix}yum install -y python3-pip`], {
      stdio: "inherit",
    });
    if (result.exitCode === 0) {
      return true;
    }
  }

  if (await canRun("pacman")) {
    const result = await run("sh", ["-c", `${privilegePrefix}pacman -Sy --noconfirm python-pip`], {
      stdio: "inherit",
    });
    if (result.exitCode === 0) {
      return true;
    }
  }

  if (await canRun("zypper")) {
    const result = await run(
      "sh",
      ["-c", `${privilegePrefix}zypper --non-interactive install python3-pip`],
      { stdio: "inherit" }
    );
    if (result.exitCode === 0) {
      return true;
    }
  }

  if (await canRun("apk")) {
    const result = await run("sh", ["-c", `${privilegePrefix}apk add --no-cache py3-pip`], {
      stdio: "inherit",
    });
    if (result.exitCode === 0) {
      return true;
    }
  }

  return false;
}

async function installPythonVenvWithSystemPackageManager() {
  const privilegePrefix = await getPrivilegePrefix();
  if (privilegePrefix === null) {
    return false;
  }

  if (await canRun("apt-get")) {
    const result = await run(
      "sh",
      ["-c", `${privilegePrefix}apt-get update && ${privilegePrefix}apt-get install -y python3-venv`],
      { stdio: "inherit" }
    );
    if (result.exitCode === 0) {
      return true;
    }
  }

  if (await canRun("dnf")) {
    const result = await run("sh", ["-c", `${privilegePrefix}dnf install -y python3`], {
      stdio: "inherit",
    });
    if (result.exitCode === 0) {
      return true;
    }
  }

  if (await canRun("yum")) {
    const result = await run("sh", ["-c", `${privilegePrefix}yum install -y python3`], {
      stdio: "inherit",
    });
    if (result.exitCode === 0) {
      return true;
    }
  }

  if (await canRun("pacman")) {
    const result = await run("sh", ["-c", `${privilegePrefix}pacman -Sy --noconfirm python`], {
      stdio: "inherit",
    });
    if (result.exitCode === 0) {
      return true;
    }
  }

  if (await canRun("zypper")) {
    const result = await run(
      "sh",
      ["-c", `${privilegePrefix}zypper --non-interactive install python3-virtualenv`],
      { stdio: "inherit" }
    );
    if (result.exitCode === 0) {
      return true;
    }
  }

  if (await canRun("apk")) {
    const result = await run("sh", ["-c", `${privilegePrefix}apk add --no-cache py3-virtualenv`], {
      stdio: "inherit",
    });
    if (result.exitCode === 0) {
      return true;
    }
  }

  return false;
}

async function getPrivilegePrefix() {
  if (typeof process.getuid !== "function") {
    return "";
  }

  if (process.getuid() === 0) {
    return "";
  }

  if (await canRun("sudo")) {
    return "sudo ";
  }

  return null;
}

function isLikelyVirtualEnvironment(python) {
  const commandPath = String(python?.command || "").toLowerCase();
  return (
    Boolean(process.env.VIRTUAL_ENV || process.env.CONDA_PREFIX) ||
    commandPath.includes("runtime-venv") ||
    commandPath.includes(".venv") ||
    commandPath.includes("/venv/") ||
    commandPath.includes("\\venv\\")
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
