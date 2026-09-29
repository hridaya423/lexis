#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};
const tag = arg("--tag", "");
const dir = path.resolve(arg("--dir", path.join(here, "reports")));

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
if (!files.length) {
  console.error(`no reports in ${dir}`);
  process.exit(1);
}

const latest = new Map();
for (const f of files) {
  const p = path.join(dir, f);
  try {
    const r = JSON.parse(fs.readFileSync(p, "utf8"));
    if (tag && r.tag !== tag) continue;
    const key = `${r.provider}|${r.model}|${r.mode}|${r.tag || ""}`;
    const prev = latest.get(key);
    if (!prev || r.ts > prev.r.ts) latest.set(key, { r, file: f });
  } catch {}
}

const rows = [];
for (const { r } of latest.values()) {
  const errs = r.results.filter((x) => x.error && x.error !== "").length;
  const fetchErrs = r.results.filter((x) => /fetch|ECONN|socket|HTTP 5/i.test(String(x.error))).length;
  const cats = {};
  for (const x of r.results) {
    const c = x.id.replace(/[0-9]+$/, "");
    cats[c] ??= { n: 0, pass: 0 };
    cats[c].n += 1;
    cats[c].pass += x.pass ? 1 : 0;
  }
  const decode = r.results.map((x) => x.timings?.predicted_per_second).filter(Boolean);
  const avgDecode = decode.length ? decode.reduce((a, b) => a + b, 0) / decode.length : null;
  rows.push({
    model: path.basename(String(r.model)).replace(/\.gguf$/i, "") || r.model,
    provider: r.provider,
    mode: r.mode || "json",
    tag: r.tag || "",
    pass: `${r.passed}/${r.total}`,
    pct: Math.round((r.passRate || 0) * 100),
    coldP50: r.coldP50Ms,
    warmP50: r.warmP50Ms,
    warmP95: r.warmP95Ms,
    startup: r.startupMs,
    decode: avgDecode ? Math.round(avgDecode) : null,
    errs,
    fetchErrs,
    cats,
    ts: r.ts,
  });
}
rows.sort((a, b) => b.pct - a.pct || a.warmP50 - b.warmP50);

const allCats = [...new Set(rows.flatMap((r) => Object.keys(r.cats)))].sort();
const hdr = ["model", "prov", "mode", "tag", "pass", "%", "cold p50", "warm p50", "warm p95", "load s", "tok/s", "errs", ...allCats];
const cell = (r, k) => {
  if (k === "model") return r.model;
  if (k === "prov") return r.provider;
  if (k === "mode") return r.mode;
  if (k === "tag") return r.tag || "-";
  if (k === "pass") return r.pass;
  if (k === "%") return String(r.pct);
  if (k === "cold p50") return r.coldP50 ? `${(r.coldP50 / 1000).toFixed(1)}s` : "-";
  if (k === "warm p50") return r.warmP50 ? `${(r.warmP50 / 1000).toFixed(1)}s` : "-";
  if (k === "warm p95") return r.warmP95 ? `${(r.warmP95 / 1000).toFixed(1)}s` : "-";
  if (k === "load s") return r.startup ? `${(r.startup / 1000).toFixed(0)}s` : "-";
  if (k === "tok/s") return r.decode ?? "-";
  if (k === "errs") return r.errs ? `${r.errs}${r.fetchErrs ? ` (${r.fetchErrs} infra)` : ""}` : "0";
  const c = r.cats[k];
  return c ? `${c.pass}/${c.n}` : "-";
};
const widths = hdr.map((h) => Math.max(h.length, ...rows.map((r) => String(cell(r, h)).length)));
const line = (vals) => vals.map((v, i) => String(v).padEnd(widths[i])).join("  ");
console.log(line(hdr));
console.log(widths.map((w) => "-".repeat(w)).join("  "));
for (const r of rows) console.log(line(hdr.map((h) => cell(r, h))));

const tainted = rows.filter((r) => r.fetchErrs > 0);
if (tainted.length) {
  console.log(`\nWARNING: ${tainted.length} report(s) contain infra/fetch errors — treat as tainted:`);
  for (const r of tainted) console.log(`  ${r.model} (${r.fetchErrs} infra errors)`);
}
