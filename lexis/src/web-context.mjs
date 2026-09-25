import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { cacheDir } from "./paths.mjs";
import { headBinary, isInstalled } from "./policy.mjs";

const CACHE_TTL_MS = 5 * 60 * 1000;
const NEGATIVE_TTL_MS = 60 * 1000;
const MAX_FETCHED_PAGE_CHARS = 1800;
const FETCH_TIMEOUT_MS = 15000;

export function shouldSearchWeb(prompt, plan) {
  const p = String(prompt || "");
  if (/\b(install|set ?up|upgrade|update|uninstall|download|get)\b/i.test(p)) return true;
  for (const c of plan?.commands || []) {
    const head = headBinary(c.command);
    if (head && !isInstalled(head)) return true;
  }
  return false;
}

export async function fetchWebContext({ query, config }) {
  if (!config?.enabled) {
    return [];
  }
  const provider = config.provider || "builtin";
  const maxResults = normalizeMaxResults(config.maxResults);
  const timeoutMs = normalizeTimeout(config.timeoutMs);

  const cached = await readCachedResults({ provider, query, maxResults });
  if (cached) {
    return cached;
  }

  let results = [];
  if (provider === "builtin") {
    results = await builtinSearch({ query, maxResults, timeoutMs });
  } else if (provider === "mcp") {
    const mod = await import("./mcp-web-search.mjs").catch(() => null);
    if (mod?.fetchWebContext) {
      results = await mod.fetchWebContext({ query, config });
    }
  }

  await writeCachedResults({ provider, query, maxResults, results });
  return results;
}

async function builtinSearch({ query, maxResults, timeoutMs }) {
  try {
    const results = await searchWeb({ query, maxResults, timeoutMs });
    const withContent = await Promise.all(
      results.slice(0, 1).map(async (item) => {
        if (item.content && item.content.length > 200) {
          return item;
        }
        const page = await fetchPageText(item.url, Math.min(timeoutMs, 8000));
        return page ? { ...item, content: `${item.content}\n${page}`.trim() } : item;
      })
    );
    return [...withContent, ...results.slice(1)];
  } catch {
    return [];
  }
}

async function searchWeb({ query, maxResults, timeoutMs }) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=us-en`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    return [];
  }

  const html = await response.text();
  const anchorMatches = [...html.matchAll(/<a[^>]+class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  if (!anchorMatches.length) {
    return searchLite({ query, maxResults, timeoutMs });
  }
  const snippetMatches = [
    ...html.matchAll(
      /<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>|<div[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
    ),
  ];

  const results = [];
  for (let index = 0; index < anchorMatches.length; index += 1) {
    const rawUrl = anchorMatches[index][1] || "";
    const rawTitle = anchorMatches[index][2] || "";
    const rawSnippet = snippetMatches[index]?.[1] || snippetMatches[index]?.[2] || "";

    const title = cleanText(rawTitle) || "Untitled";
    const resolvedUrl = normalizeResultUrl(rawUrl);
    const content = cleanText(rawSnippet);
    if (!resolvedUrl && !content) {
      continue;
    }
    results.push({ title, url: resolvedUrl, content });
    if (results.length >= maxResults) {
      break;
    }
  }
  return results;
}

async function searchLite({ query, maxResults, timeoutMs }) {
  try {
    const response = await fetch(`https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        accept: "text/html",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return [];
    return parseLiteHtml(await response.text(), maxResults);
  } catch {
    return [];
  }
}

export function parseLiteHtml(html, maxResults = 5) {
  const links = [...String(html).matchAll(/<a[^>]+class=["'][^"']*result-link[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const snippets = [...String(html).matchAll(/<td[^>]+class=["'][^"']*result-snippet[^"']*["'][^>]*>([\s\S]*?)<\/td>/gi)];
  const results = [];
  for (let i = 0; i < links.length && results.length < maxResults; i += 1) {
    const title = cleanText(links[i][2]) || "Untitled";
    const resolvedUrl = normalizeResultUrl(links[i][1]);
    const content = cleanText(snippets[i]?.[1] || "");
    if (!resolvedUrl && !content) continue;
    results.push({ title, url: resolvedUrl, content });
  }
  return results;
}

async function fetchPageText(url, timeoutMs) {
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    return "";
  }
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "user-agent": "Mozilla/5.0 (compatible; Lexis/0.2)", accept: "text/html,*/*" },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
    });
    if (!response.ok) {
      return "";
    }
    const html = await response.text();
    return cleanText(html).slice(0, MAX_FETCHED_PAGE_CHARS);
  } catch {
    return "";
  }
}

async function readCachedResults({ provider, query, maxResults }) {
  const filePath = getCacheFilePath({ provider, query, maxResults });
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const payload = JSON.parse(raw);
    if (!Array.isArray(payload?.results) || typeof payload?.timestamp !== "number") {
      return null;
    }
    const ttl = payload.results.length === 0 ? NEGATIVE_TTL_MS : CACHE_TTL_MS;
    if (Date.now() - payload.timestamp > ttl) {
      return null;
    }
    return payload.results;
  } catch {
    return null;
  }
}

async function writeCachedResults({ provider, query, maxResults, results }) {
  if (!Array.isArray(results)) {
    return;
  }
  try {
    const filePath = getCacheFilePath({ provider, query, maxResults });
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ timestamp: Date.now(), results }), "utf8");
  } catch {}
}

function getCacheFilePath({ provider, query, maxResults }) {
  const hash = crypto.createHash("sha1").update(`${provider}:${maxResults}:${query}`).digest("hex");
  return path.join(cacheDir(), "web-search", `${hash}.json`);
}

function normalizeResultUrl(rawUrl) {
  if (!rawUrl) return "";
  const decoded = decodeHtmlEntities(rawUrl);
  try {
    const url = new URL(decoded, "https://duckduckgo.com");
    const redirected = url.searchParams.get("uddg");
    if (redirected) return redirected;
    return url.toString();
  } catch {
    return decoded;
  }
}

function cleanText(value) {
  const withoutTags = String(value || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  return decodeHtmlEntities(withoutTags).replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value) {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeMaxResults(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(1, Math.min(10, Math.floor(n))) : 5;
}

function normalizeTimeout(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1000 ? Math.min(n, 120000) : FETCH_TIMEOUT_MS;
}
