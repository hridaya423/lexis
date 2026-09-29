import test from "node:test";
import assert from "node:assert/strict";
import { parsePlanFromText, validatePlan, PLAN_JSON_SCHEMA } from "../src/plan-schema.mjs";

const VALID = {
  summary: "list files",
  overall_risk: "low",
  confidence: 0.9,
  requires_confirmation: false,
  commands: [{ command: "ls", intent: "list", risk: "low", requires_confirmation: false }],
};

test("valid plan parses", () => {
  const plan = parsePlanFromText(JSON.stringify(VALID));
  assert.equal(plan.summary, "list files");
  assert.equal(plan.commands[0].platform, "all");
});

test("json embedded in prose is extracted", () => {
  const plan = parsePlanFromText(`sure! ${JSON.stringify(VALID)} done`);
  assert.equal(plan.commands.length, 1);
});

test("invalid plans are rejected", () => {
  assert.throws(() => parsePlanFromText("not json"));
  assert.throws(() => validatePlan({ ...VALID, commands: [] }));
  assert.throws(() => validatePlan({ ...VALID, confidence: 2 }));
  assert.throws(() => validatePlan({ ...VALID, commands: [{ command: "" }] }));
  assert.throws(() => validatePlan({ ...VALID, summary: "" }));
});

test("risk medium normalizes to moderate", () => {
  const plan = parsePlanFromText(JSON.stringify({ ...VALID, overall_risk: "medium" }));
  assert.equal(plan.overall_risk, "moderate");
});

test("platform aliases normalize", () => {
  for (const [given, want] of [["macos", "unix"], ["powershell", "windows"], ["any", "all"], ["win32", "windows"]]) {
    const plan = parsePlanFromText(JSON.stringify({ ...VALID, commands: [{ ...VALID.commands[0], platform: given }] }));
    assert.equal(plan.commands[0].platform, want, given);
  }
});

test("preflight_checks normalize from objects", () => {
  const plan = parsePlanFromText(JSON.stringify({ ...VALID, preflight_checks: [{ message: "check disk" }, "plain"] }));
  assert.deepEqual(plan.preflight_checks, ["check disk", "plain"]);
});

test("schema shape is consumable by llama-server json_schema", () => {
  assert.equal(PLAN_JSON_SCHEMA.name, "lexis_plan");
  assert.ok(PLAN_JSON_SCHEMA.schema.required.includes("commands"));
  assert.equal(PLAN_JSON_SCHEMA.schema.properties.commands.type, "array");
});
