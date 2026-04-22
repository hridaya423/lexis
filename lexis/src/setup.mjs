import { mkdir } from "node:fs/promises";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { loadConfig, saveConfig } from "./config.mjs";
import { installHooks, normalizeHookMode } from "./hooks.mjs";
import { recordModelUsage } from "./model-history.mjs";
import {
  buildStartCommand,
  buildWarmupRequest,
  defaultBaseUrlForProvider,
  detectRuntimeProvider,
  getCurrentMachineProfile,
  getProviderReadinessEndpoints,
  hasNvidiaGpu,
  normalizeBaseUrl,
  normalizeProvider,
  resolveModelList,
} from "./providers.mjs";

const MODEL_ARG_FLAGS = new Set(["--model", "--hf_model_repo_id", "--served-model-name"]);

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

  const machine = getCurrentMachineProfile();
  const modelList = resolveModelList({
    provider,
    models,
    modelProfile,
    currentDefaultModel: config.model,
    machine,
  });

  const chosenDefaultModel =
    typeof defaultModel === "string" && defaultModel.trim().length > 0
      ? defaultModel.trim()
      : modelList[0] || config.model;

  const runtime = await ensureRuntimeAvailable({
    provider,
    model: chosenDefaultModel,
    baseUrl: config.llm?.baseUrl || defaultBaseUrlForProvider(provider, machine),
    machine,
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

  await saveConfig(config);
  await recordModelUsage({
    provider,
    models: [chosenDefaultModel, ...modelList],
  });

  const warmup = await warmupModel({
    provider,
    baseUrl: runtime.baseUrl,
    model: chosenDefaultModel,
    server: runtime.server,
  });

  runtime.server?.detach?.();

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

async function ensureRuntimeAvailable({ provider, model, baseUrl, machine }) {
  if (provider === "ollama") {
    if (!(await canRun("ollama"))) {
      throw new Error("Ollama is required on Windows. Install Ollama and ensure the 'ollama' command is on PATH.");
    }

    const normalizedBaseUrl = normalizeBaseUrl(baseUrl || defaultBaseUrlForProvider(provider, machine));
    const start = buildStartCommand({ provider, python: { command: "", prefix: [] }, model, baseUrl: normalizedBaseUrl, machine });
    const server = await ensureServerReady({ provider, baseUrl: normalizedBaseUrl, start });

    return {
      baseUrl: normalizedBaseUrl,
      start,
      python: "ollama",
      server,
    };
  }

  const systemPython = await ensurePythonAvailable();
  const python = await ensureRuntimePython(systemPython);
  await ensurePipAvailable(python);
  await ensurePackagingToolsAvailable(python);
  await installProviderDependencies(provider, python);

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const start = buildStartCommand({ provider, python, model, baseUrl: normalizedBaseUrl, machine });
  const server = await ensureServerReady({ provider, baseUrl: normalizedBaseUrl, start });

  return {
    baseUrl: normalizedBaseUrl,
    start,
    python: formatPythonForDisplay(python),
    server,
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
    [
      ...python.prefix,
      "-m",
      "pip",
      "install",
      "--upgrade",
      "--disable-pip-version-check",
      "--quiet",
      "pip",
      "setuptools",
      "wheel",
    ],
    { stdio: "inherit" }
  );

  if (result.exitCode !== 0) {
    process.stdout.write("[lexis-setup] Packaging tool upgrade failed; continuing with existing pip toolchain.\n");
  }
}

async function installProviderDependencies(provider, python) {
  if (provider === "ollama") {
    if (await canRun("ollama")) {
      return;
    }
    throw new Error("Ollama is not installed. Install Ollama and re-run setup.");
  }

  const packages =
    provider === "mlx"
      ? ["mlx-lm"]
      : provider === "vllm"
        ? ["vllm"]
        : ["llama-cpp-python[server]", "huggingface-hub>=0.23.0"];

  const installArgs = [
    ...python.prefix,
    "-m",
    "pip",
    "install",
    "--upgrade",
    "--disable-pip-version-check",
    "--quiet",
    ...packages,
  ];
  const installUserArgs = [
    ...python.prefix,
    "-m",
    "pip",
    "install",
    "--upgrade",
    "--disable-pip-version-check",
    "--quiet",
    "--user",
    ...packages,
  ];
  const preferUserInstall = !isLikelyVirtualEnvironment(python);

  if (provider === "llamacpp" && process.platform === "win32" && (await hasNvidiaGpu())) {
    const cudaEnv = {
      ...process.env,
      CMAKE_ARGS: mergeCmakeArgs(process.env.CMAKE_ARGS, "-DGGML_CUDA=on"),
      FORCE_CMAKE: "1",
    };

    process.stdout.write("[lexis-setup] NVIDIA GPU detected on Windows. Attempting CUDA-enabled llama.cpp install...\n");

    const cudaAttempt = await run(
      python.command,
      preferUserInstall ? installArgs : installArgs,
      { stdio: "inherit", env: cudaEnv }
    );

    if (cudaAttempt.exitCode === 0) {
      return;
    }

    process.stdout.write("[lexis-setup] CUDA-enabled llama.cpp install failed. Falling back to CPU build.\n");
  }

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

async function ensureServerReady({ provider, baseUrl, start }) {
  if (await isServerReady(provider, baseUrl)) {
    return null;
  }

  process.stdout.write("[lexis-setup] Starting local LLM server...\n");
  process.stdout.write(`[lexis-setup] command: ${start.command} ${start.args.join(" ")}\n`);

  const server = startServer(start);
  const maxAttempts = 600;
  const reporter = createServerWaitReporter({ maxSeconds: maxAttempts });
  const downloadTracker = createModelDownloadTracker({ provider, start });

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await sleep(1000);
    const elapsedSeconds = attempt + 1;
    server.pollOutput?.();
    const serverProgress = server.getDownloadProgress?.() || null;
    const trackedProgress = await downloadTracker.tick();
    const download = mergeDownloadProgress(serverProgress, trackedProgress);
    reporter.tick({
      elapsedSeconds,
      download,
    });

    if (await isServerReady(provider, baseUrl)) {
      reporter.finish({
        elapsedSeconds,
        download,
      });
      return server;
    }

    if (server.hasExited()) {
      if (isPortConflictError(server.getRecentLogs())) {
        const existing = await waitForExistingServer(provider, baseUrl, 10_000);
        if (existing) {
          reporter.finish({
            elapsedSeconds,
            download,
          });
          return null;
        }
      }

      reporter.close();
      throw new Error(buildServerStartupError({
        baseUrl,
        summary: server.getExitSummary(),
        recentLogs: server.getRecentLogs(),
      }));
    }
  }

  reporter.close();
  server.terminate();
  throw new Error(buildServerStartupError({
    baseUrl,
    summary: "timed out while waiting for readiness",
    recentLogs: server.getRecentLogs(),
  }));
}

async function warmupModel({ provider, baseUrl, model, server }) {
  const timeoutSeconds = estimateWarmupTimeoutSeconds({ provider, model });
  const retryTimeoutSeconds = Math.min(timeoutSeconds * 2, 900);
  const attemptTimeouts = [timeoutSeconds, retryTimeoutSeconds];
  const request = buildWarmupRequest(provider, model);
  const endpoint = `${normalizeBaseUrl(baseUrl)}${request.path}`;

  process.stdout.write(
    `[lexis-setup] Warming ${provider} model ${model} (this can take a while on first download)...\n`
  );

  for (let attempt = 0; attempt < attemptTimeouts.length; attempt += 1) {
    const attemptTimeoutSeconds = attemptTimeouts[attempt];

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        signal: AbortSignal.timeout(attemptTimeoutSeconds * 1000),
        body: JSON.stringify(request.body),
      });

      if (!response.ok) {
        const body = await response.text();
        const shouldRetry = response.status === 408 || response.status === 429 || response.status >= 500;
        if (shouldRetry && attempt < attemptTimeouts.length - 1) {
          process.stdout.write(
            `[lexis-setup] Warmup request returned ${response.status}. Retrying with a longer timeout...\n`
          );
          continue;
        }

        return {
          ok: false,
          message: `Warmup request failed (${response.status}): ${body.slice(0, 160)}`,
        };
      }

      const payload = await response.json().catch(() => null);
      const content =
        String(provider || "").toLowerCase() === "ollama"
          ? payload?.message?.content
          : payload?.choices?.[0]?.message?.content;
      const text = typeof content === "string" ? content.trim() : "";
      if (!text) {
        return {
          ok: false,
          message: "Warmup completed without any assistant content.",
        };
      }

      return {
        ok: true,
        message: "Model warmup completed.",
      };
    } catch (error) {
      const timedOut = isWarmupTimeoutError(error);
      if (timedOut && attempt < attemptTimeouts.length - 1) {
        process.stdout.write(
          `[lexis-setup] Warmup timed out after ${attemptTimeoutSeconds}s. Retrying once with a longer timeout...\n`
        );
        continue;
      }

      const details = [];

      if (server?.hasExited?.()) {
        details.push(server.getExitSummary());
      }

      const recentLogs = server?.getRecentLogs?.();
      if (recentLogs) {
        details.push(`Recent server output:\n${recentLogs}`);
      }

      if (timedOut) {
        details.push("Hint: initial model warmup can exceed expected time on slower networks/disks. Lexis setup can still be used; first run may be slower.");
      }

      return {
        ok: false,
        message: `Warmup did not complete: ${error.message}${details.length ? `\n${details.join("\n")}` : ""}`,
      };
    }
  }

  return {
    ok: false,
    message: "Warmup did not complete due to an unknown retry exhaustion state.",
  };
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
      ? 120
      : bucket === "medium"
        ? 180
        : bucket === "large"
          ? 300
          : 420;
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

