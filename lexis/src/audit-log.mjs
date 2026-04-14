import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export async function appendAuditEvent(event) {
  const filePath = getAuditLogPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const payload = {
    timestamp: new Date().toISOString(),
    ...event,
  };
  await fs.appendFile(filePath, JSON.stringify(payload) + "\n", "utf8");
}

export function getAuditLogPath() {
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, "lexis", "audit.log.jsonl");
  }
  return path.join(os.homedir(), ".local", "share", "lexis", "audit.log.jsonl");
}
