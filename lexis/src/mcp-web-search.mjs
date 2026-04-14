import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import process from "node:process";

const MCP_PROTOCOL_VERSION = "2024-11-05";
const DEFAULT_TOOL_CANDIDATES = ["web_search", "search_web", "search"];
const MAX_FETCHED_PAGE_CHARS = 1800;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchWebContext({ query, config }) {
  if (!config?.enabled) {
    return [];
  }

  const provider = config.provider || "mcp";
  const maxResults = normalizeMaxResults(config.maxResults);
  const timeoutMs = normalizeTimeout(config.timeoutMs);

  if (provider === "mcp") {
    const cached = await readCachedResults({ query, maxResults });
    if (cached) {
      return cached;
    }

    const results = await fetchFromMcp({
      query,
      maxResults,
      timeoutMs,
      mcpConfig: config.mcp || {},
    });

    await writeCachedResults({ query, maxResults, results });
    return results;
  }

  return [];
}

async function readCachedResults({ query, maxResults }) {
  const filePath = getCacheFilePath({ query, maxResults });
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const payload = JSON.parse(raw);
    if (!payload || typeof payload !== "object") {
      return null;
    }
    if (!Array.isArray(payload.results) || typeof payload.timestamp !== "number") {
      return null;
    }
    if (Date.now() - payload.timestamp > CACHE_TTL_MS) {
      return null;
    }
    return payload.results;
  } catch {
    return null;
  }
}

async function writeCachedResults({ query, maxResults, results }) {
  if (!Array.isArray(results) || results.length === 0) {
    return;
  }

  const filePath = getCacheFilePath({ query, maxResults });
  const payload = {
    timestamp: Date.now(),
    results,
  };

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(payload), "utf8");
  } catch {
    // Ignore cache write errors.
  }
}

function getCacheFilePath({ query, maxResults }) {
  const hash = crypto
    .createHash("sha1")
    .update(`mcp:${maxResults}:${query}`)
    .digest("hex");

  return path.join(os.homedir(), ".cache", "lexis", "web-search", `${hash}.json`);
}

async function fetchFromMcp({ query, maxResults, timeoutMs, mcpConfig }) {
  let command = typeof mcpConfig.command === "string" ? mcpConfig.command.trim() : "";
  let args = Array.isArray(mcpConfig.args)
    ? mcpConfig.args.filter((value) => typeof value === "string" && value.length > 0)
    : [];

  if (!command) {
    if (typeof process.argv[1] === "string" && process.argv[1].length > 0) {
      command = process.execPath;
      args = [process.argv[1], "mcp", "serve-web"];
    } else {
      command = "lexis";
    }
  }

  if (command === "lexis" && args.length === 0) {
    args = ["mcp", "serve-web"];
  }

  if (command === "lexis" && typeof process.argv[1] === "string" && process.argv[1].length > 0) {
    command = process.execPath;
    args = [process.argv[1], ...args];
  }

  const env = buildMcpEnv(mcpConfig.env);
  const preferredTool = typeof mcpConfig.toolName === "string" ? mcpConfig.toolName.trim() : "";
  const client = new McpStdioClient({ command, args, env, timeoutMs });

  try {
    await client.connect();
    await client.initialize();

    const tools = await client.listTools();
    const toolName = pickSearchTool(tools, preferredTool);

    if (!toolName) {
      return [];
    }

    const callResult = await callSearchTool({ client, toolName, query, maxResults });
    const normalized = normalizeMcpResults(callResult, maxResults);
    return enrichTopResultWithFetchedContent({
      results: normalized,
      timeoutMs,
    });
  } catch {
    return [];
  } finally {
    await client.close();
  }
}

async function enrichTopResultWithFetchedContent({ results, timeoutMs }) {
  if (!Array.isArray(results) || results.length === 0) {
    return [];
  }

  const enriched = [...results];
  for (const item of enriched) {
    if (!item?.url || !/^https?:\/\//i.test(item.url)) {
      continue;
    }

    const pageText = await fetchPageText({
      url: item.url,
      timeoutMs,
    });

    if (!pageText) {
      continue;
    }

    const existing = typeof item.content === "string" ? item.content.trim() : "";
    item.content = existing
      ? `${existing}\n\nFetched page excerpt:\n${pageText}`
      : `Fetched page excerpt:\n${pageText}`;
    break;
  }

  return enriched;
}

