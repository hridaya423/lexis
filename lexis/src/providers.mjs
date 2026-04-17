import os from "node:os";
import process from "node:process";
import { spawnSync } from "node:child_process";

export const DEFAULT_BASE_URL = "http://127.0.0.1:8000";
export const OLLAMA_BASE_URL = "http://127.0.0.1:11434";

export const MODEL_PROFILES = {
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
  ollama: {
    light: ["qwen2.5-coder:3b"],
    balanced: ["qwen2.5-coder:7b"],
    heavy: ["qwen2.5-coder:14b"],
  },
};

const NVIDIA_GPU_CACHE = { value: undefined };

export function isAppleSiliconMac({ platform = process.platform, arch = process.arch } = {}) {
  return platform === "darwin" && arch === "arm64";
}

export function hasNvidiaGpuSync() {
  if (typeof NVIDIA_GPU_CACHE.value === "boolean") {
    return NVIDIA_GPU_CACHE.value;
  }

  try {
    const result = spawnSync("nvidia-smi", ["-L"], {
      stdio: "pipe",
      windowsHide: true,
      encoding: "utf8",
    });
    NVIDIA_GPU_CACHE.value = result.status === 0;
  } catch {
    NVIDIA_GPU_CACHE.value = false;
  }

  return NVIDIA_GPU_CACHE.value;
}

export async function hasNvidiaGpu() {
  return hasNvidiaGpuSync();
}

export function normalizeProvider(provider, machine = getCurrentMachineProfile()) {
  const value = String(provider || "")
    .trim()
    .toLowerCase();

  if (machine.platform === "win32" && value === "llamacpp") {
    return "ollama";
  }

  if (value === "mlx" || value === "vllm" || value === "llamacpp" || value === "ollama") {
    return value;
  }

  return getDefaultProvider(machine);
}

export function getCurrentMachineProfile() {
  return {
    platform: process.platform,
    arch: process.arch,
    hasNvidiaGpu: hasNvidiaGpuSync(),
    totalMemoryGb: Math.round((os.totalmem() / 1024 / 1024 / 1024) * 10) / 10,
  };
}

export function getDefaultProvider(machine = getCurrentMachineProfile()) {
  if (isAppleSiliconMac(machine)) {
    return "mlx";
  }

  if (machine.platform === "darwin") {
    return "llamacpp";
  }

  if (machine.platform === "win32") {
    return "ollama";
  }

  if (machine.platform === "linux" && machine.hasNvidiaGpu) {
    return "vllm";
  }

  return "llamacpp";
}

export async function detectRuntimeProvider() {
  return getDefaultProvider();
}

export function isProviderSupported(provider, machine = getCurrentMachineProfile()) {
  const normalized = normalizeProvider(provider, machine);

  if (normalized === "mlx") {
    return isAppleSiliconMac(machine);
  }

  if (normalized === "vllm") {
    return machine.platform === "linux" && machine.hasNvidiaGpu;
  }

  if (normalized === "ollama") {
    return machine.platform === "win32";
  }

  return true;
}

export function getProviderSupportError(provider, machine = getCurrentMachineProfile()) {
  const normalized = normalizeProvider(provider, machine);

  if (normalized === "mlx") {
    return "MLX is only supported on Apple Silicon macOS machines.";
  }

  if (normalized === "vllm") {
    return "vLLM is only supported here on Linux with an NVIDIA GPU.";
  }

  if (normalized === "ollama") {
    return "Ollama provider is enabled only on Windows in this build.";
  }

  return "";
}

export function defaultModelForProvider(provider, machine = getCurrentMachineProfile()) {
  const normalized = normalizeProvider(provider, machine);

  if (normalized === "mlx") {
    if (machine.totalMemoryGb >= 28) {
      return MODEL_PROFILES.mlx.balanced[0];
    }
    return MODEL_PROFILES.mlx.light[0];
  }

  if (normalized === "llamacpp") {
    if (machine.platform === "darwin" && !isAppleSiliconMac(machine)) {
      return MODEL_PROFILES.llamacpp.light[0];
    }
    if (machine.platform === "win32" && !machine.hasNvidiaGpu) {
      return MODEL_PROFILES.llamacpp.light[0];
    }
    return MODEL_PROFILES.llamacpp.balanced[0];
  }

  if (normalized === "ollama") {
    if (machine.totalMemoryGb >= 28) {
      return MODEL_PROFILES.ollama.balanced[0];
    }
    return MODEL_PROFILES.ollama.light[0];
  }

  return MODEL_PROFILES.vllm.balanced[0];
}

export function resolveModelList({ provider, models, modelProfile, currentDefaultModel, machine = getCurrentMachineProfile() }) {
  if (Array.isArray(models) && models.length > 0) {
    return uniqueStrings(models);
  }

  const normalized = normalizeProvider(provider, machine);
  const profileTable = MODEL_PROFILES[normalized] || MODEL_PROFILES.llamacpp;
  if (typeof modelProfile === "string" && profileTable[modelProfile]) {
    return [...profileTable[modelProfile]];
  }

  return uniqueStrings([defaultModelForProvider(normalized, machine), currentDefaultModel]);
}