function isWarmupTimeoutError(error) {
  if (!error) {
    return false;
  }

  const name = String(error.name || "").toLowerCase();
  const message = String(error.message || "").toLowerCase();
  return (
    name === "timeouterror" ||
    name === "aborterror" ||
    message.includes("aborted due to timeout") ||
    message.includes("signal timed out") ||
    message.includes("timeout")
  );
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

async function isServerReady(provider, baseUrl) {
  const base = normalizeBaseUrl(baseUrl);
  const normalizedProvider = normalizeProvider(provider, getCurrentMachineProfile());

  for (const endpoint of getProviderReadinessEndpoints(provider)) {
    try {
      const response = await fetch(`${base}${endpoint}`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) {
        return false;
      }
      if (endpoint === "/v1/models" && normalizedProvider !== "mlx") {
        const payload = await response.json().catch(() => null);
        if (payload && Array.isArray(payload.data) && payload.data.length === 0) {
          return false;
        }
      }
    } catch {
      return false;
    }
  }

  return true;
}

function startServer(start) {
  const logChunks = [];
  const logFilePath = path.join(
    os.tmpdir(),
    `lexis-llm-server-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.log`
  );
  let logReadOffset = 0;
  let tailFragment = "";
  let latestDownloadProgress = null;
  let exited = false;
  let exitCode = null;
  let signalCode = null;

  const appendLogs = (streamName, chunk) => {
    const text = String(chunk || "").replace(/\0/g, "");
    if (!text) {
      return;
    }

    for (const rawLine of text.split(/\r?\n|\r/)) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }

      const progress = parseDownloadProgressFromLine(line);
      if (progress) {
        latestDownloadProgress = mergeDownloadProgress(latestDownloadProgress, progress);
      }

      logChunks.push(`[${streamName}] ${line}`);
      while (logChunks.join("").length > 12000) {
        logChunks.shift();
      }
    }
  };

  const flushLogFile = () => {
    try {
      const stats = fs.statSync(logFilePath, { throwIfNoEntry: false });
      if (!stats || stats.size <= logReadOffset) {
        return;
      }

      const nextLength = stats.size - logReadOffset;
      const fd = fs.openSync(logFilePath, "r");
      const buffer = Buffer.allocUnsafe(nextLength);
      const read = fs.readSync(fd, buffer, 0, nextLength, logReadOffset);
      fs.closeSync(fd);
      logReadOffset += read;

      if (read <= 0) {
        return;
      }

      const chunk = tailFragment + buffer.toString("utf8", 0, read);
      const split = chunk.split(/\r?\n|\r/);
      tailFragment = split.pop() || "";
      appendLogs("server", split.join("\n"));
    } catch {
      // Best effort only.
    }
  };

  const cleanupLogFile = () => {
    try {
      fs.rmSync(logFilePath, { force: true });
    } catch {
      // Best effort only.
    }
  };

  try {
    const logFd = fs.openSync(logFilePath, "a");
    const child = spawn(start.command, start.args, {
      detached: true,
      stdio: ["ignore", logFd, logFd],
      windowsHide: true,
      env: process.env,
    });
    fs.closeSync(logFd);

    child.once("exit", (code, signal) => {
      flushLogFile();
      exited = true;
      exitCode = code;
      signalCode = signal;
    });

    return {
      hasExited() {
        flushLogFile();
        return exited;
      },
      pollOutput() {
        flushLogFile();
      },
      getDownloadProgress() {
        flushLogFile();
        return latestDownloadProgress;
      },
      getExitSummary() {
        if (!exited) {
          return "process exited before readiness";
        }
        if (signalCode) {
          return `process exited with signal ${signalCode}`;
        }
        return `process exited with code ${exitCode ?? "unknown"}`;
      },
      getRecentLogs() {
        flushLogFile();
        return logChunks
          .join("\n")
          .trim()
          .split(/\r?\n/)
          .filter(Boolean)
          .slice(-24)
          .join("\n");
      },
      detach() {
        flushLogFile();
        child.unref();
        cleanupLogFile();
      },
      terminate() {
        flushLogFile();
        if (!exited) {
          child.kill();
        }
        cleanupLogFile();
      },
    };
  } catch (error) {
    cleanupLogFile();
    return {
      hasExited() {
        return true;
      },
      pollOutput() {},
      getDownloadProgress() {
        return null;
      },
      getExitSummary() {
        return `failed to spawn process: ${error?.message || "unknown error"}`;
      },
      getRecentLogs() {
        return "";
      },
      detach() {},
      terminate() {},
    };
  }
}

