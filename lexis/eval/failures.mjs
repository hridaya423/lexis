#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const tag = process.argv[2];
if (!tag) {
  console.error("usage: failures.mjs <tag-prefix> [samples-per-domain]");
  process.exit(2);
}
const samples = Number(process.argv[3] || 3);
const dir = path.join(root, "reports");
const latest = new Map();
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f.includes(`-${tag}-`))) {
  const r = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (!latest.has(r.tag) || latest.get(r.tag).ts < r.ts) latest.set(r.tag, r);
}
const cases = new Map();
for (const ds of ["holdout", "core", "wide"]) {
  const file = path.join(root, "datasets", `${ds}.jsonl`);
  for (const l of fs.readFileSync(file, "utf8").split("\n").filter(Boolean)) {
    const c = JSON.parse(l);
    cases.set(`${ds}:${c.id}`, c);
  }
}
const why = (x) => (x.error ? "error" : Object.entries(x.checks || {}).find(([k, v]) => k !== "execDetail" && !v)?.[0] || "other");
for (const [t, r] of [...latest].sort()) {
  const ds = r.dataset.name.replace(".jsonl", "");
  const groups = new Map();
  for (const x of r.results) {
    const c = cases.get(`${ds}:${x.id}`) || {};
    const k = c.domain || "-";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push({ ...x, gold: c.gold });
  }
  const reasons = {};
  for (const x of r.results.filter((x) => !x.pass)) reasons[why(x)] = (reasons[why(x)] || 0) + 1;
  console.log(`\n## ${t}: ${r.passed}/${r.total} (${Math.round(r.passRate * 100)}%) fail reasons ${JSON.stringify(reasons)}`);
  for (const [k, xs] of [...groups].sort((a, b) => a[1].filter((x) => x.pass).length / a[1].length - b[1].filter((x) => x.pass).length / b[1].length)) {
    const p = xs.filter((x) => x.pass).length;
    console.log(`  ${String(Math.round((p / xs.length) * 100)).padStart(3)}% ${p}/${xs.length}  ${k}`);
    for (const x of xs.filter((x) => !x.pass).slice(0, samples)) {
      console.log(`       ✗ ${x.intent}\n         got:  ${(x.commands || [])[0] || `(${x.error})`}${x.gold ? `\n         gold: ${x.gold}` : ""}`);
    }
  }
}
