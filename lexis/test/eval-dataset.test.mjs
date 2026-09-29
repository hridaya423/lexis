import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const datasetPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "eval", "datasets", "core.jsonl");
const cases = fs.readFileSync(datasetPath, "utf8").trim().split("\n").map((l, i) => {
  try {
    return JSON.parse(l);
  } catch (e) {
    throw new Error(`core.jsonl line ${i + 1} does not parse: ${e.message}`);
  }
});

const PLATFORMS = new Set(["all", "unix", "windows", "macos", "linux"]);
const RISKS = new Set(["low", "moderate", "high", "critical"]);
const EXPECT_KEYS = new Set(["anyOfRegex", "mustNotMatch", "maxCommands", "readonly", "expectedRiskAtLeast", "platforms"]);

test("eval dataset: ids unique and required fields present", () => {
  assert.ok(cases.length >= 90, "dataset should cover >= 90 cases");
  const seen = new Set();
  for (const c of cases) {
    assert.ok(c.id && typeof c.id === "string", `case missing id: ${JSON.stringify(c)}`);
    assert.ok(!seen.has(c.id), `duplicate id ${c.id}`);
    seen.add(c.id);
    assert.equal(typeof c.intent, "string", `${c.id}: intent must be a string`);
    assert.ok(PLATFORMS.has(c.platform), `${c.id}: unknown platform '${c.platform}'`);
    assert.ok(c.expect && typeof c.expect === "object", `${c.id}: missing expect block`);
    for (const k of Object.keys(c.expect)) {
      assert.ok(EXPECT_KEYS.has(k), `${c.id}: unknown expect key '${k}'`);
    }
  }
});

test("eval dataset: every regex compiles", () => {
  for (const c of cases) {
    for (const field of ["anyOfRegex", "mustNotMatch"]) {
      for (const pattern of c.expect[field] || []) {
        assert.doesNotThrow(() => new RegExp(pattern), `${c.id}: bad ${field} /${pattern}/`);
      }
    }
  }
});

test("eval dataset: risk floors and platform lists are valid", () => {
  for (const c of cases) {
    if (c.expect.expectedRiskAtLeast) {
      assert.ok(RISKS.has(c.expect.expectedRiskAtLeast), `${c.id}: bad risk '${c.expect.expectedRiskAtLeast}'`);
    }
    for (const p of c.expect.platforms || []) {
      assert.ok(PLATFORMS.has(p), `${c.id}: bad expected platform '${p}'`);
    }
    if (c.expect.readonly !== undefined) {
      assert.equal(typeof c.expect.readonly, "boolean", `${c.id}: readonly must be boolean`);
    }
    if (c.expect.maxCommands !== undefined) {
      assert.ok(Number.isInteger(c.expect.maxCommands) && c.expect.maxCommands > 0, `${c.id}: maxCommands must be a positive int`);
    }
  }
});
