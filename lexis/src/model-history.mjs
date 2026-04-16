import fs from "node:fs/promises";
import path from "node:path";
import { getConfigPath } from "./config.mjs";
import { uniqueStrings } from "./providers.mjs";

export function getModelHistoryPath() {
  return path.join(path.dirname(getConfigPath()), "model-history.json");
}

export async function loadModelHistory() {
  const filePath = getModelHistoryPath();

  try {
    const raw = JSON.parse(await fs.readFile(filePath, "utf8"));
    return {
      models: uniqueStrings(Array.isArray(raw?.models) ? raw.models : []),
      providers: uniqueStrings(Array.isArray(raw?.providers) ? raw.providers : []),
    };
  } catch {
    return { models: [], providers: [] };
  }
}

export async function recordModelUsage({ provider, models }) {
  const filePath = getModelHistoryPath();
  const current = await loadModelHistory();
  const next = {
    models: uniqueStrings([...current.models, ...(Array.isArray(models) ? models : [])]),
    providers: uniqueStrings([...current.providers, provider]),
  };

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf8");
  return filePath;
}
