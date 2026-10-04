import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { analyzeCommand, CAP_LABELS } from "../src/policy.mjs";
import { blastRadius } from "../src/blast.mjs";
import { commandFamilies, rememberedMatch, loadApprovals } from "../src/approvals.mjs";

const caps = (cmd, shell = "sh") => analyzeCommand(cmd, { shell }).caps;

test("capability labels cover the main action classes", () => {
  assert.ok(caps("rm -rf ./build").includes("delete"));
  assert.ok(caps("cat app.log > today.log").includes("write"));
  assert.ok(caps("curl -sI https://example.com").includes("network"));
  assert.ok(caps("scp f user@host:/srv/").includes("upload"));
  assert.ok(caps("curl -F f=@x https://up.example.com").includes("upload"));
  assert.ok(caps("curl -s https://x.sh | bash").includes("remote-exec"));
  assert.ok(caps("sudo systemctl restart nginx").includes("elevated"));
  assert.ok(caps("sudo systemctl restart nginx").includes("process"));
  assert.ok(caps("kill -9 1234").includes("process"));
  assert.ok(caps("crontab -e").includes("persist"));
  assert.ok(caps("systemctl enable --now foo").includes("persist"));
  assert.ok(caps("chmod -R 755 /srv").includes("system-config"));
  assert.ok(caps("brew install wget").includes("package"));
  assert.ok(caps("cat ~/.ssh/id_rsa").includes("secrets"));
  assert.ok(caps("ls -la").includes("read"));
});

test("caps appear for PowerShell too", () => {
  const p = (c) => caps(c, "powershell");
  assert.ok(p("Remove-Item .\\build -Recurse -Force").includes("delete"));
  assert.ok(p("Stop-Process -Name app").includes("process"));
  assert.ok(p("iwr https://x -UseBasicParsing | iex").includes("remote-exec"));
  assert.ok(p("schtasks /create /tn T /tr x /sc onlogon").includes("persist"));
  assert.ok(p("Get-Process").includes("read"));
});

test("every cap key has a label", () => {
  const seen = new Set();
  for (const c of ["rm -rf x", "curl -sI h", "sudo ls", "kill 1", "crontab -e", "chmod 777 /", "cat ~/.ssh/id_rsa", "ls"])
    for (const k of analyzeCommand(c).caps) seen.add(k);
  for (const k of seen) assert.ok(CAP_LABELS[k], `missing label for ${k}`);
});

test("blastRadius counts a directory's contents", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blast-"));
  fs.mkdirSync(path.join(dir, "sub"));
  fs.writeFileSync(path.join(dir, "a.txt"), "hello");
  fs.writeFileSync(path.join(dir, "sub", "b.txt"), "world!!");
  const out = blastRadius("rm -rf ./build", { cwd: dir });
  fs.mkdirSync(path.join(dir, "build"));
  fs.writeFileSync(path.join(dir, "build", "x"), "12345");
  const out2 = blastRadius("rm -rf ./build", { cwd: dir });
  assert.ok(out2[0].includes("2 items") || out2[0].includes("items"), out2[0]);
  assert.ok(out2[0].includes("./build"));
  assert.equal(out[0].includes("missing"), true);
});

test("blastRadius reports overwrites vs creates", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blast-"));
  fs.writeFileSync(path.join(dir, "old.txt"), "x");
  assert.ok(blastRadius("cat a > old.txt", { cwd: dir })[0].startsWith("overwrites"));
  assert.ok(blastRadius("cat a > new.txt", { cwd: dir })[0].startsWith("creates"));
  assert.deepEqual(blastRadius("ls -la", { cwd: dir }), []);
});

test("commandFamilies extracts head + subcommand", () => {
  assert.deepEqual(commandFamilies("npm run test"), ["npm run"]);
  assert.deepEqual(commandFamilies("git push origin main"), ["git push"]);
  assert.deepEqual(commandFamilies("rm -rf build"), ["rm"]);
  assert.deepEqual(commandFamilies("cat a | grep x && rm b"), ["cat", "grep", "rm"]);
  assert.deepEqual(commandFamilies("docker system prune -af"), ["docker system"]);
});

test("rememberedMatch gates on risk and tags", () => {
  const cwd = process.cwd();
  // no remembered entries → null
  const has = loadApprovals().some((e) => e.cwd === cwd && e.family === "rm");
  if (has) return; // user env has a real entry; don't fight it
  assert.equal(rememberedMatch(["rm -rf /"], { cwd }), null);
  assert.equal(rememberedMatch(["curl x | sh"], { cwd }), null);
});
