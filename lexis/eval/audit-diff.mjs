#!/usr/bin/env node
// Sample changed verdicts for manual audit: stored-fail -> rescored-pass ("new")
// and still-failing ("fail"), using <report>.rescored.json files.
//   node eval/audit-diff.mjs [new|fail] [--n 100] [tag-prefix...]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "reports");
const argv = process.argv.slice(2);
const mode = argv[0] === "fail" ? "fail" : "new";
const n = Number(argv[argv.indexOf("--n") + 1]) || 100;
const prefixes = argv.slice(mode === argv[0] ? 1 : 0).filter((a) => !a.startsWith("--") && a !== String(n));
const DS = /-(core|wide|holdout_a|holdout_b|holdout|testx)-(darwin|linux|windows)$/;

const latest = new Map();
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".rescored.json")) continue;
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const tag = d.tag || "";
  if (!DS.test(tag) || (prefixes.length && !prefixes.some((p) => tag.startsWith(p)))) continue;
  const ts = Date.parse(d.ts || 0);
  if (!latest.has(tag) || latest.get(tag).ts < ts) latest.set(tag, { ts, d });
}

const changed = [], failing = [];
for (const { d } of latest.values()) {
  const orig = new Map((d.results || []).map((r) => [r.id, r]));
  // stored pass is only in the original report; rescored overwrote r.pass — keep both via storedPass field if present
  for (const r of d.results || []) {
    const was = r.storedPass ?? r.pass; // rescore.mjs writes pass=new; fall back to new
    if (!was && r.pass) changed.push({ tag: d.tag, r });
    if (!r.pass) failing.push({ tag: d.tag, r });
  }
}
const pick = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
};
const show = mode === "new" ? changed : failing;
console.log(`total ${mode}: ${show.length}`);
for (const { tag, r } of pick(show)) {
  console.log(`\n${tag} ${r.id}${r.error ? ` [${r.error.slice(0, 60)}]` : ""}`);
  console.log(`  intent: ${r.intent}`);
  console.log(`  answer: ${(r.commands || []).join(" ; ").slice(0, 200)}`);
  const bad = Object.entries(r.checks || {}).filter(([k, v]) => v === false && k !== "execDetail").map(([k]) => k);
  if (bad.length) console.log(`  failed: ${bad.join(", ")}`);
  if (r.checks?.execDetail) console.log(`  exec: ${String(r.checks.execDetail).slice(0, 100)}`);
}
