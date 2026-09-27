import { loadConfig } from "../config.mjs";
import { fetchWebContext } from "../web-context.mjs";

export async function webSearchCommand(args) {
  const query = args.filter((a) => !a.startsWith("--")).join(" ").trim();
  if (!query) {
    throw new Error("Usage: lx web-search <query>");
  }
  const config = await loadConfig();
  const results = await fetchWebContext({ query, config: { ...config.webSearch, enabled: true } });
  if (!results.length) {
    process.stdout.write("No results (offline, blocked, or provider misconfigured).\n");
    return;
  }
  for (const [i, r] of results.entries()) {
    process.stdout.write(`${i + 1}. ${r.title}\n   ${r.url}\n   ${String(r.content || "").slice(0, 200)}\n\n`);
  }
}