export function mapModelIdForProvider(value, provider, machine = getCurrentMachineProfile()) {
  const model = String(value || "").trim();
  if (!model) {
    return model;
  }

  const resolvedProvider = normalizeProvider(provider, machine);
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
      return MODEL_PROFILES.llamacpp.light[0];
    }
    if (isMedium) {
      return MODEL_PROFILES.llamacpp.balanced[0];
    }
    return MODEL_PROFILES.llamacpp.heavy[0];
  }

  if (resolvedProvider === "mlx") {
    if (isSmall) {
      return MODEL_PROFILES.mlx.light[0];
    }
    if (isMedium) {
      return MODEL_PROFILES.mlx.balanced[0];
    }
    return MODEL_PROFILES.mlx.heavy[0];
  }

  if (resolvedProvider === "ollama") {
    if (isSmall) {
      return MODEL_PROFILES.ollama.light[0];
    }
    if (isMedium) {
      return MODEL_PROFILES.ollama.balanced[0];
    }
    return MODEL_PROFILES.ollama.heavy[0];
  }

  if (isSmall) {
    return MODEL_PROFILES.vllm.light[0];
  }
  if (isMedium) {
    return MODEL_PROFILES.vllm.balanced[0];
  }
  return MODEL_PROFILES.vllm.heavy[0];
}

export function normalizeBaseUrl(baseUrl) {
  const value = typeof baseUrl === "string" && baseUrl.trim() ? baseUrl.trim() : DEFAULT_BASE_URL;
  return value.replace(/\/+$/, "");
}

export function defaultBaseUrlForProvider(provider, machine = getCurrentMachineProfile()) {
  const normalized = normalizeProvider(provider, machine);
  if (normalized === "ollama") {
    return OLLAMA_BASE_URL;
  }
  return DEFAULT_BASE_URL;
}

export function parseHostPort(baseUrl) {
  try {
    const parsed = new URL(normalizeBaseUrl(baseUrl));
    return {
      hostname: parsed.hostname || "127.0.0.1",
      port: parsed.port ? Number(parsed.port) : 8000,
    };
  } catch {
    return { hostname: "127.0.0.1", port: 8000 };
  }
}

export function extractPythonPrefix(args) {
  const items = Array.isArray(args) ? args : [];
  const moduleIndex = items.indexOf("-m");
  if (moduleIndex > 0) {
    return items.slice(0, moduleIndex);
  }
  return [];
}

export function resolveLlamaCppModelFile(repoId) {
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

export function buildStartCommand({ provider, python, model, baseUrl, machine = getCurrentMachineProfile() }) {
  const normalized = normalizeProvider(provider, machine);
  const { hostname, port } = parseHostPort(baseUrl);

  if (normalized === "mlx") {
    return {
      command: python.command,
      args: [...python.prefix, "-m", "mlx_lm", "server", "--model", model, "--host", hostname, "--port", String(port)],
    };
  }

  if (normalized === "vllm") {
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

  if (normalized === "ollama") {
    return {
      command: "ollama",
      args: ["serve"],
    };
  }

  const modelFile = resolveLlamaCppModelFile(model);
  return {
    command: python.command,
    args: [
      ...python.prefix,
      "-m",
      "llama_cpp.server",
      ...(modelFile ? ["--model", modelFile] : []),
      "--hf_model_repo_id",
      model,
      ...(machine.platform === "win32" && machine.hasNvidiaGpu ? ["--n_gpu_layers", "-1"] : []),
      "--host",
      hostname,
      "--port",
      String(port),
      "--n_ctx",
      "4096",
    ],
  };
}

export function rewriteStartArgsForModel(start, provider, model, baseUrl, machine = getCurrentMachineProfile()) {
  const current = {
    command:
      typeof start?.command === "string" && start.command.trim() ? start.command.trim() : "",
    args: Array.isArray(start?.args) ? [...start.args.map((item) => String(item))] : [],
  };

  if (!model) {
    return current;
  }

  const prefix = extractPythonPrefix(current.args);
  const python = {
    command: current.command,
    prefix,
  };

  return buildStartCommand({
    provider,
    python,
    model,
    baseUrl,
    machine,
  });
}

export function getProviderReadinessEndpoints(provider, machine = getCurrentMachineProfile()) {
  const normalized = normalizeProvider(provider, machine);
  if (normalized === "ollama") {
    return ["/api/tags"];
  }
  if (normalized === "mlx" || normalized === "vllm") {
    return ["/health", "/v1/models"];
  }
  return ["/v1/models"];
}

export function buildWarmupRequest(provider, model, machine = getCurrentMachineProfile()) {
  const normalized = normalizeProvider(provider, machine);

  if (normalized === "ollama") {
    return {
      path: "/api/chat",
      body: {
        model,
        stream: false,
        options: {
          temperature: 0,
          num_predict: 8,
        },
        messages: [
          { role: "system", content: "Reply with plain text only." },
          { role: "user", content: "Say ok" },
        ],
      },
    };
  }

  return {
    path: "/v1/chat/completions",
    body: {
      model,
      stream: false,
      temperature: 0,
      max_tokens: 8,
      ...(normalized === "vllm" ? { max_completion_tokens: 8 } : {}),
      messages: [
        { role: "system", content: "Reply with plain text only." },
        { role: "user", content: "Say ok" },
      ],
    },
  };
}

export function uniqueStrings(values) {
  const seen = new Set();
  const output = [];

  for (const value of values) {
    const item = String(value || "").trim();
    if (!item || seen.has(item)) {
      continue;
    }
    seen.add(item);
    output.push(item);
  }

  return output;
}
