import { defaultModelForProvider, getDefaultProvider } from "./providers.mjs";

export const RISK_LEVELS = ["low", "moderate", "high", "critical"];

export const RISK_SCORE = {
  low: 0,
  moderate: 1,
  high: 2,
  critical: 3,
};

const DEFAULT_PROVIDER = getDefaultProvider();
const DEFAULT_MODEL_BY_PLATFORM = defaultModelForProvider(DEFAULT_PROVIDER);

export const DEFAULT_CONFIG = {
  model: DEFAULT_MODEL_BY_PLATFORM,
  llm: {
    provider: DEFAULT_PROVIDER,
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
