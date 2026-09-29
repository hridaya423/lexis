import test from "node:test";
import assert from "node:assert/strict";
import { pickBackend } from "../src/runtime/installer.mjs";
import { ASSETS, assetKeyFor } from "../src/runtime/llama-release.mjs";
import { defaultModelFor, catalogEntry, MODEL_CATALOG } from "../src/runtime/models.mjs";

const mac = { platform: "darwin", arch: "arm64", gpu: { backend: "metal" } };
const macIntel = { platform: "darwin", arch: "x64", gpu: { backend: "cpu" } };
const linuxNvidia = { platform: "linux", arch: "x64", gpu: { backend: "cuda" } };
const linuxIgpu = { platform: "linux", arch: "x64", gpu: { backend: "vulkan" } };
const linuxArm = { platform: "linux", arch: "arm64", gpu: { backend: "cpu" } };
const winNvidia = { platform: "win32", arch: "x64", gpu: { backend: "cuda" } };
const winArm = { platform: "win32", arch: "arm64", gpu: { backend: "vulkan" } };

test("auto backend follows detected GPU", () => {
  assert.equal(pickBackend(mac), "metal");
  assert.equal(pickBackend(macIntel), "cpu");
  assert.equal(pickBackend(linuxNvidia), "cuda");
  assert.equal(pickBackend(linuxIgpu), "vulkan");
  assert.equal(pickBackend(linuxArm), "cpu");
  assert.equal(pickBackend(winNvidia), "cuda");
});

test("explicit backend requests are honored", () => {
  assert.equal(pickBackend(linuxNvidia, "cpu"), "cpu");
  assert.equal(pickBackend(linuxIgpu, "cuda"), "cuda");
  assert.equal(pickBackend(mac, "metal"), "metal");
  assert.throws(() => pickBackend(linuxNvidia, "metal"), /macOS arm64/);
});

test("every (platform, arch, backend) pickBackend can produce resolves to a published asset", () => {
  const machines = [mac, macIntel, linuxNvidia, linuxIgpu, linuxArm, winNvidia, winArm];
  for (const machine of machines) {
    for (const requested of ["auto", "cpu", "vulkan", "cuda"]) {
      const backend = pickBackend(machine, requested);
      const key = assetKeyFor({ platform: machine.platform, arch: machine.arch, backend });
      assert.ok(key, `${machine.platform}/${machine.arch}/${backend} has no asset key`);
      assert.ok(ASSETS[key], `${key} not in ASSETS`);
    }
  }
});

test("all pinned assets carry sha256 digests", () => {
  for (const [key, asset] of Object.entries(ASSETS)) {
    assert.match(asset.sha256 || "", /^[0-9a-f]{64}$/, `${key} missing sha256`);
    for (const extra of asset.extra || []) {
      assert.match(extra.sha256 || "", /^[0-9a-f]{64}$/, `${key} extra ${extra.name} missing sha256`);
    }
  }
});

test("default model scales with RAM", () => {
  assert.equal(defaultModelFor({ totalMemoryGb: 4 }), "kitty-bash-0.5b");
  assert.equal(defaultModelFor({ totalMemoryGb: 16 }), "kitty-bash-0.5b");
  assert.equal(defaultModelFor({ totalMemoryGb: 48 }), "kitty-bash-0.5b");
});

test("catalog entries carry repo/file/minRam", () => {
  for (const entry of MODEL_CATALOG) {
    assert.match(entry.repo, /^[\w.-]+\/[\w.-]+$/, `${entry.id} repo`);
    assert.ok(entry.file.endsWith(".gguf"), `${entry.id} file`);
    assert.ok(entry.minRamGb > 0, `${entry.id} minRamGb`);
  }
  assert.ok(catalogEntry("qwen3-linuxcmd-4b"));
  assert.equal(catalogEntry("nonexistent"), null);
});
