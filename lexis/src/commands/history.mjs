import { readAuditEvents } from "../audit.mjs";

export async function historyCommand(args) {
  const json = args.includes("--json");
  const limitIdx = args.findIndex((a) => a === "--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) || 50 : 50;
  const events = await readAuditEvents({ limit });
  if (json) {
    process.stdout.write(JSON.stringify(events, null, 2) + "\n");
    return;
  }
  for (const e of events) {
    const when = e.ts ? new Date(e.ts).toLocaleString() : "";
    if (e.type === "execute") {
      const cmds = (e.commands || []).map((c) => c.command || c).join(" ; ");
      process.stdout.write(`${when}  run      ${e.prompt || ""}\n           └ ${cmds}\n`);
    } else if (e.type === "command_result") {
      process.stdout.write(`${when}  result   ${e.command || ""} → exit ${e.exitCode} (${e.durationMs}ms)\n`);
    } else if (e.type === "retry") {
      process.stdout.write(`${when}  retry    ${e.prompt || ""}${e.failedCommand ? ` — ${e.failedCommand}` : ""}${e.head ? ` — ${e.head} not installed` : ""}\n`);
    } else if (e.type === "declined") {
      process.stdout.write(`${when}  declined ${e.prompt || ""}\n`);
    } else if (e.type === "plan_error") {
      process.stdout.write(`${when}  error    ${e.prompt || ""} — ${e.error || ""}\n`);
    } else {
      process.stdout.write(`${when}  ${e.type || "event"}    ${e.prompt || e.command || JSON.stringify(e).slice(0, 120)}\n`);
    }
  }
}
