import fs from "node:fs/promises";
import path from "node:path";
import { packageRoot } from "./paths.mjs";
import { getPackageManagers } from "./machine.mjs";

let cachedPrompt = null;

export async function loadSystemPrompt() {
  if (!cachedPrompt) {
    cachedPrompt = await fs.readFile(path.join(packageRoot(), "prompts", "system-prompt.txt"), "utf8");
  }
  return cachedPrompt;
}

const MAX_WEB_ITEMS_FOR_PROMPT = 1;
const MAX_WEB_CHARS = 1400;
const MAX_WEB_CHARS_APPLE = 800;

export function buildUserPrompt({ userPrompt, context, webContext, providerId }) {
  const pkgManagers = getPackageManagers();
  const parts = [
    `User intent: ${userPrompt}`,
    "",
    "Execution context:",
    `- platform: ${context.platform}`,
    `- os: ${context.os || ""}`,
    `- shell: ${context.shell}`,
    `- cwd: ${context.cwd}`,
    `- package managers: ${pkgManagers.length ? pkgManagers.join(", ") : "unknown"}`,
  ];

  if (webContext && webContext.length > 0) {
    const limit = providerId === "apple-fm" ? MAX_WEB_CHARS_APPLE : MAX_WEB_CHARS;
    parts.push("", "Web context:");
    for (const item of webContext.slice(0, MAX_WEB_ITEMS_FOR_PROMPT)) {
      parts.push(`- ${item.title} (${item.url})`);
      const content = String(item.content || "").slice(0, limit);
      if (content.trim()) parts.push(`  ${content}`);
    }
    const urls = webContext.slice(0, MAX_WEB_ITEMS_FOR_PROMPT).map((i) => i.url).filter(Boolean);
    if (urls.length) {
      parts.push("", "Allowed URLs (use exactly if you output URLs):");
      for (const url of urls) parts.push(`- ${url}`);
    }
  }

  return parts.join("\n");
}
