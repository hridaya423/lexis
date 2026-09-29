import test from "node:test";
import assert from "node:assert/strict";
import { decideApproval } from "../src/commands/run.mjs";

test("critical always needs typed review — no flag bypasses", () => {
  for (const flags of [{}, { autoYes: true }, { force: true }, { autoYes: true, force: true }]) {
    assert.equal(
      decideApproval({ critical: true, requiresConfirmation: true, risk: "critical", ...flags }),
      "critical"
    );
  }
});

test("low-risk proven plan auto-runs by default, not when autoExecuteLowRisk is off", () => {
  const base = { critical: false, requiresConfirmation: false, risk: "low" };
  assert.equal(decideApproval(base), "auto");
  assert.equal(decideApproval({ ...base, autoExecuteLowRisk: false }), "review");
  assert.equal(decideApproval({ ...base, autoExecuteLowRisk: true }), "auto");
});

test("--yes covers moderate reviews only", () => {
  const yes = { critical: false, requiresConfirmation: true, autoYes: true };
  assert.equal(decideApproval({ ...yes, risk: "low" }), "auto");
  assert.equal(decideApproval({ ...yes, risk: "moderate" }), "auto");
  assert.equal(decideApproval({ ...yes, risk: "high" }), "review");
});

test("--force covers high reviews but not critical", () => {
  const force = { critical: false, requiresConfirmation: true, force: true };
  assert.equal(decideApproval({ ...force, risk: "high" }), "auto");
  assert.equal(decideApproval({ ...force, risk: "moderate" }), "auto");
  assert.equal(decideApproval({ critical: true, requiresConfirmation: true, risk: "critical", force: true }), "critical");
});

test("unproven plan never auto-runs without a flag", () => {
  assert.equal(decideApproval({ critical: false, requiresConfirmation: true, risk: "low" }), "review");
  assert.equal(decideApproval({ critical: false, requiresConfirmation: true, risk: "high" }), "review");
});
