import process from "node:process";

const MCP_PROTOCOL_VERSION = "2024-11-05";
const TOOL_WEB_SEARCH = "web_search";

export async function runLocalWebSearchMcpServer() {
  let buffer = Buffer.alloc(0);

  process.stdin.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    buffer = drainFrames(buffer, handleMessage);
  });

  return new Promise((resolve) => {
    process.stdin.on("end", resolve);
    process.stdin.on("close", resolve);
  });
}

function drainFrames(buffer, onMessage) {
  let current = buffer;

  while (true) {
    const headerEnd = current.indexOf("\r\n\r\n");
    if (headerEnd === -1) {
      return current;
    }

    const header = current.subarray(0, headerEnd).toString("utf8");
    const contentLengthMatch = /content-length\s*:\s*(\d+)/i.exec(header);
    if (!contentLengthMatch) {
      current = current.subarray(headerEnd + 4);
      continue;
    }

    const contentLength = Number(contentLengthMatch[1]);
    const frameEnd = headerEnd + 4 + contentLength;
    if (current.length < frameEnd) {
      return current;
    }

    const payload = current.subarray(headerEnd + 4, frameEnd).toString("utf8");
    current = current.subarray(frameEnd);

    try {
      onMessage(JSON.parse(payload));
    } catch {
      // Ignore malformed frame payloads.
    }
  }
}

function handleMessage(message) {
  const method = message?.method;
  const id = message?.id;

  if (method === "initialize") {
    writeResult(id, {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: "lexis-local-web-mcp",
        version: "0.1.0",
      },
    });
    return;
  }

  if (method === "tools/list") {
    writeResult(id, {
      tools: [
        {
          name: TOOL_WEB_SEARCH,
          description: "Search the web without an API key",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string" },
              max_results: { type: "number" },
              maxResults: { type: "number" },
              limit: { type: "number" },
            },
            required: ["query"],
          },
        },
      ],
    });
    return;
  }

  if (method === "tools/call") {
    handleToolsCall(message).catch((error) => {
      writeError(id, -32000, error.message || "tool call failed");
    });
    return;
  }

  // Ignore notifications like notifications/initialized.
  if (id === undefined || id === null) {
    return;
  }

  writeError(id, -32601, `Method not found: ${method}`);
}

async function handleToolsCall(message) {
  const id = message?.id;
  const name = message?.params?.name;
  const args = message?.params?.arguments || {};

  if (name !== TOOL_WEB_SEARCH) {
    writeError(id, -32601, `Unknown tool: ${name}`);
    return;
  }

  const query = String(args.query || args.q || "").trim();
  if (!query) {
    writeError(id, -32602, "query is required");
    return;
  }

  const requestedLimit = Number(args.max_results ?? args.maxResults ?? args.limit ?? 5);
  const maxResults = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(10, Math.floor(requestedLimit)))
    : 5;

  const results = await searchWeb({ query, maxResults });

  writeResult(id, {
    structuredContent: {
      results,
    },
    content: [
      {
        type: "text",
        text: JSON.stringify({ results }),
      },
    ],
  });
}

async function searchWeb({ query, maxResults }) {
  const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=us-en`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    return [];
  }

  const html = await response.text();
  const anchorMatches = [...html.matchAll(/<a[^>]+class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  const snippetMatches = [
    ...html.matchAll(
      /<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>|<div[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
    ),
  ];

  const results = [];
  for (let index = 0; index < anchorMatches.length; index += 1) {
    const match = anchorMatches[index];
    const rawUrl = match[1] || "";
    const rawTitle = match[2] || "";
    const rawSnippet = snippetMatches[index]?.[1] || snippetMatches[index]?.[2] || "";

    const title = cleanText(rawTitle) || "Untitled";
    const resolvedUrl = normalizeResultUrl(rawUrl);
    const content = cleanText(rawSnippet);

    if (!resolvedUrl && !content) {
      continue;
    }

    results.push({
      title,
      url: resolvedUrl,
      content,
    });

    if (results.length >= maxResults) {
      break;
    }
  }

  return results;
}

function normalizeResultUrl(rawUrl) {
  if (!rawUrl) {
    return "";
  }

  const decoded = decodeHtmlEntities(rawUrl);

  try {
    const url = new URL(decoded, "https://duckduckgo.com");
    const redirected = url.searchParams.get("uddg");
    if (redirected) {
      return redirected;
    }
    return url.toString();
  } catch {
    return decoded;
  }
}

function cleanText(value) {
  const withoutTags = String(value || "").replace(/<[^>]+>/g, " ");
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

function writeResult(id, result) {
  if (id === undefined || id === null) {
    return;
  }

  writeFrame({
    jsonrpc: "2.0",
    id,
    result,
  });
}

function writeError(id, code, message) {
  if (id === undefined || id === null) {
    return;
  }

  writeFrame({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
    },
  });
}

function writeFrame(payload) {
  const body = JSON.stringify(payload);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}