async function fetchPageText({ url, timeoutMs }) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        accept: "text/html, text/plain, application/xhtml+xml",
      },
      signal: AbortSignal.timeout(Math.min(timeoutMs, 12000)),
    });

    if (!response.ok) {
      return "";
    }

    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("text/plain") && !contentType.includes("application/xhtml+xml")) {
      return "";
    }

    const body = await response.text();
    const cleaned = extractText(body);
    const commandSnippets = extractCommandSnippets(body);
    if (!cleaned) {
      return "";
    }

    const snippetsBlock =
      commandSnippets.length > 0
        ? `\n\nCommand snippets:\n${commandSnippets.map((snippet) => `- ${snippet}`).join("\n")}`
        : "";

    return `${cleaned.slice(0, MAX_FETCHED_PAGE_CHARS)}${snippetsBlock}`;
  } catch {
    return "";
  }
}

function extractText(body) {
  const asString = String(body || "");
  const noScript = asString
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ");

  const withoutTags = noScript.replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(withoutTags);
  return decoded.replace(/\s+/g, " ").trim();
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

function extractCommandSnippets(html) {
  const snippets = new Set();
  const pattern = /<(pre|code)[^>]*>([\s\S]*?)<\/\1>/gi;
  const matches = [...String(html || "").matchAll(pattern)];

  for (const match of matches) {
    const block = cleanText(match[2] || "");
    if (!block) {
      continue;
    }

    const lines = block
      .split(/\s{2,}|\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      if (!looksLikeExecutableSnippet(line)) {
        continue;
      }
      snippets.add(line.slice(0, 220));
      if (snippets.size >= 6) {
        return [...snippets];
      }
    }
  }

  return [...snippets];
}

function looksLikeExecutableSnippet(line) {
  const text = String(line || "").trim();
  if (!text || text.length > 220) {
    return false;
  }

  const normalized = text.replace(/^[$>#]\s*/, "").trim();
  if (!normalized) {
    return false;
  }

  if (/[<>]/.test(normalized) || /[.?!]\s*$/.test(normalized)) {
    return false;
  }

  const firstToken = normalized.split(/\s+/)[0] || "";
  if (!/^[a-zA-Z0-9._\/-]+$/.test(firstToken)) {
    return false;
  }

  return /\s/.test(normalized) || /\//.test(firstToken);
}

function buildMcpEnv(extraEnv) {
  const safeEnv = {};
  if (extraEnv && typeof extraEnv === "object" && !Array.isArray(extraEnv)) {
    for (const [key, value] of Object.entries(extraEnv)) {
      if (typeof value === "string") {
        safeEnv[key] = value;
      }
    }
  }
  return { ...process.env, ...safeEnv };
}

async function callSearchTool({ client, toolName, query, maxResults }) {
  const attempts = [
    { query, max_results: maxResults },
    { query, maxResults },
    { q: query, limit: maxResults },
    { query },
  ];

  let lastError;
  for (const args of attempts) {
    try {
      return await client.callTool(toolName, args);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("MCP web search failed");
}

function pickSearchTool(tools, preferredTool) {
  if (!Array.isArray(tools) || tools.length === 0) {
    return "";
  }

  if (preferredTool && tools.some((tool) => tool.name === preferredTool)) {
    return preferredTool;
  }

  for (const candidate of DEFAULT_TOOL_CANDIDATES) {
    if (tools.some((tool) => tool.name === candidate)) {
      return candidate;
    }
  }

  const byHeuristic = tools.find((tool) => /search|web/i.test(tool.name));
  return byHeuristic?.name || "";
}

function normalizeMcpResults(toolResult, maxResults) {
  const candidates = [];

  collectResultCandidates(toolResult, candidates);
  const normalized = [];

  for (const item of candidates) {
    const normalizedItem = normalizeSearchItem(item);
    if (!normalizedItem) {
      continue;
    }
    normalized.push(normalizedItem);
    if (normalized.length >= maxResults) {
      break;
    }
  }

  return normalized;
}

function collectResultCandidates(value, output) {
  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectResultCandidates(item, output);
    }
    return;
  }

  if (typeof value === "string") {
    const parsed = safeParseJson(value);
    if (parsed) {
      collectResultCandidates(parsed, output);
      return;
    }

    output.push({ title: "MCP Search Result", url: "", content: value });
    return;
  }

  if (typeof value !== "object") {
    return;
  }

  if (Array.isArray(value.results)) {
    collectResultCandidates(value.results, output);
    return;
  }

  if (Array.isArray(value.items)) {
    collectResultCandidates(value.items, output);
    return;
  }

  if (Array.isArray(value.content)) {
    for (const item of value.content) {
      if (item && typeof item === "object" && typeof item.text === "string") {
        collectResultCandidates(item.text, output);
      } else {
        collectResultCandidates(item, output);
      }
    }
    return;
  }

  if (value.structuredContent) {
    collectResultCandidates(value.structuredContent, output);
    return;
  }

  output.push(value);
}

function normalizeSearchItem(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const title = pickFirstString(item.title, item.name, item.heading, "Untitled");
  const url = pickFirstString(item.url, item.link, item.source, "");
  const content = pickFirstString(item.content, item.snippet, item.description, item.text, "");

  if (!title && !url && !content) {
    return null;
  }

  return { title, url, content };
}

function pickFirstString(...values) {
  for (const value of values) {
    if (typeof value === "string") {
      return value;
    }
  }
  return "";
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeMaxResults(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return 5;
  }
  return Math.min(Math.floor(number), 10);
}

function normalizeTimeout(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return 15000;
  }
  return Math.min(Math.floor(number), 120000);
}

class McpStdioClient {
  constructor({ command, args, env, timeoutMs }) {
    this.command = command;
    this.args = args;
    this.env = env;
    this.timeoutMs = timeoutMs;
    this.child = null;
    this.buffer = Buffer.alloc(0);
    this.pending = new Map();
    this.nextId = 1;
  }

  async connect() {
    if (this.child) {
      return;
    }

    this.child = spawn(this.command, this.args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: this.env,
    });

    this.child.stdout.on("data", (chunk) => this.handleStdout(chunk));
    this.child.stderr.on("data", () => {});
    this.child.on("exit", () => {
      const error = new Error("MCP server exited");
      this.rejectAll(error);
      this.child = null;
    });
    this.child.on("error", (error) => {
      this.rejectAll(error);
    });
  }

  async close() {
    if (!this.child) {
      return;
    }

    try {
      this.child.stdin.end();
    } catch {}

    const child = this.child;
    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        try {
          child.kill("SIGKILL");
        } catch {}
        resolve();
      }, 750);

      child.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  async initialize() {
    await this.request("initialize", {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: {
        name: "@hridyacodes/lexis",
        version: "0.1.0",
      },
    });

    this.notify("notifications/initialized", {});
  }

  async listTools() {
    const response = await this.request("tools/list", {});
    return Array.isArray(response?.tools) ? response.tools : [];
  }

  async callTool(name, args) {
    return this.request("tools/call", {
      name,
      arguments: args,
    });
  }

  notify(method, params) {
    this.writeFrame({ jsonrpc: "2.0", method, params });
  }

  request(method, params) {
    const id = this.nextId;
    this.nextId += 1;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`MCP request timed out (${method})`));
      }, this.timeoutMs);

      this.pending.set(id, {
        resolve,
        reject,
        timeout,
      });

      this.writeFrame({
        jsonrpc: "2.0",
        id,
        method,
        params,
      });
    });
  }

  writeFrame(payload) {
    if (!this.child?.stdin) {
      throw new Error("MCP server is not connected");
    }

    const body = JSON.stringify(payload);
    const frame = `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`;
    this.child.stdin.write(frame);
  }

  handleStdout(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
      const headerEnd = this.buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) {
        return;
      }

      const header = this.buffer.subarray(0, headerEnd).toString("utf8");
      const lengthMatch = /content-length\s*:\s*(\d+)/i.exec(header);
      if (!lengthMatch) {
        this.buffer = this.buffer.subarray(headerEnd + 4);
        continue;
      }

      const contentLength = Number(lengthMatch[1]);
      const frameEnd = headerEnd + 4 + contentLength;
      if (this.buffer.length < frameEnd) {
        return;
      }

      const payload = this.buffer.subarray(headerEnd + 4, frameEnd).toString("utf8");
      this.buffer = this.buffer.subarray(frameEnd);
      this.handleMessage(payload);
    }
  }

  handleMessage(payload) {
    let message;
    try {
      message = JSON.parse(payload);
    } catch {
      return;
    }

    if (typeof message?.id !== "number") {
      return;
    }

    const entry = this.pending.get(message.id);
    if (!entry) {
      return;
    }

    this.pending.delete(message.id);
    clearTimeout(entry.timeout);

    if (message.error) {
      entry.reject(new Error(message.error.message || "MCP error"));
      return;
    }

    entry.resolve(message.result);
  }

  rejectAll(error) {
    for (const [id, entry] of this.pending.entries()) {
      this.pending.delete(id);
      clearTimeout(entry.timeout);
      entry.reject(error);
    }
  }
}
