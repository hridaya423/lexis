import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isWin = process.platform === "win32";

export function packageRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

export function configDir() {
  if (isWin) {
    const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, "lexis");
  }
  const xdg = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  return path.join(xdg, "lexis");
}

export function dataDir() {
  if (isWin) {
    const localAppData =
      process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
    return path.join(localAppData, "Lexis");
  }
  const xdg = process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share");
  return path.join(xdg, "lexis");
}

export function cacheDir() {
  if (isWin) {
    return path.join(dataDir(), "cache");
  }
  const xdg = process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache");
  return path.join(xdg, "lexis");
}

export function configPath() {
  return path.join(configDir(), "config.json");
}

export function manifestPath() {
  return path.join(configDir(), "manifest.json");
}

export function auditLogPath() {
  return path.join(dataDir(), "audit.log.jsonl");
}

export function modelHistoryPath() {
  return path.join(configDir(), "model-history.json");
}

export function runtimeDir() {
  return path.join(dataDir(), "runtime");
}

export function runtimeStatePath() {
  return path.join(runtimeDir(), "state.json");
}

export function runtimeLogPath() {
  return path.join(runtimeDir(), "llama-server.log");
}

export function modelsDir() {
  return path.join(dataDir(), "models");
}

export function appleHelperPath() {
  if (typeof process.env.LEXIS_APPLE_FM_BIN === "string" && process.env.LEXIS_APPLE_FM_BIN.trim()) {
    return process.env.LEXIS_APPLE_FM_BIN.trim();
  }
  return path.join(packageRoot(), "bin", "darwin-arm64", "lexis-apple-fm");
}

export function snippetsDir() {
  return path.join(packageRoot(), "src", "shell", "snippets");
}

export function legacyVenvDir() {
  return path.join(dataDir(), "runtime-venv");
}
