#!/usr/bin/env node
// Validates every expect.exec row in the holdout:
//   gold command must pass; 'false' must fail (on that row's OS judge).
// usage: node exec-selfcheck.mjs [--os linux|darwin]
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execCheck } from "../eval/exec-judge.mjs";

const HOLDOUT = path.join(os.homedir(), "lx-data", "holdout.jsonl");
const osFilter = process.argv.includes("--os") ? process.argv[process.argv.indexOf("--os") + 1] : null;
const rows = fs.readFileSync(HOLDOUT, "utf8").split("\n").filter(Boolean).map(JSON.parse);
const bad = [];
let n = 0, skip = 0;
for (const r of rows) {
  const ex = r.expect?.exec;
  if (!ex) continue;
  if (osFilter && r.os !== osFilter) continue;
  n++;
  const g = await execCheck(r.gold, ex, r.os);
  const w = await execCheck("false", ex, r.os);
  if (g.pass === null || w.pass === null) { skip++; continue; }
  const ok = g.pass === true && w.pass === false;
  if (!ok) bad.push({ id: r.id, goldPass: g.pass, goldDetail: g.detail, falsePass: w.pass, check: ex.check });
  process.stderr.write(`${ok ? "." : "X"}${r.id} `);
}
console.error(`\n${n} checked, ${skip} skipped (unsafe/unreachable), ${bad.length} bad`);
if (bad.length) console.log(JSON.stringify(bad, null, 1));
process.exit(bad.length ? 1 : 0);
