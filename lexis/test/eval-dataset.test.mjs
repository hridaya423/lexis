import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const evalDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "eval", "datasets");
const datasets = ["core.jsonl", "holdout.jsonl"].map((name) => ({
  name,
  cases: fs.readFileSync(path.join(evalDir, name), "utf8").trim().split("\n").map((l, i) => {
    try {
      return JSON.parse(l);
    } catch (e) {
      throw new Error(`${name} line ${i + 1} does not parse: ${e.message}`);
    }
  }),
}));

const PLATFORMS = new Set(["all", "unix", "windows", "macos", "linux"]);
const OSES = new Set(["darwin", "linux", "windows", "any", "any-unix"]);
const RISKS = new Set(["low", "moderate", "high", "critical"]);
const EXPECT_KEYS = new Set(["anyOfRegex", "anyOfRegexByOs", "mustNotMatch", "mustNotMatchByOs", "maxCommands", "readonly", "expectedRiskAtLeast", "platforms", "exec"]);

for (const { name, cases } of datasets) {
  test(`${name}: ids unique and required fields present`, () => {
    const seen = new Set();
    for (const c of cases) {
      assert.ok(c.id && typeof c.id === "string", `case missing id: ${JSON.stringify(c)}`);
      assert.ok(!seen.has(c.id), `duplicate id ${c.id}`);
      seen.add(c.id);
      assert.equal(typeof c.intent, "string", `${c.id}: intent must be a string`);
      if (c.platform !== undefined) assert.ok(PLATFORMS.has(c.platform), `${c.id}: unknown platform '${c.platform}'`);
      if (c.os !== undefined) assert.ok(OSES.has(c.os), `${c.id}: unknown os '${c.os}'`);
      assert.ok(c.expect && typeof c.expect === "object", `${c.id}: missing expect block`);
      for (const k of Object.keys(c.expect)) {
        assert.ok(EXPECT_KEYS.has(k), `${c.id}: unknown expect key '${k}'`);
      }
    }
  });

  test(`${name}: every regex compiles`, () => {
    for (const c of cases) {
      for (const field of ["anyOfRegex", "mustNotMatch"]) {
        for (const pattern of c.expect[field] || []) {
          assert.doesNotThrow(() => new RegExp(pattern), `${c.id}: bad ${field} /${pattern}/`);
        }
      }
    }
  });

  test(`${name}: exec checks reference model output or effects`, () => {
    for (const c of cases) {
      const ex = c.expect.exec;
      if (!ex) continue;
      assert.equal(typeof ex.check, "string", `${c.id}: exec.check must be a string`);
      // a check that never inspects the model's stdout/exit/effects can pass on noop
      assert.ok(/LX_OUT|LX_EXIT/.test(ex.check) || /^[!(\s]*(test|grep|cmp|diff|stat|find|git|dpkg|ls|tar|unzip|gzip|readlink|seq)/.test(ex.check.trim()),
        `${c.id}: exec.check must inspect LX_OUT/LX_EXIT or assert filesystem effects`);
    }
  });
}

for (const { name, cases } of datasets) {
  test(`${name}: risk floors and platform lists are valid`, () => {
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
}
