#!/usr/bin/env node
// Execution-based judge for eval cases with an `expect.exec` block.
// Runs the model's command inside a sandbox, then a check command.
//   linux:   docker container (real fixtures, mutating commands allowed)
//   darwin:  temp dir on host — readonly allowlist only
//   windows: win-pc over ssh in a temp dir — readonly allowlist only
// exec spec: { setup?: string, check: string } — setup builds fixture files,
// check must exit 0 for a pass. Both run in the same shell/session.

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const TIMEOUT_MS = 20_000;
const DOCKER_IMAGE = process.env.LX_EXEC_IMAGE || "ubuntu:24.04";

// heads considered safe to run in a host temp dir — no writers, no sudo
const SAFE_HOST_HEADS = new Set(
  "ls find grep egrep fgrep cat head tail wc sort uniq awk sed cut tr diff comm join column du df stat file echo printf date uname whoami id pwd true false test basename dirname readlink md5 shasum shasum5 cksum xxd od strings jq plutil env printenv which command seq jot tee".split(" ")
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
    .split(/\|\||&&|\||;/)
    .map((seg) => seg.trim().split(/\s+/).filter((w) => !/^[A-Za-z_]+=/.test(w) && w !== "sudo" && w !== "env")[0])
    .filter(Boolean);
}

export function hostSafe(command, shell) {
  const cmd = String(command);
  if (/sudo|>>|>(?![\d&])|\b(rm|mv|cp|dd|mkfs|chmod|chown|kill|pkill|killall|shutdown|reboot|halt|launchctl|pmset|diskutil|mount|umount|defaults|scutil|dscacheutil|networksetup|systemsetup|nvram|installer|pkgutil|sqlite3)\b/i.test(cmd)) return false;
  if (/-i\b|--in-place/.test(cmd) && /\bsed\b|\bdefaults\b/.test(cmd)) return false;
  return cmdHeads(cmd).every((h) => SAFE_HOST_HEADS.has(h) || h === "[");
}

async function judgeLinux(command, exec) {
  const setup = exec.setup || "true";
  const inner = `set -u; cd /work; (${setup}) >/dev/null 2>&1 || true; ${command}; echo "MODEL_EXIT:$?"; (${exec.check}); echo "CHECK_EXIT:$?"`;
  const r = await run("docker", ["run", "--rm", "-i", "--network=none", "--read-only", "--tmpfs", "/work:exec", DOCKER_IMAGE, "bash", "-c", inner]);
  const m = /MODEL_EXIT:(\d+)/.exec(r.stdout || "");
  const c = /CHECK_EXIT:(\d+)/.exec(r.stdout || "");
  if (!m || !c) return { pass: false, detail: `docker run failed: ${(r.stderr || r.err?.message || "").slice(0, 200)}` };
  return { pass: c[1] === "0", detail: `model exit ${m[1]}, check exit ${c[1]}`, stdout: r.stdout.slice(0, 500) };
}

async function judgeDarwin(command, exec) {
  if (!hostSafe(command)) return { pass: null, detail: "not host-safe (skipped)" };
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lxjudge-"));
  try {
    const setup = exec.setup || "true";
    const script = `cd ${shQuote(dir)} && (${setup}) >/dev/null 2>&1; ${command}; echo "MODEL_EXIT:$?"; (${exec.check}); echo "CHECK_EXIT:$?"`;
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
  const heads = cmdHeads(cmd).map((h) => h.replace(/\(.*$/, ""));
  // only run clearly-readonly cmdlet pipelines remotely
  if (/(^|\||;)\s*(Set-|New-|Remove-|Rename-|Move-|Copy-|Stop-|Start-|Restart-|Clear-|Add-|Enable-|Disable-|Register-|Invoke-(?!WebRequest|RestMethod)|Write-|Out-File|Set-Content|Add-Content|del\b|rm\b|rd\b|format|reg\s+add|netsh\s+(?!advfirewall\s+show|interface\s+show|wlan\s+show)|shutdown|taskkill)/i.test(cmd)) {
    return { pass: null, detail: "not remote-safe (skipped)" };
  }
  if (winReachable === null) {
    const probe = await run("ssh", ["-o", "ConnectTimeout=4", "-o", "BatchMode=yes", "win-pc", "echo ok"]);
    winReachable = /ok/.test(probe.stdout);
  }
  if (!winReachable) return { pass: null, detail: "win-pc unreachable (skipped)" };
  const script = `$d = New-Item -ItemType Directory -Path (Join-Path $env:TEMP ([guid]::NewGuid())) -Force; Set-Location $d.FullName; try { ${exec.setup || ""}; ${cmd} | Out-String -Width 200 | Out-Null; ${exec.check}; if ($?) { "CHECK_EXIT:0" } else { "CHECK_EXIT:1" } } catch { "CHECK_EXIT:9" } finally { Set-Location $env:TEMP; Remove-Item $d.FullName -Recurse -Force -ErrorAction SilentlyContinue }`;
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
