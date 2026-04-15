export const RISK_LEVELS = ["low", "moderate", "high", "critical"];

export const RISK_SCORE = {
  low: 0,
  moderate: 1,
  high: 2,
  critical: 3,
};

const DEFAULT_MODEL_BY_PLATFORM =
  process.platform === "darwin"
    ? "mlx-community/Qwen2.5-Coder-7B-Instruct-4bit"
    : "bartowski/Qwen2.5-Coder-7B-Instruct-GGUF";

export const DEFAULT_CONFIG = {
  model: DEFAULT_MODEL_BY_PLATFORM,
  llm: {
    provider: process.platform === "darwin" ? "mlx" : process.platform === "win32" ? "llamacpp" : "llamacpp",
    baseUrl: "http://127.0.0.1:8000",
    apiKey: "",
    model: DEFAULT_MODEL_BY_PLATFORM,
    start: {
      command: "",
      args: [],
    },
  },
  webSearch: {
    enabled: true,
    provider: "mcp",
    mode: "auto",
    autoRetryBelowConfidence: 0.82,
    maxResults: 5,
    timeoutMs: 15000,
    mcp: {
      command: "lexis",
      args: ["mcp", "serve-web"],
      toolName: "web_search",
      env: {},
    },
  },
  execution: {
    riskMode: "model",
    hookMode: "auto",
    autoExecuteLowRisk: true,
    askConfirmationAt: "moderate",
  },
};

export const MARKERS = {
  shellStart: "# >>> lexis >>>",
  shellEnd: "# <<< lexis <<<",
  psStart: "# >>> lexis >>>",
  psEnd: "# <<< lexis <<<",
  fishStart: "# >>> lexis >>>",
  fishEnd: "# <<< lexis <<<",
};