function buildServerStartupError({ baseUrl, summary, recentLogs }) {
  let message = `LLM server did not become ready at ${baseUrl} (${summary}).`;
  if (String(summary || "").toUpperCase().includes("SIGTERM")) {
    message += "\nHint: the local MLX server process was terminated externally. Re-run setup in a fresh terminal and avoid killing mlx_lm/python processes during download.";
  }
  if (recentLogs) {
    message += `\nRecent server output:\n${recentLogs}`;
  }
  return message;
}

async function waitForExistingServer(provider, baseUrl, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerReady(provider, baseUrl)) {
      return true;
    }
    await sleep(1000);
  }
  return false;
}

function isPortConflictError(text) {
  const message = String(text || "").toLowerCase();
  return (
    message.includes("address already in use") ||
    message.includes("eaddrinuse") ||
    message.includes("errno 48")
  );
}

function formatPythonForDisplay(python) {
  return [python.command, ...python.prefix].join(" ").trim();
}

function mergeCmakeArgs(existing, extra) {
  const left = String(existing || "").trim();
  const right = String(extra || "").trim();
  if (!left) {
    return right;
  }
  if (!right) {
    return left;
  }
  return `${left} ${right}`;
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

function createServerWaitReporter({ maxSeconds }) {
  const heading = "[lexis-setup] Waiting for local LLM server (first run may take several minutes for model download)...";
  process.stdout.write(`${heading}\n`);
  const etaEstimator = createDownloadEtaEstimator();

  const supportsInlineProgress = Boolean(process.stdout.isTTY);
  if (!supportsInlineProgress) {
    return {
      tick({ elapsedSeconds, download }) {
        const estimatedEta = etaEstimator.update({ elapsedSeconds, download });
        const sourceEta = Number.isFinite(download?.etaSeconds) ? download.etaSeconds : Number.NaN;
        const etaSeconds = Number.isFinite(estimatedEta) ? estimatedEta : sourceEta;
        const etaText = Number.isFinite(etaSeconds) ? `, ETA ${formatDurationCompact(etaSeconds)}` : "";

        if (Number.isFinite(download?.currentBytes) && Number.isFinite(download?.totalBytes) && download.totalBytes > 0) {
          if (elapsedSeconds % 5 === 0) {
            const percent = Math.round((download.currentBytes / download.totalBytes) * 100);
            process.stdout.write(
              `[lexis-setup] Downloading model... ${formatByteCount(download.currentBytes)} / ${formatByteCount(download.totalBytes)} (${percent}%)${etaText}\n`
            );
          }
          return;
        }

        if (Number.isFinite(download?.percent) && elapsedSeconds % 5 === 0) {
          const bytes = Number.isFinite(download?.currentBytes) ? ` (${formatByteCount(download.currentBytes)})` : "";
          process.stdout.write(`[lexis-setup] Downloading model... ${Math.round(download.percent)}%${bytes}${etaText}\n`);
          return;
        }

        if (Number.isFinite(download?.currentBytes) && elapsedSeconds % 5 === 0) {
          process.stdout.write(`[lexis-setup] Downloading model... ${formatByteCount(download.currentBytes)}${etaText}\n`);
          return;
        }

        if (elapsedSeconds % 30 === 0) {
          process.stdout.write(`[lexis-setup] Still waiting... ${elapsedSeconds}s\n`);
        }
      },
      finish({ elapsedSeconds }) {
        process.stdout.write(`[lexis-setup] Local LLM server is ready (${elapsedSeconds}s).\n`);
      },
      close() {},
    };
  }

  let lastLineLength = 0;

  const render = ({ elapsedSeconds, download }) => {
    const estimatedEta = etaEstimator.update({ elapsedSeconds, download });
    const sourceEta = Number.isFinite(download?.etaSeconds) ? download.etaSeconds : Number.NaN;
    const etaSeconds = Number.isFinite(estimatedEta) ? estimatedEta : sourceEta;
    const etaText = Number.isFinite(etaSeconds) ? ` ETA ${formatDurationCompact(etaSeconds)}` : "";
    const width = 26;
    const hasPercentProgress = Number.isFinite(download?.percent);
    const hasByteProgress =
      Number.isFinite(download?.currentBytes) && Number.isFinite(download?.totalBytes) && download.totalBytes > 0;
    const ratio = hasByteProgress
      ? Math.max(0, Math.min(1, download.currentBytes / download.totalBytes))
      : hasPercentProgress
        ? Math.max(0, Math.min(1, download.percent / 100))
        : Math.max(0, Math.min(1, elapsedSeconds / maxSeconds));
    const filled = Math.round(width * ratio);
    const bar = `${"#".repeat(filled)}${"-".repeat(Math.max(0, width - filled))}`;
    const detail = hasByteProgress
      ? `${formatByteCount(download.currentBytes)} / ${formatByteCount(download.totalBytes)} (${Math.round(ratio * 100)}%)${etaText}`
      : hasPercentProgress && Number.isFinite(download?.currentBytes)
        ? `${formatByteCount(download.currentBytes)} (${Math.round(download.percent)}%)${etaText}`
        : hasPercentProgress
          ? `${Math.round(download.percent)}%${etaText}`
      : Number.isFinite(download?.currentBytes)
        ? `${formatByteCount(download.currentBytes)} downloaded${etaText}`
        : `${elapsedSeconds}s`;
    const line = `[lexis-setup] Download/startup progress [${bar}] ${detail}`;
    const padding = lastLineLength > line.length ? " ".repeat(lastLineLength - line.length) : "";
    process.stdout.write(`\r${line}${padding}`);
    lastLineLength = line.length;
  };

  render({ elapsedSeconds: 0, download: null });

  return {
    tick({ elapsedSeconds, download }) {
      render({ elapsedSeconds, download });
    },
    finish({ elapsedSeconds, download }) {
      render({ elapsedSeconds, download });
      process.stdout.write("\n");
      process.stdout.write(`[lexis-setup] Local LLM server is ready (${elapsedSeconds}s).\n`);
      lastLineLength = 0;
    },
    close() {
      if (lastLineLength > 0) {
        process.stdout.write("\n");
        lastLineLength = 0;
      }
    },
  };
}

function parseDownloadProgressFromLine(line) {
  if (!line || typeof line !== "string") {
    return null;
  }

  const pairMatch = line.match(/(\d+(?:\.\d+)?)\s*([KMGT]?i?B|[KMGT]?B|[KMGT])\s*\/\s*(\d+(?:\.\d+)?)\s*([KMGT]?i?B|[KMGT]?B|[KMGT])/i);
  if (!pairMatch) {
    return null;
  }

  const etaSeconds = parseEtaSecondsFromLine(line);
  const currentBytes = parseByteCount(pairMatch[1], pairMatch[2]);
  const totalBytes = parseByteCount(pairMatch[3], pairMatch[4]);

  if (!Number.isFinite(currentBytes) || !Number.isFinite(totalBytes) || totalBytes <= 0) {
    return null;
  }

  return {
    currentBytes,
    totalBytes,
    percent: Math.round((currentBytes / totalBytes) * 100),
    ...(Number.isFinite(etaSeconds) ? { etaSeconds } : {}),
  };
}

function parseEtaSecondsFromLine(line) {
  const tokenMatch = String(line || "").match(/<\s*(\d{1,2}:\d{2}(?::\d{2})?)/);
  if (!tokenMatch) {
    return Number.NaN;
  }

  const token = tokenMatch[1];
  const parts = token.split(":").map((value) => Number.parseInt(value, 10));
  if (parts.some((value) => !Number.isFinite(value) || value < 0)) {
    return Number.NaN;
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return Number.NaN;
}

function mergeDownloadProgress(primary, secondary) {
  const merged = {
    currentBytes: Number.isFinite(primary?.currentBytes) ? primary.currentBytes : Number.NaN,
    totalBytes: Number.isFinite(primary?.totalBytes) ? primary.totalBytes : Number.NaN,
    percent: Number.isFinite(primary?.percent) ? primary.percent : Number.NaN,
    etaSeconds: Number.isFinite(primary?.etaSeconds) ? primary.etaSeconds : Number.NaN,
  };

  if (Number.isFinite(secondary?.currentBytes)) {
    merged.currentBytes = secondary.currentBytes;
  }
  if (Number.isFinite(secondary?.totalBytes)) {
    merged.totalBytes = secondary.totalBytes;
  }
  if (Number.isFinite(secondary?.percent)) {
    merged.percent = secondary.percent;
  }
  if (Number.isFinite(secondary?.etaSeconds)) {
    merged.etaSeconds = secondary.etaSeconds;
  }

  if (Number.isFinite(merged.currentBytes) && Number.isFinite(merged.totalBytes) && merged.totalBytes > 0) {
    merged.percent = Math.max(0, Math.min(100, Math.round((merged.currentBytes / merged.totalBytes) * 100)));
  }

  if (
    !Number.isFinite(merged.currentBytes) &&
    !Number.isFinite(merged.totalBytes) &&
    !Number.isFinite(merged.percent) &&
    !Number.isFinite(merged.etaSeconds)
  ) {
    return null;
  }

  return merged;
}

function createModelDownloadTracker({ provider, start }) {
  const normalizedProvider = normalizeProvider(provider, getCurrentMachineProfile());
  if (normalizedProvider !== "mlx") {
    return {
      async tick() {
        return null;
      },
    };
  }

  const modelId = extractModelIdFromStartArgs(start?.args || []);
  if (!isLikelyHuggingFaceRepo(modelId)) {
    return {
      async tick() {
        return null;
      },
    };
  }

  const modelCacheDir = resolveHuggingFaceModelCacheDir(modelId);
  const totalBytesPromise = fetchHuggingFaceModelTotalBytes(modelId);

  return {
    async tick() {
      const currentBytes = sumDirectoryBytesSafe(modelCacheDir);
      const totalBytes = await totalBytesPromise;

      if (!Number.isFinite(currentBytes) || currentBytes <= 0) {
        return null;
      }

      if (!Number.isFinite(totalBytes) || totalBytes <= 0) {
        return {
          currentBytes,
        };
      }

      const boundedCurrent = Math.min(currentBytes, totalBytes);
      return {
        currentBytes: boundedCurrent,
        totalBytes,
      };
    },
  };
}

function extractModelIdFromStartArgs(args) {
  const values = Array.isArray(args) ? args.map((item) => String(item || "")) : [];
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!MODEL_ARG_FLAGS.has(value)) {
      continue;
    }
    const next = values[index + 1];
    if (next && next.trim()) {
      return next.trim();
    }
  }
  return "";
}

