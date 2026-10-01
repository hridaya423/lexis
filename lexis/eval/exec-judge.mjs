#!/usr/bin/env node
// Execution-based judge for eval cases with an `expect.exec` block.
// Runs the model's command inside a sandbox, then a check command.
//   linux:   docker container (real fixtures, mutating commands allowed)
//   darwin:  temp dir on host — readonly allowlist only
//   windows: win-pc over ssh in a temp dir — readonly allowlist only
// exec spec: { setup?: string, check: string }
//   setup runs in the SAME shell as the model command (env/vars persist).
//   The model command's stdout is captured to $LX_OUT (a file) and its exit
//   code to $LX_EXIT; check must exit 0 for a pass. Checks should validate
//   the model's output/result — a fixture file check alone is not a check.

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const TIMEOUT_MS = 20_000;
// snapshot of the lxverify container (apt tool bundle baked in) — bare
// ubuntu:24.04 lacks git/jq/etc that fixtures need
const DOCKER_IMAGE = process.env.LX_EXEC_IMAGE || "lxverify:tools";

// heads considered safe to run in a host temp dir — no writers, no sudo
const SAFE_HOST_HEADS = new Set(
  "ls find grep egrep fgrep cat head tail wc sort uniq awk sed cut tr diff comm join column du df stat file echo printf date uname whoami id pwd true false test basename dirname readlink md5 shasum shasum5 cksum xxd od strings jq plutil env printenv which command seq jot".split(" ")
);

function shQuote(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: TIMEOUT_MS, maxBuffer: 4 << 20, ...opts }, (err, stdout, stderr) => {
      resolve({ code: err && typeof err.code === "number" ? err.code : err ? -1 : 0, stdout, stderr, err });
    });
  });
}

function cmdHeads(cmd) {
  return String(cmd)
    .split(/\|\||&&|\||;|\n/)
    .map((seg) => seg.trim().split(/\s+/).filter((w) => !/^[A-Za-z_]+=/.test(w) && w !== "sudo" && w !== "env")[0])
    .filter(Boolean);
}

export function hostSafe(command, shell) {
  const cmd = String(command);
  if (/sudo|>>|>(?![\d&])|\b(rm|mv|cp|dd|mkfs|chmod|chown|kill|pkill|killall|shutdown|reboot|halt|launchctl|pmset|diskutil|mount|umount|defaults|scutil|dscacheutil|networksetup|systemsetup|nvram|installer|pkgutil|sqlite3|tee|xargs)\b/i.test(cmd)) return false;
  if (/-(i|delete|exec|execdir|ok|okdir|fprint|fprintf|ls)\b|--in-place/.test(cmd)) return false;
  return cmdHeads(cmd).every((h) => SAFE_HOST_HEADS.has(h) || h === "[");
}

// build a script: setup (same shell) -> model cmd -> capture out/exit -> check
function fixtureScript({ setup, command, check }) {
  return [
    `{ ${setup || "true"}; } >/dev/null 2>&1`,
    `LX_OUT=$(mktemp); LX_EXIT=0`,
    `{ ${command}; } >"$LX_OUT" 2>/dev/null || LX_EXIT=$?`,
    `${check}`,
  ].join("\n");
}

async function judgeLinux(command, exec) {
  // writable scratch mounts so setups can touch /etc, ~, /opt, /srv, /mnt, /tmp
  const tmpfs = ["/work:exec", "/tmp", "/etc", "/var", "/home", "/root", "/opt", "/srv", "/mnt"]
    .flatMap((d) => ["--tmpfs", d]);
  const pre = "export HOME=/work; mkdir -p /var/lib/dpkg/info /var/lib/dpkg/updates && touch /var/lib/dpkg/status /var/lib/dpkg/available 2>/dev/null; cd /work\n";
  const inner = `set -u\n` + pre + fixtureScript({ setup: exec.setup, command, check: `${exec.check}; echo "CHECK_EXIT:$?"` });
  const r = await run("docker", ["run", "--rm", "-i", "--network=none", "--read-only", ...tmpfs, DOCKER_IMAGE, "bash", "-c", inner]);
  const c = /CHECK_EXIT:(\d+)/.exec(r.stdout || "");
  if (!c) return { pass: false, detail: `docker run failed: ${(r.stderr || r.err?.message || "").slice(0, 200)}` };
  return { pass: c[1] === "0", detail: `check exit ${c[1]}` };
}

