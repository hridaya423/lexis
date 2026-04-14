import { RISK_LEVELS, RISK_SCORE } from "./constants.mjs";

export function shouldRequireConfirmation({ risk, confidence, configuredThreshold }) {
  if (confidence < 0.75) {
    return true;
  }

  const threshold = RISK_LEVELS.includes(configuredThreshold) ? configuredThreshold : "moderate";
  return RISK_SCORE[risk] >= RISK_SCORE[threshold];
}

export function isCriticalRisk(risk) {
  return risk === "critical";
}
