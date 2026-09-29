import test from "node:test";
import assert from "node:assert/strict";
import { resolveFollowUp } from "../src/commands/run.mjs";

const ev = (prompt, extra = {}) => ({ type: "execute", prompt, ts: new Date().toISOString(), ...extra });

test("resolveFollowUp compounds referents onto recent lookup intents", () => {
  const events = [ev("show disk usage"), ev("ls -la", { type: "command_result" })];
  const r = resolveFollowUp("now break it down", events, { cwd: "/a" });
  assert.equal(r.prompt, "show disk usage, then break it down");
  assert.equal(r.anchor, "show disk usage");
});

test("resolveFollowUp ignores non-referents, stale and non-lookup anchors", () => {
  assert.equal(resolveFollowUp("list files", [ev("show disk usage")], {}), null);
  assert.equal(resolveFollowUp("kill it", [ev("delete temp files")], {}), null);
  const stale = [ev("show disk usage", { ts: new Date(Date.now() - 20 * 60 * 1000).toISOString() })];
  assert.equal(resolveFollowUp("kill it", stale, {}), null);
});

test("resolveFollowUp prefers same-directory anchors", () => {
  const events = [ev("check port 80", { cwd: "/other" }), ev("check port 3000", { cwd: "/proj" })];
  const r = resolveFollowUp("kill it", events, { cwd: "/proj" });
  assert.equal(r.anchor, "check port 3000");
});
