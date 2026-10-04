// Labelled safety corpus: the hard gate is that nothing the corpus marks as
// needing approval (or typed confirmation) may come back readonly.
// Budgets below are a ratchet — lower them as classifications improve, never raise.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeCommand, RISK_SCORE } from "../src/policy.mjs";

const corpusPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "policy-corpus.jsonl");

// 2025-07 corpus hardening: baseline was false_readonly 19, under_critical 20,
// false_prompt 303/1371; now 0 / 0 / 0 of 1365 auto rows. Lower, never raise.
const AUTO_BUT_NOT_READONLY_BUDGET = 0;
const CRITICAL_BUT_UNDER_RATED_BUDGET = 0;

const rows = fs.existsSync(corpusPath)
  ? fs.readFileSync(corpusPath, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l))
  : [];

test("policy corpus exists and is labelled", () => {
  assert.ok(rows.length > 1000, `expected >1000 labelled rows, got ${rows.length}`);
  for (const r of rows) assert.ok(["auto", "ask", "critical"].includes(r.decision));
});

test("no ask/critical command is classified readonly (hard gate)", () => {
  const bad = [];
  for (const r of rows) {
    if (r.decision === "auto") continue;
    const a = analyzeCommand(r.cmd, { shell: r.shell });
    if (a.readonly) bad.push(`${r.i} ${r.decision} ${r.cmd}`);
  }
  assert.deepEqual(bad, [], `${bad.length} dangerous commands classified readonly`);
});

test("auto-labelled commands the policy would still prompt on (budget ratchet)", () => {
  const missed = [];
  for (const r of rows) {
    if (r.decision !== "auto") continue;
    const a = analyzeCommand(r.cmd, { shell: r.shell });
    if (!a.readonly) missed.push(`${r.i} ${r.cmd} — ${a.reasons[0] || a.risk}`);
  }
  assert.ok(missed.length <= AUTO_BUT_NOT_READONLY_BUDGET,
    `${missed.length} auto commands still prompt (budget ${AUTO_BUT_NOT_READONLY_BUDGET}):\n${missed.slice(0, 20).join("\n")}`);
});

test("critical-labelled commands are rated high or critical (budget ratchet)", () => {
  const low = [];
  for (const r of rows) {
    if (r.decision !== "critical") continue;
    const a = analyzeCommand(r.cmd, { shell: r.shell });
    if (RISK_SCORE[a.risk] < RISK_SCORE.high) low.push(`${r.i} ${a.risk} ${r.cmd}`);
  }
  assert.ok(low.length <= CRITICAL_BUT_UNDER_RATED_BUDGET,
    `${low.length} critical commands rated below high (budget ${CRITICAL_BUT_UNDER_RATED_BUDGET}):\n${low.slice(0, 20).join("\n")}`);
});
