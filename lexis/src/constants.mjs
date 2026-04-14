export const RISK_LEVELS = ["low", "moderate", "high", "critical"];

export const RISK_SCORE = {
  low: 0,
  moderate: 1,
  high: 2,
  critical: 3,
};

export const DEFAULT_CONFIG = {
  model: "qwen2.5-coder:14b",
  ollamaBaseUrl: "http://localhost:11434",
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
    criticalReview: {
      enabled: true,
      model: "qwen3:14b",
    },
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
