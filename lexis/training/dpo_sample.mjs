#!/usr/bin/env node
// Sample v5 (or any GGUF served by a local llama-server) over the DPO prompt set.
// Per prompt: 1 greedy (temp 0) + 4 samples (temp 0.9, top_p 0.95, distinct seeds),
// using the production single-line grammar and eval's max_tokens (80).
// Resumable: ids already present in the output file are skipped.
//
//   node training/dpo_sample.mjs [--in ~/lx-data/dpo/prompts.jsonl]
//       [--out ~/lx-data/dpo/samples.jsonl] [--port 8391] [--conc 8] [--limit N]

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { PLAIN_GRAMMAR_UNIX, PLAIN_GRAMMAR_PWSH } from "../src/planner.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) =>
  a.startsWith("--") ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true] : [a, true]));
const IN = args.in || path.join(os.homedir(), "lx-data/dpo/prompts.jsonl");
const OUT = args.out || path.join(os.homedir(), "lx-data/dpo/samples.jsonl");
const PORT = Number(args.port || 8391);
const CONC = Number(args.conc || 8);
const LIMIT = Number(args.limit || 0);
const SHARD = args.shard ? String(args.shard).split(":").map(Number) : [0, 1]; // "k:n" → rows where idx % n === k
const MAX_TOKENS = 80; // eval/run.mjs plain path
const N_SAMPLES = 4;
const SAMPLE_SEED_BASE = 91000;

const clean = (t) => String(t || "").trim();

async function chat(messages, { temperature, top_p, seed, grammar }) {
  const body = {
    model: "lexis",
    stream: false,
    temperature,
    max_tokens: MAX_TOKENS,
    messages,
    grammar,
    ...(top_p != null ? { top_p } : {}),
    ...(seed != null ? { seed } : {}),
  };
  const res = await fetch(`http://127.0.0.1:${PORT}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(120000),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`llama-server ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const payload = await res.json();
  return clean(payload?.choices?.[0]?.message?.content || "");
}

async function main() {
  const prompts = fs.readFileSync(IN, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const done = new Set();
  if (fs.existsSync(OUT)) {
    for (const l of fs.readFileSync(OUT, "utf8").split("\n")) {
      if (!l.trim()) continue;
      try { done.add(JSON.parse(l).id); } catch {}
    }
  }
  const todo = prompts.filter((p, i) => !done.has(p.id) && i % SHARD[1] === SHARD[0]);
  const work = LIMIT ? todo.slice(0, LIMIT) : todo;
  console.error(`prompts=${prompts.length} done=${done.size} todo=${work.length}`);

  const out = fs.createWriteStream(OUT, { flags: "a" });

  let finished = 0;
  let failed = 0;
  const started = Date.now();
  const queue = [...work];

  async function worker() {
    while (queue.length) {
      const p = queue.shift();
      const messages = p.messages.slice(0, 2); // system + user only, never the gold
      const grammar = /powershell/i.test(messages[0]?.content || "") ? PLAIN_GRAMMAR_PWSH : PLAIN_GRAMMAR_UNIX;
      try {
        const greedy = await chat(messages, { temperature: 0, grammar });
        const samples = [];
        for (let s = 0; s < N_SAMPLES; s += 1) {
          samples.push(await chat(messages, { temperature: 0.9, top_p: 0.95, seed: SAMPLE_SEED_BASE + s, grammar }));
        }
        out.write(JSON.stringify({ id: p.id, greedy, samples }) + "\n");
      } catch (e) {
        failed += 1;
        out.write(JSON.stringify({ id: p.id, error: String(e.message || e).slice(0, 200), greedy: "", samples: [] }) + "\n");
      }
      finished += 1;
      if (finished % 100 === 0) {
        const el = (Date.now() - started) / 1000;
        console.error(`${finished}/${work.length} (${(finished / el).toFixed(1)}/s, fail=${failed})`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  await new Promise((res) => out.end(res));
  const el = (Date.now() - started) / 1000;
  console.error(`DONE ${finished} rows in ${el.toFixed(0)}s (${(finished / el).toFixed(2)}/s, fail=${failed})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
