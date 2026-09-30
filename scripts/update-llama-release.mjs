#!/usr/bin/env node
// Maintainer tool: bump the pinned llama.cpp release and refresh sha256s from
// the release's published asset digests.
// Usage: node scripts/update-llama-release.mjs [tag]   (default: latest)
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const targetFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../lexis/src/runtime/llama-release.mjs");

async function main() {
  const tag = process.argv[2];
  const releaseUrl = tag
    ? `https://api.github.com/repos/ggml-org/llama.cpp/releases/tags/${tag}`
    : "https://api.github.com/repos/ggml-org/llama.cpp/releases?per_page=1";
  const res = await fetch(releaseUrl, { headers: { "user-agent": "lexis-release-bumper" } });
  if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);
  const data = await res.json();
  const release = Array.isArray(data) ? data[0] : data;
  const newTag = release.tag_name;
  if (!newTag) throw new Error("Release response had no tag_name");

  const digests = new Map();
  for (const a of release.assets || []) {
    const digest = String(a.digest || "").replace(/^sha256:/, "");
    if (digest) digests.set(a.name, digest);
  }

  let src = await fs.readFile(targetFile, "utf8");
  src = src.replace(/export const LLAMA_CPP_TAG = "[^"]+"/, `export const LLAMA_CPP_TAG = "${newTag}"`);

  // Fill every `name: <template>, sha256: <x>` pair whose name resolves to a
  // real release asset at the new tag.
  const missing = [];
  src = src.replace(
    /name:\s*(`[^`]+`|"[^"]+")\s*,\s*sha256:\s*(null|"[0-9a-f]{64}")/g,
    (match, nameExpr) => {
      const name = nameExpr.slice(1, -1).replaceAll("${LLAMA_CPP_TAG}", newTag);
      const digest = digests.get(name);
      if (!digest) {
        missing.push(name);
        return match.replace(/sha256:\s*(null|"[0-9a-f]{64}")/, "sha256: null");
      }
      return match.replace(/sha256:\s*(null|"[0-9a-f]{64}")/, `sha256: "${digest}"`);
    }
  );

  await fs.writeFile(targetFile, src, "utf8");
  console.log(`Pinned llama.cpp to ${newTag}; filled sha256 for release assets.`);
  if (missing.length) {
    console.error("No matching asset found at this tag (sha256 left null — fix the name or drop the entry):");
    for (const n of missing) console.error(`  ${n}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
