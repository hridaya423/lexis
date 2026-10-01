#!/usr/bin/env node
// Verification gates for candidate rows -> verified.jsonl
//   T1 syntax:    bash -n (unix) / remote pwsh parse (windows, via win-pc)
//   T2 heads:     command -v per OS — darwin on localhost, linux in docker, windows via ssh
//   T3 flags:     flag allowlist from flagdb.json for known heads (skip-unknown, not fail)
//   T4 exec:      linux rows run in fixture container; darwin readonly rows in temp dir;
//                 windows readonly rows on win-pc (skipped if unreachable)
//   T5 policy:    risk + readonly tag from lexis policy engine
// usage: verify.mjs [--os linux|darwin|windows] [--exec] [--limit N] [--in file] [--out file]

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { applyPolicyToPlan } from "../src/policy.mjs";
import { hostSafe } from "../eval/exec-judge.mjs";

const run = promisify(execFile);
const HOME = os.homedir();
const DATA = path.join(HOME, "lx-data");
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) =>
  a.startsWith("--") ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true] : [a, true]));
const IN = args.in || path.join(DATA, "candidates.jsonl");
const OUT = args.out || path.join(DATA, "verified.jsonl");
const LIMIT = args.limit ? Number(args.limit) : 0;
const DO_EXEC = Boolean(args.exec);
const EXEC_SAMPLE = Number(args["exec-sample"] || 4000);
const CONC = Number(args.concurrency || 16);
const FLAGDB_PATH = args.flagdb || path.join(DATA, "flagdb.json");

