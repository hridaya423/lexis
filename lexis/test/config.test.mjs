import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

let tmpHome;
let loadConfig, saveConfig, deepMerge;

test.before(async () => {
  tmpHome = await fs.mkdtemp(path.join(os.tmpdir(), "lexis-test-home-"));
  process.env.HOME = tmpHome;
  process.env.USERPROFILE = tmpHome;
  process.env.XDG_CONFIG_HOME = path.join(tmpHome, ".config");
  process.env.XDG_DATA_HOME = path.join(tmpHome, ".local", "share");
  process.env.XDG_CACHE_HOME = path.join(tmpHome, ".cache");
  const mod = await import("../src/config.mjs?ts=" + Date.now());
  loadConfig = mod.loadConfig;
  saveConfig = mod.saveConfig;
  deepMerge = mod.deepMerge;
});

test("default config loads when file missing", async () => {
  const cfg = await loadConfig();
  assert.equal(cfg.version, 2);
  assert.equal(cfg.provider.active, "auto");
  assert.equal(cfg.webSearch.provider, "builtin");
});

test("save + load round-trips atomically", async () => {
  const cfg = await loadConfig();
  cfg.model = "qwen3-linuxcmd-4b";
  cfg.runtime.idleTimeoutSec = 300;
  await saveConfig(cfg);
  const reloaded = await loadConfig();
  assert.equal(reloaded.model, "qwen3-linuxcmd-4b");
  assert.equal(reloaded.runtime.idleTimeoutSec, 300);
});

test("corrupt config throws a named error", async () => {
  const { configPath } = await import("../src/paths.mjs");
  await fs.mkdir(path.dirname(configPath()), { recursive: true });
  await fs.writeFile(configPath(), "{not json", "utf8");
  await assert.rejects(loadConfig(), /corrupt|reset/i);
});

test("v1 config migrates: mlx -> llama-server, model carried over", async () => {
  const { configPath } = await import("../src/paths.mjs");
  await fs.writeFile(configPath(), JSON.stringify({
    llm: { provider: "mlx", model: "mlx-community/Qwen2.5-Coder-7B-Instruct-4bit" },
    webSearch: { enabled: true, mode: "auto" },
    execution: { hookMode: "auto" },
  }), "utf8");
  const cfg = await loadConfig();
  assert.equal(cfg.provider.active, "llama-server");
  assert.equal(cfg.model, "mlx-community/Qwen2.5-Coder-7B-Instruct-4bit");
  assert.ok(cfg.__migrationNotes.length > 0);
});

test("v1 ollama config preserved", async () => {
  const { configPath } = await import("../src/paths.mjs");
  await fs.writeFile(configPath(), JSON.stringify({ llm: { provider: "ollama", model: "qwen2.5-coder:3b" } }), "utf8");
  const cfg = await loadConfig();
  assert.equal(cfg.provider.active, "ollama");
  assert.equal(cfg.model, "qwen2.5-coder:3b");
});

test("deepMerge keeps nested defaults", () => {
  const merged = deepMerge({ a: { b: 1, c: 2 } }, { a: { b: 9 } });
  assert.deepEqual(merged, { a: { b: 9, c: 2 } });
});