function isLikelyHuggingFaceRepo(model) {
  const value = String(model || "").trim();
  return Boolean(value) && value.includes("/") && !value.startsWith("/") && !value.includes(":\\");
}

function resolveHuggingFaceModelCacheDir(modelId) {
  const hfHome =
    typeof process.env.HF_HOME === "string" && process.env.HF_HOME.trim()
      ? process.env.HF_HOME.trim()
      : path.join(os.homedir(), ".cache", "huggingface");
  const repoKey = String(modelId || "").replace(/\//g, "--");
  return path.join(hfHome, "hub", `models--${repoKey}`);
}

async function fetchHuggingFaceModelTotalBytes(modelId) {
  const apiUrl = `https://huggingface.co/api/models/${encodeURIComponent(modelId)}`;
  const token =
    typeof process.env.HF_TOKEN === "string" && process.env.HF_TOKEN.trim()
      ? process.env.HF_TOKEN.trim()
      : "";
  const headers = token ? { authorization: `Bearer ${token}` } : undefined;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      signal: AbortSignal.timeout(8000),
      headers,
    });
    if (!response.ok) {
      return await fetchHuggingFaceModelTotalBytesByResolve(modelId, headers);
    }

    const payload = await response.json().catch(() => null);
    const siblings = Array.isArray(payload?.siblings) ? payload.siblings : [];
    const total = siblings.reduce((sum, sibling) => {
      const size = sibling?.size;
      return Number.isFinite(size) && size > 0 ? sum + size : sum;
    }, 0);

    if (total > 0) {
      return total;
    }

    return await fetchHuggingFaceModelTotalBytesByResolve(modelId, headers);
  } catch {
    return await fetchHuggingFaceModelTotalBytesByResolve(modelId, headers);
  }
}