// ---------- helpers ----------
const WS = /\s+/g;
function cmdHeads(cmd) {
  return String(cmd)
    .split(/\|\||&&|\||;/)
    .map((seg) => seg.trim().split(/\s+/).filter((w) => !/^[A-Za-z_]+=/.test(w) && w !== "sudo" && w !== "env" && w !== "command" && w !== "builtin")[0])
    .filter(Boolean)
    .filter((h) => !/^[/~.$({]/.test(h));
}

async function sh(script, opts = {}) {
  try {
    const r = await run("bash", ["-c", script], { timeout: 30000, maxBuffer: 16 << 20, ...opts });
    return { ok: true, out: r.stdout, err: r.stderr };
  } catch (e) {
    return { ok: false, out: e.stdout || "", err: e.stderr || String(e.message) };
  }
}

async function sshWin(ps, timeout = 30000) {
  const b64 = Buffer.from(ps, "utf16le").toString("base64");
  try {
    const r = await run("ssh", ["-o", "ConnectTimeout=6", "-o", "BatchMode=yes", "win-pc",
      `powershell -NoProfile -EncodedCommand ${b64}`], { timeout, maxBuffer: 32 << 20 });
    return { ok: true, out: r.stdout };
  } catch (e) {
    return { ok: false, out: e.stdout || "", err: e.stderr || String(e.message) };
  }
}

// ---------- flag db ----------
const FLAGDB_RAW = fs.existsSync(FLAGDB_PATH) ? JSON.parse(fs.readFileSync(FLAGDB_PATH, "utf8")) : {};
const FLAGDB = Object.fromEntries(Object.entries(FLAGDB_RAW).map(([o, m]) =>
  [o, Object.fromEntries(Object.entries(m).map(([h, f]) => [h, new Set(f)]))]));
function flagsOf(cmd) {
  return [...String(cmd).matchAll(/(?:^|\s)(-{1,2}[A-Za-z][\w-]*)/g)].map((m) => m[1].replace(/^-+/, "-").replace(/^--/, "-"));
}
function flagCheck(osKey, head, cmd) {
  const db = FLAGDB[osKey]?.[head];
  if (!db) return "skip";
  for (const seg of String(cmd).split(/\|\||&&|\||;/)) {
    const words = seg.trim().split(/\s+/);
    if (words[0] !== head) continue;
    for (const w of words.slice(1)) {
      if (!/^-[A-Za-z]/.test(w) || w.startsWith("--") && w.length < 3) continue;
      if (/^-{1,2}[A-Za-z]/.test(w) || /^--[a-z]/.test(w)) {
        const key = w.split("=")[0];
        if (!db.has(key) && ![...db.keys()].some((f) => key.startsWith(f) && f.length > 2)) return `bad:${key}`;
      }
    }
  }
  return "ok";
}

// ---------- binary existence maps ----------
async function mapHeads(heads, osKey) {
  const out = {};
  if (!heads.length) return out;
  if (osKey === "darwin") {
    const res = await sh(`for h in ${heads.map((h) => `"${h.replace(/"/g, "")}"`).join(" ")}; do command -v "$h" >/dev/null 2>&1 && echo "YES $h" || echo "NO $h"; done`);
    for (const l of res.out.split("\n")) { const m = /^(YES|NO) (.+)$/.exec(l); if (m) out[m[2]] = m[1] === "YES"; }
  } else if (osKey === "linux") {
    await ensureLinuxBox();
    // batch via docker exec loop
    const list = heads.map((h) => `"${h.replace(/"/g, "")}"`).join(" ");
    const res = await sh(`docker exec lxverify bash -c 'for h in ${list}; do command -v "$h" >/dev/null 2>&1 && echo "YES $h" || echo "NO $h"; done'`, { timeout: 120000 });
    for (const l of res.out.split("\n")) { const m = /^(YES|NO) (.+)$/.exec(l); if (m) out[m[2]] = m[1] === "YES"; }
  } else if (osKey === "windows") {
    const list = heads.map((h) => `'${h.replace(/'/g, "")}'`).join(",");
    const r = await sshWin(`$h=@(${list}); foreach($x in $h){ if(Get-Command $x -ErrorAction SilentlyContinue){"YES $x"}else{"NO $x"} }`, 180000);
    for (const l of r.out.split(/\r?\n/)) { const m = /^(YES|NO) (.+)$/.exec(l.trim()); if (m) out[m[2]] = m[1] === "YES"; }
  }
  return out;
}

// ---------- linux docker box ----------
let boxReady = null;
async function ensureLinuxBox() {
  if (boxReady) return boxReady;
  const up = await sh("docker start lxverify 2>/dev/null || docker run -d --name lxverify ubuntu:24.04 sleep infinity");
  if (!up.ok) { boxReady = false; return false; }
  // tool bundle for command -v coverage
  await sh(`docker exec lxverify bash -c 'apt-get update -qq >/dev/null 2>&1; DEBIAN_FRONTEND=noninteractive apt-get install -y -qq curl wget git jq rsync openssh-client dnsutils iproute2 iputils-ping net-tools procps psmisc sysstat file xxd zip unzip tar gzip bzip2 xz-utils findutils grep sed gawk diffutils coreutils util-linux mount sudo cron tmux screen less tree sqlite3 lsof strace ltrace pciutils usbutils hdparm ethtool netcat-openbsd socat traceroute mtr-tiny whois xz-utils libarchive-tools p7zip-full rclone ncdu fd-find ripgrep bat fzf moreutils pv lz4 zstd nmap npm nodejs python3 python3-pip golang-go rustc cargo ffmpeg imagemagick pandoc vim nano tmux htop iotop iftop nethogs ncdu aria2 axel w3m lynx docker.io kubectl helm kubectl 2>/dev/null | tail -1; echo READY'`, { timeout: 600000 });
  boxReady = true;
  return true;
}

// ---------- per-row gates ----------
async function syntaxUnix(cmd) {
  const r = await run("bash", ["-n", "-c", cmd], { timeout: 5000 }).then(() => true).catch(() => false);
  if (r) return true;
  return run("zsh", ["-n", "-c", cmd], { timeout: 5000 }).then(() => true).catch(() => false);
}

async function execDarwin(cmd, intent) {
  if (!hostSafe(cmd)) return null;
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "lxv-"));
  try {
    const r = await run("/bin/zsh", ["-c", `cd "${dir}" && mkdir -p sub "dir with space" && touch a.txt b.log "my file.txt" sub/c.md && printf 'l1\\nl2\\nerror l3\\n' > a.txt && ${cmd}`], { timeout: 8000, maxBuffer: 1 << 20 });
    return { exit: 0, out: (r.stdout || "").slice(0, 300) };
  } catch (e) {
    return { exit: e.code ?? -1, out: (e.stdout || "").slice(0, 300), err: (e.stderr || "").slice(0, 200) };
  } finally {
    await fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function execLinux(cmd) {
  const script = `cd /tmp && rm -rf fx && mkdir -p fx/sub && cd fx && touch a.txt b.log 'my file.txt' sub/c.md && printf 'l1\\nl2\\nerror l3\\n' > a.txt && timeout 8 bash -c ${JSON.stringify(cmd)}`;
  const r = await sh(`docker exec lxverify bash -c ${JSON.stringify(script)}`, { timeout: 20000 });
  return { exit: r.ok ? 0 : 1, out: r.out.slice(0, 300), err: r.err.slice(0, 200) };
}

// ---------- main ----------
async function main() {
  const rows = fs.readFileSync(IN, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const todo = LIMIT ? rows.slice(0, LIMIT) : rows;

  // T1 syntax (unix rows local; windows rows remote-batched)
  const unixRows = todo.filter((r) => r.os_hint !== "windows");
  const winRows = todo.filter((r) => r.os_hint === "windows");

  // windows syntax via remote pwsh AST parse — batch 200/request
  let winSyntax = new Map();
  if (winRows.length) {
    const probe = await sshWin('"ok"');
    if (probe.ok) {
      for (let i = 0; i < winRows.length; i += 150) {
        const chunk = winRows.slice(i, i + 150);
        const payload = Buffer.from(JSON.stringify(chunk.map((r, j) => ({ j, c: r.command }))), "utf8").toString("base64");
        const res = await sshWin(`$d=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${payload}'))|ConvertFrom-Json; foreach($r in $d){ $e=$null; [void][System.Management.Automation.Language.Parser]::ParseInput($r.c,[ref]$null,[ref]$e); if($e.Count){"BAD $($r.j)"}else{"OK $($r.j)"} }`, 120000);
        for (const l of res.out.split(/\r?\n/)) { const m = /^(OK|BAD) (\d+)/.exec(l.trim()); if (m) winSyntax.set(`${i + Number(m[2])}`, m[1] === "OK"); }
      }
      console.error(`windows syntax: ${winRows.length} parsed remotely`);
    } else console.error("win-pc unreachable — windows rows skip syntax/bin gates (kept, flagged)");
  }

  // head maps per OS
  const headsByOs = { darwin: new Set(), linux: new Set(), windows: new Set() };
  for (const r of todo) {
    const hs = cmdHeads(r.command);
    for (const o of ["darwin", "linux", "windows"]) {
      const hinted = r.os_hint === o || r.os_hint === "any-unix" && o !== "windows" || r.os_hint === "any";
      if (hinted) hs.forEach((h) => headsByOs[o].add(h));
    }
  }
  const binMaps = {};
  for (const o of ["darwin", "linux", "windows"]) {
    const heads = [...headsByOs[o]];
    if (!heads.length) { binMaps[o] = {}; continue; }
    if (o === "windows" && winSyntax.size === 0 && !(await sshWin('"ok"')).ok) { binMaps[o] = null; continue; }
    const map = {};
    for (let i = 0; i < heads.length; i += 400) {
      Object.assign(map, await mapHeads(heads.slice(i, i + 400), o));
      console.error(`${o} heads ${Math.min(i + 400, heads.length)}/${heads.length}`);
    }
    binMaps[o] = map;
  }

  // exec sample selection for linux/darwin
  const execIdx = new Set();
  if (DO_EXEC) {
    const pool = [...todo.keys()];
    for (let i = 0; i < Math.min(EXEC_SAMPLE, pool.length); i++) execIdx.add(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }

  const out = fs.createWriteStream(OUT);
  const stats = { kept: 0, drop_syntax: 0, drop_head: 0, drop_flag: 0, drop_exec: 0, perOs: {} };
  let idx = -1;
  const queue = [...todo.keys()];
  async function worker() {
    while (queue.length) {
      const k = queue.pop();
      const r = todo[k];
      const isWin = r.os_hint === "windows";
      const v = { syntax: null, heads: {}, flags: "skip", exec: null };

      if (isWin) {
        v.syntax = winSyntax.size ? (winSyntax.get(k) !== false) : null;
        if (binMaps.windows) for (const h of cmdHeads(r.command)) v.heads[h] = binMaps.windows[h] ?? "unknown";
      } else {
        v.syntax = await syntaxUnix(r.command);
        for (const osK of ["darwin", "linux"]) {
          const hinted = r.os_hint === osK || r.os_hint === "any-unix" || r.os_hint === "any";
          if (!hinted) continue;
          for (const h of cmdHeads(r.command)) v.heads[`${osK}:${h}`] = binMaps[osK]?.[h] ?? "unknown";
        }
      }

      const pol = applyPolicyToPlan({ commands: [{ command: r.command, intent: "", risk: "low", requires_confirmation: false, platform: isWin ? "windows" : "unix" }] }, { shell: isWin ? "powershell" : "bash" });

      const osPasses = [];
      const headFails = (osK) => cmdHeads(r.command).filter((h) => v.heads[`${osK}:${h}`] === false);
      if (!isWin && v.syntax) {
        for (const osK of ["darwin", "linux"]) {
          const hinted = r.os_hint === osK || r.os_hint === "any-unix" || r.os_hint === "any";
          if (!hinted) continue;
          const missing = headFails(osK);
          const fc = flagCheck(osK, cmdHeads(r.command)[0], r.command);
          v.flags = fc;
          if (missing.length === 0 && fc !== `bad` && !String(fc).startsWith("bad:")) osPasses.push(osK);
        }
      } else if (isWin) {
        const missing = Object.values(v.heads).filter((x) => x === false).length;
        if ((v.syntax !== false) && missing === 0) osPasses.push("windows");
      }

      if (osPasses.length && DO_EXEC && execIdx.has(k)) {
        const target = osPasses[0];
        const er = target === "linux" ? await execLinux(r.command)
          : target === "darwin" && hostSafe(r.command) ? await execDarwin(r.command) : null;
        if (er) { v.exec = er; if (er.exit !== 0 && pol.readonly) { /* readonly shouldn't crash */ osPasses.splice(osPasses.indexOf(target), 1); } }
      }

      if (!osPasses.length) { if (v.syntax === false) stats.drop_syntax++; else if (Object.values(v.heads).some((x) => x === false)) stats.drop_head++; else stats.drop_flag++; }
      else stats.kept++;
      for (const o of osPasses) stats.perOs[o] = (stats.perOs[o] || 0) + 1;

      const row = { ...r, os: osPasses, risk: pol.maxRisk, readonly: pol.readonly, verified: v };
      out.write(JSON.stringify(row) + "\n");
      if ((stats.kept + stats.drop_syntax + stats.drop_head + stats.drop_flag + stats.drop_exec) % 2000 === 0) console.error(JSON.stringify(stats));
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  await new Promise((res) => out.end(res));
  console.error("FINAL " + JSON.stringify(stats));
}

main().catch((e) => { console.error(e); process.exit(1); });