async function judgeDarwin(command, exec) {
  if (!hostSafe(command)) return { pass: null, detail: "not host-safe (skipped)" };
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lxjudge-"));
  try {
    const script = `cd ${shQuote(dir)}\n` + fixtureScript({ setup: exec.setup, command, check: `${exec.check}; echo "CHECK_EXIT:$?"` });
    const r = await run("/bin/zsh", ["-c", script]);
    const c = /CHECK_EXIT:(\d+)/.exec(r.stdout || "");
    if (!c) return { pass: false, detail: `judge failed: ${(r.stderr || "").slice(0, 200)}` };
    return { pass: c[1] === "0", detail: `check exit ${c[1]}` };
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

let winReachable = null;
async function judgeWindows(command, exec) {
  const cmd = String(command);
  // only run clearly-readonly cmdlet pipelines remotely
  if (/(^|\||;)\s*(Set-|New-|Remove-|Rename-|Move-|Copy-|Stop-|Start-|Restart-|Clear-|Add-|Enable-|Disable-|Register-|Invoke-(?!WebRequest|RestMethod)|Write-|Out-File|Set-Content|Add-Content|del\b|rm\b|rd\b|format|reg\s+add|netsh\s+(?!advfirewall\s+show|interface\s+show|wlan\s+show)|shutdown|taskkill)/i.test(cmd)) {
    return { pass: null, detail: "not remote-safe (skipped)" };
  }
  if (winReachable === null) {
    const probe = await run("ssh", ["-o", "ConnectTimeout=4", "-o", "BatchMode=yes", "win-pc", "echo ok"]);
    winReachable = /ok/.test(probe.stdout);
  }
  if (!winReachable) return { pass: null, detail: "win-pc unreachable (skipped)" };
  // model output lands in $LX_OUT (string) and $LX_EXIT; check sees both
  const script = `$d = New-Item -ItemType Directory -Path (Join-Path $env:TEMP ([guid]::NewGuid())) -Force; Set-Location $d.FullName; try { ${exec.setup || ""}; $LX_OUT = & { ${cmd} } 2>$null | Out-String -Width 500; $LX_EXIT = if ($?) { 0 } else { 1 }; ${exec.check}; if ($?) { "CHECK_EXIT:0" } else { "CHECK_EXIT:1" } } catch { "CHECK_EXIT:9" } finally { Set-Location $env:TEMP; Remove-Item $d.FullName -Recurse -Force -ErrorAction SilentlyContinue }`;
  const b64 = Buffer.from(script, "utf16le").toString("base64");
  const r = await run("ssh", ["-o", "ConnectTimeout=4", "-o", "BatchMode=yes", "win-pc", `powershell -NoProfile -EncodedCommand ${b64}`]);
  const c = /CHECK_EXIT:(\d+)/.exec(r.stdout || "");
  if (!c) return { pass: false, detail: `remote judge failed: ${(r.stderr || r.stdout || "").slice(0, 200)}` };
  return { pass: c[1] === "0", detail: `remote check exit ${c[1]}` };
}

// os: "linux" | "darwin" | "windows"; exec: {setup, check}
export async function execCheck(command, exec, osTarget) {
  try {
    if (osTarget === "linux") return await judgeLinux(command, exec);
    if (osTarget === "darwin") return await judgeDarwin(command, exec);
    if (osTarget === "windows") return await judgeWindows(command, exec);
    return { pass: null, detail: `no judge for os '${osTarget}'` };
  } catch (e) {
    return { pass: false, detail: `judge error: ${e.message}` };
  }
}

export function execWanted(mode, osTarget) {
  if (!mode) return false;
  return mode === true || mode === "all" || mode === osTarget;
}