async function fetchHuggingFaceModelTotalBytesByResolve(modelId, headers) {
  const modelPath = encodePathForHf(modelId);
  const base = `https://huggingface.co/${modelPath}/resolve/main`;

  try {
    const indexResponse = await fetch(`${base}/model.safetensors.index.json`, {
      method: "GET",
      signal: AbortSignal.timeout(8000),
      headers,
    });

    if (indexResponse.ok) {
      const indexPayload = await indexResponse.json().catch(() => null);
      const weightMap = indexPayload?.weight_map && typeof indexPayload.weight_map === "object"
        ? indexPayload.weight_map
        : null;
      const shardNames = weightMap
        ? [...new Set(Object.values(weightMap).map((value) => String(value || "").trim()).filter(Boolean))]
        : [];
      const shardTotal = await sumResolveFileContentLengths({
        base,
        fileNames: shardNames,
        headers,
      });
      if (Number.isFinite(shardTotal) && shardTotal > 0) {
        return shardTotal;
      }
    }
  } catch {
    // Fall through to single-file fallback.
  }

  const singleFileTotal = await sumResolveFileContentLengths({
    base,
    fileNames: ["model.safetensors"],
    headers,
  });
  return Number.isFinite(singleFileTotal) && singleFileTotal > 0 ? singleFileTotal : Number.NaN;
}

