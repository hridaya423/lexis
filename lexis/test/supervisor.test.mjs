import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

let tmpHome;
let readRuntimeState, touchState, runtimeStatePath, serverFlagList, waitForPeerStartup;

test.before(async () => {
  tmpHome = await fs.mkdtemp(path.join(os.tmpdir(), "lexis-sup-"));
  process.env.HOME = tmpHome;
  process.env.USERPROFILE = tmpHome;
  process.env.XDG_CONFIG_HOME = path.join(tmpHome, ".config");
  process.env.XDG_DATA_HOME = path.join(tmpHome, ".local", "share");
  const sup = await import("../src/runtime/supervisor.mjs?ts=" + Date.now());
  readRuntimeState = sup.readRuntimeState;
  touchState = sup.touchState;
  serverFlagList = sup.serverFlagList;
  waitForPeerStartup = sup.waitForPeerStartup;
  const paths = await import("../src/paths.mjs");
  runtimeStatePath = paths.runtimeStatePath;
});

test("state reads not-running when file missing", async () => {
  const state = await readRuntimeState();
  assert.equal(state.running, false);
});

test("touchState updates lastUsedAt", async () => {
  await fs.mkdir(path.dirname(runtimeStatePath()), { recursive: true });
  const state = { supervisorPid: process.pid, serverPid: process.pid, port: 9999, status: "running", lastUsedAt: 0 };
  await fs.writeFile(runtimeStatePath(), JSON.stringify(state), "utf8");
  await touchState();
  const after = JSON.parse(await fs.readFile(runtimeStatePath(), "utf8"));
  assert.ok(after.lastUsedAt > 0);
});

test("serverFlagList appends LEXIS_SERVER_ARGS so overrides win", () => {
  const base = serverFlagList();
  process.env.LEXIS_SERVER_ARGS = "-t 8 -fa on";
  const tuned = serverFlagList();
  delete process.env.LEXIS_SERVER_ARGS;
  assert.equal(tuned.length, base.length + 4);
  assert.deepEqual(tuned.slice(-4), ["-t", "8", "-fa", "on"]);
});

test("waitForPeerStartup returns a peer's healthy server instead of null", async () => {
      const http = await import("node:http");
  const stub = http.createServer((req, res) => {
    res.writeHead(req.url === "/health" ? 200 : 404).end();
  });
  await new Promise((r) => stub.listen(0, "127.0.0.1", r));
  const port = stub.address().port;
  const lockDir = `${runtimeStatePath()}.lock`;
  const modelFile = path.join(tmpHome, "peer-model.gguf");
  await fs.mkdir(lockDir, { recursive: true });
  setTimeout(async () => {
    const state = { supervisorPid: process.pid, serverPid: process.pid, port, status: "running", running: true, modelFile, lastUsedAt: Date.now() };
    await fs.writeFile(runtimeStatePath(), JSON.stringify(state), "utf8");
    await fs.rm(lockDir, { recursive: true, force: true });
  }, 700).unref();
  const waited = await waitForPeerStartup(lockDir, { modelFile }, 10000);
  stub.close();
  assert.equal(waited?.port, port);
  assert.equal(waited?.modelFile, modelFile);
});

test("waitForPeerStartup returns null after grace when lock released with no server", async () => {
  const lockDir = `${runtimeStatePath()}.lock2`;
  await fs.rm(runtimeStatePath(), { force: true });
  await fs.mkdir(lockDir, { recursive: true });
  setTimeout(() => fs.rm(lockDir, { recursive: true, force: true }), 300).unref();
  const t0 = Date.now();
  const waited = await waitForPeerStartup(lockDir, { modelFile: path.join(tmpHome, "gone.gguf") }, 10000);
  assert.equal(waited, null);
  assert.ok(Date.now() - t0 >= 1500, "should wait the grace ticks, not return instantly");
});
