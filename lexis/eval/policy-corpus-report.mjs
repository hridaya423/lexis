#!/usr/bin/env node
// Score src/policy.mjs against the labelled corpus (test/policy-corpus.jsonl).
//   node eval/policy-corpus-report.mjs [outdir]   -> counts, plus <outdir>/{false_readonly,under_critical,false_prompt}.tsv
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeCommand, RISK_SCORE } from "../src/policy.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const rows = fs.readFileSync(path.join(root, "test/policy-corpus.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const out = { false_readonly: [], under_critical: [], false_prompt: [] };
for (const r of rows) {
  const a = analyzeCommand(r.cmd, { shell: r.shell });
  if (r.decision !== "auto" && a.readonly) out.false_readonly.push([r.i, r.decision, r.os, r.cmd]);
  if (r.decision === "critical" && RISK_SCORE[a.risk] < RISK_SCORE.high) out.under_critical.push([r.i, a.risk, r.os, r.cmd]);
  if (r.decision === "auto" && !a.readonly) out.false_prompt.push([r.i, a.risk, r.os, (a.reasons[0] || "").slice(0, 50), r.cmd]);
}
const auto = rows.filter((r) => r.decision === "auto").length;
console.log(`rows ${rows.length}  false_readonly ${out.false_readonly.length}  under_critical ${out.under_critical.length}  false_prompt ${out.false_prompt.length}/${auto} auto`);
const dir = process.argv[2];
if (dir) for (const [k, v] of Object.entries(out)) fs.writeFileSync(path.join(dir, `${k}.tsv`), v.map((x) => x.join("\t")).join("\n") + "\n");