async function sumResolveFileContentLengths({ base, fileNames, headers }) {
  let total = 0;
  for (const fileName of fileNames) {
    const item = String(fileName || "").trim();
    if (!item) {
      continue;
    }

    try {
      const response = await fetch(`${base}/${encodePathForHf(item)}`, {
        method: "HEAD",
        signal: AbortSignal.timeout(8000),
        headers,
      });
      if (!response.ok) {
        continue;
      }

      const contentLength = Number.parseInt(response.headers.get("content-length") || "", 10);
      if (!Number.isFinite(contentLength) || contentLength <= 0) {
        continue;
      }

      total += contentLength;
    } catch {
      // Ignore per-file failures.
    }
  }

  return total > 0 ? total : Number.NaN;
}

function encodePathForHf(pathValue) {
  return String(pathValue || "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function sumDirectoryBytesSafe(rootDir) {
  if (!rootDir || !fs.existsSync(rootDir)) {
    return 0;
  }

  const stack = [rootDir];
  let total = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === ".locks") {
          continue;
        }
        stack.push(next);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      try {
        total += fs.statSync(next).size;
      } catch {
        // Ignore files that disappear mid-read.
      }
    }
  }

  return total;
}

function parseByteCount(amount, unit) {
  const value = Number.parseFloat(String(amount || ""));
  if (!Number.isFinite(value)) {
    return Number.NaN;
  }

  const normalized = String(unit || "B").toUpperCase();
  const base = normalized.includes("IB") ? 1024 : 1000;
  const key = normalized.replace(/IB|B/g, "");
  const powers = {
    "": 0,
    K: 1,
    M: 2,
    G: 3,
    T: 4,
  };
  const power = powers[key] ?? 0;
  return value * base ** power;
}

