import fs from "node:fs/promises";
import path from "node:path";
import { auditLogPath } from "./paths.mjs";

const REDACT_RE = /(--?\w*(token|secret|password|passwd|key|auth)[\w-]*)(=|\s+)\S+|(Bearer|Basic)\s+\S+|\b[A-Z0-9_]*(KEY|TOKEN|SECRET|PASSWORD)=\S+/gi;

export function redact(value) {
  return String(value || "").replace(REDACT_RE, (m) => m.replace(/[^=\s]*$/, "***"));
}

export async function appendAuditEvent(event, { maxEvents = 500 } = {}) {
  try {
    const file = auditLogPath();
    await fs.mkdir(path.dirname(file), { recursive: true });
    const payload = { ts: new Date().toISOString(), ...redactDeep(event) };
    await fs.appendFile(file, JSON.stringify(payload) + "\n", "utf8");
    trimLog(file, maxEvents).catch(() => {});
  } catch {}
}

async function trimLog(file, maxEvents) {
  const raw = await fs.readFile(file, "utf8");
  const lines = raw.trim().split("\n");
  if (lines.length <= maxEvents) return;
  await fs.writeFile(file, lines.slice(-maxEvents).join("\n") + "\n", "utf8");
}

function redactDeep(value) {
  if (typeof value === "string") return redact(value);
  if (Array.isArray(value)) return value.map(redactDeep);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = redactDeep(v);
    return out;
  }
  return value;
}

export async function readAuditEvents({ limit = 50 } = {}) {
  try {
    const raw = await fs.readFile(auditLogPath(), "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    const events = lines.slice(-limit).map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { ts: "", type: "unparseable", raw: line.slice(0, 200) };
      }
    });
    return events;
  } catch {
    return [];
  }
}
