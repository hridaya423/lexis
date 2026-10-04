#!/usr/bin/env node
// Re-grade saved eval reports against the current datasets without re-running the model.
//   node eval/rescore.mjs [--no-exec] [--write] <tag-prefix>...
// --no-exec reuses each result's stored exec verdict; otherwise exec checks are re-run.
// --write saves <report>.rescored.json (summary.py --rescored reads those).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gradeCase } from "./grade.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const noExec = argv.includes("--no-exec");
const write = argv.includes("--write");
const prefixes = argv.filter((a) => !a.startsWith("--"));
const DS = /-(core|wide|holdout_a|holdout_b|holdout|testx)-(darwin|linux|windows)$/;

const datasets = new Map();
async function cases(name) {
  if (!datasets.has(name)) {
    const raw = await fs.readFile(path.join(root, "datasets", name), "utf8");
    datasets.set(name, new Map(raw.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)).map((c) => [c.id, c])));
  }
  return datasets.get(name);
}

const files = (await fs.readdir(path.join(root, "reports"))).filter((f) => f.endsWith(".json") && !f.endsWith(".rescored.json"));
const latest = new Map();
for (const f of files) {
  const full = path.join(root, "reports", f);
  const report = JSON.parse(await fs.readFile(full, "utf8"));
  const tag = report.tag || "";
  if (!DS.test(tag) || (prefixes.length && !prefixes.some((p) => tag.startsWith(p)))) continue;
  const ts = Date.parse(report.ts || 0);
  if (!latest.has(tag) || latest.get(tag).ts < ts) latest.set(tag, { ts, full, report });
}

for (const [tag, { full, report }] of [...latest].sort()) {
  const byId = await cases(report.dataset.name);
  const shell = report.machine?.shell || "zsh";
  const platform = /power|pwsh/i.test(shell) ? "windows" : "unix";
  const [, , osArg] = tag.match(DS);
  let pass = 0, strict = 0, sudo = 0, missing = 0;
  const results = [];
  for (const r of report.results) {
    const testCase = byId.get(r.id);
    if (!testCase) { missing += 1; continue; }
    const plan = r.commands?.length
      ? { overall_risk: "low", confidence: r.confidence ?? 0.8, commands: r.commands.map((command) => ({ command, risk: "low", requires_confirmation: false, platform })) }
      : null;
    const o = testCase.os || (testCase.platform === "windows" ? "windows" : "any");
    const execOs = o === "any" || o === "any-unix" ? (osArg === "windows" ? "windows" : "darwin") : o;
    const storedExec = noExec && r.checks && "execOk" in r.checks ? { pass: r.checks.execOk, detail: r.checks.execDetail } : null;
    const g = await gradeCase({ testCase, plan, error: plan ? "" : r.error || "no command", shell, os: osArg, execOs, execMode: noExec ? false : "all", storedExec });
    if (g.pass) pass += 1;
    if (g.passStrict) strict += 1;
    if (g.checks.unneededSudo) sudo += 1;
    results.push({ ...r, storedPass: r.pass, pass: g.pass, passStrict: g.passStrict, checks: g.checks, policyFloor: g.policyFloor });
  }
  const was = report.results.filter((r) => r.pass).length;
  process.stdout.write(`${tag.padEnd(40)} stored ${String(was).padStart(4)}  strict ${String(strict).padStart(4)}  new ${String(pass).padStart(4)} / ${results.length}  unneeded-sudo ${sudo}${missing ? `  missing-cases ${missing}` : ""}\n`);
  if (write) {
    await fs.writeFile(full.replace(/\.json$/, ".rescored.json"),
      JSON.stringify({ ...report, results, passed: pass, passedStrict: strict, total: results.length, rescoredAt: new Date().toISOString() }, null, 2));
  }
}