function formatByteCount(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

function createDownloadEtaEstimator() {
  const samples = [];
  const maxWindowSeconds = 60;
  let lastEtaSeconds = Number.NaN;
  let lastEtaAtSeconds = Number.NaN;
  let smoothedBytesPerSecond = Number.NaN;
  let lastProgressBytes = 0;
  let lastProgressAtSeconds = 0;

  return {
    update({ elapsedSeconds, download }) {
      const currentBytes = Number.isFinite(download?.currentBytes) ? download.currentBytes : Number.NaN;
      const totalBytes = Number.isFinite(download?.totalBytes) ? download.totalBytes : Number.NaN;
      const fallbackEta = () => {
        if (
          Number.isFinite(lastEtaSeconds) &&
          Number.isFinite(lastEtaAtSeconds) &&
          elapsedSeconds - lastEtaAtSeconds <= 90
        ) {
          return lastEtaSeconds;
        }
        return Number.NaN;
      };

      if (!Number.isFinite(currentBytes) || currentBytes <= 0) {
        return fallbackEta();
      }

      if (!Number.isFinite(totalBytes) || totalBytes <= 0 || currentBytes >= totalBytes) {
        return Number.NaN;
      }

      if (currentBytes >= lastProgressBytes + 1024 * 1024) {
        lastProgressBytes = currentBytes;
        lastProgressAtSeconds = elapsedSeconds;
      }

      if (lastProgressAtSeconds > 0 && elapsedSeconds - lastProgressAtSeconds > 10) {
        return fallbackEta();
      }

      const remainingBytes = totalBytes - currentBytes;
      const remainingRatio = remainingBytes / totalBytes;
      if (remainingBytes <= 20 * 1024 * 1024 || remainingRatio <= 0.02) {
        return Number.NaN;
      }

      if (samples.length > 0 && currentBytes < samples[samples.length - 1].bytes) {
        samples.length = 0;
        lastEtaSeconds = Number.NaN;
        lastEtaAtSeconds = Number.NaN;
        smoothedBytesPerSecond = Number.NaN;
        lastProgressBytes = currentBytes;
        lastProgressAtSeconds = elapsedSeconds;
      }

      samples.push({ seconds: elapsedSeconds, bytes: currentBytes });

      while (samples.length > 0 && elapsedSeconds - samples[0].seconds > maxWindowSeconds) {
        samples.shift();
      }

      const first = samples[0];
      const last = samples[samples.length - 1];
      const windowSeconds = Math.max(1, last.seconds - first.seconds);
      const windowBytes = last.bytes - first.bytes;
      const windowRate =
        windowSeconds >= 4 && windowBytes >= 1024 * 1024 ? windowBytes / windowSeconds : Number.NaN;

      const overallRate = elapsedSeconds >= 6 ? currentBytes / Math.max(1, elapsedSeconds) : Number.NaN;

      let effectiveRate = Number.NaN;
      if (Number.isFinite(windowRate) && Number.isFinite(overallRate)) {
        effectiveRate = windowRate * 0.7 + overallRate * 0.3;
      } else if (Number.isFinite(windowRate)) {
        effectiveRate = windowRate;
      } else if (Number.isFinite(overallRate)) {
        effectiveRate = overallRate;
      }

      if (!Number.isFinite(effectiveRate) || effectiveRate <= 0) {
        return fallbackEta();
      }

      if (!Number.isFinite(smoothedBytesPerSecond)) {
        smoothedBytesPerSecond = effectiveRate;
      } else {
        const alpha = 0.3;
        smoothedBytesPerSecond = alpha * effectiveRate + (1 - alpha) * smoothedBytesPerSecond;
      }

      if (!Number.isFinite(smoothedBytesPerSecond) || smoothedBytesPerSecond <= 0) {
        return fallbackEta();
      }

      let etaSeconds = remainingBytes / smoothedBytesPerSecond;
      if (!Number.isFinite(etaSeconds) || etaSeconds <= 0 || etaSeconds > 24 * 60 * 60) {
        return fallbackEta();
      }

      if (elapsedSeconds < 8 || currentBytes < 128 * 1024 * 1024) {
        return fallbackEta();
      }

      if (Number.isFinite(lastEtaSeconds)) {
        const maxUpwardDrift = Math.max(lastEtaSeconds * 1.15, lastEtaSeconds + 10);
        etaSeconds = Math.min(etaSeconds, maxUpwardDrift);
      }

      lastEtaSeconds = etaSeconds;
      lastEtaAtSeconds = elapsedSeconds;
      return etaSeconds;
    },
  };
}

function formatDurationCompact(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0s";
  }

  const rounded = Math.max(1, Math.round(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
