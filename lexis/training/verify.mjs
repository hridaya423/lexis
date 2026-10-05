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
    .filter((h) => !/^[/~.$({"'[@&-]/.test(h));
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
// heads that always pass existence: shell keywords/builtins + known
// distro-specific tools absent from the ubuntu fixture container
const ALWAYS_OK = new Set(
  ("if then else elif fi for while until do done case esac function select time { } [ ] test while foreach try catch trap break continue return exit shift wait source alias unalias export readonly local set unset eval exec cd pwd echo printf true false sudo env command builtin xargs " +
   "dnf yum pacman zypper snap flatpak rpm urpmi xbps-install nix-env emerge apk dnf5 microdnf pacman-key yay paru scoop " +
   "foreach where measure tee% select-object while-object").split(" "));

const FLAGDB_RAW = fs.existsSync(FLAGDB_PATH) ? JSON.parse(fs.readFileSync(FLAGDB_PATH, "utf8")) : {};
const FLAGDB = Object.fromEntries(Object.entries(FLAGDB_RAW).map(([o, m]) =>
  [o, Object.fromEntries(Object.entries(m).map(([h, f]) => [h, new Set(f)]))]));
function flagsOf(cmd) {
  return [...String(cmd).matchAll(/(?:^|\s)(-{1,2}[A-Za-z][\w-]*)/g)].map((m) => m[1].replace(/^-+/, "-").replace(/^--/, "-"));
}
// usage dbs (crosslabel.py usage_db: option-definition lines only) beat flagdb's whole-man-page scrape
const USAGE = Object.fromEntries(["darwin", "linux"].map((o) => {
  try {
    const db = JSON.parse(fs.readFileSync(path.join(DATA, `${o}_usage.json`), "utf8"));
    return [o, Object.fromEntries(Object.entries(db).map(([h, d]) =>
      [h, Object.assign(new Set([...d.short.map((c) => `-${c}`), ...d.long.map((l) => `--${l}`)]), { args: new Set(d.arg) })]))];
  } catch { return [o, {}]; }
}));
const SINGLE_DASH_LONG = new Set(["kill", "pkill", "killall", "echo", "printf", "test", "find", "java", "ffmpeg", "ffprobe", "openssl", "xcodebuild", "magick", "convert", "iptables", "ip", "tc", "gcc", "clang", "go", "dd"]);
const WRAPPERS = new Set(["xargs", "nohup", "nice", "watch", "time", "env", "timeout"]);
function flagCheck(osKey, _head, cmd) {
  let checked = false;
  for (const seg of String(cmd).replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, "0").split(/\|\||&&|\||;/)) {
    const words = seg.trim().split(/\s+/).filter((w) => w !== "sudo" && !/^[A-Za-z_]+=/.test(w));
    const head = words[0];
    // only the curated classic tools: flagdb's man-page scrape is wrong for subcommand CLIs (git/cargo/npm)
    const db = USAGE[osKey]?.[head];
    if (!db || SINGLE_DASH_LONG.has(head)) continue;
    checked = true;
    for (const w of words.slice(1)) {
      if (w === "--") break;
      if (!/^--?[A-Za-z]/.test(w)) {
        if (WRAPPERS.has(head) && !/^-/.test(w)) break;
        continue;
      }
      const key = w.split("=")[0];
      if (db.has(key)) continue;
      if (key.startsWith("--")) {
        if (![...db.keys()].some((f) => f.startsWith("--") && key.startsWith(f) && f.length > 3)) return `bad:${key}`;
        continue;
      }
      // short cluster: -rn / -sh / -C2 / -t, / -k3,3n -> each letter until the first non-letter (a value)
      for (const c of key.slice(1)) {
        if (!/[A-Za-z]/.test(c)) break;
        if (!db.has(`-${c}`)) return `bad:-${c}`;
        if (db.args?.has(c)) break;
      }
    }
  }
  return checked ? "ok" : "skip";
}

// ---------- binary existence maps ----------
// feed head list on stdin — argv interpolation breaks on quotes/$ in junk heads
async function probeStdin(cmd, heads, timeout = 120000) {
  const out = {};
  try {
    const r = await new Promise((resolve, reject) => {
      const p = execFile(cmd[0], cmd.slice(1), { timeout, maxBuffer: 32 << 20 },
        (e, stdout) => e && !stdout ? reject(e) : resolve(stdout || ""));
      p.stdin.on("error", () => {});
      p.stdin.end(heads.join("\n") + "\n");
    });
    for (const l of r.split(/\r?\n/)) { const m = /^(YES|NO) (.+)$/.exec(l.trim()); if (m) out[m[2]] = m[1] === "YES"; }
  } catch {}
  return out;
}

const PROBE_SH = 'while IFS= read -r h; do [ -n "$h" ] && { command -v "$h" >/dev/null 2>&1 && echo "YES $h" || echo "NO $h"; }; done';

async function mapHeads(heads, osKey) {
  const out = {};
  if (!heads.length) return out;
  heads = heads.filter((h) => {
    if (ALWAYS_OK.has(h)) { out[h] = true; return false; }
    return true;
  });
  if (osKey === "darwin") {
    Object.assign(out, await probeStdin(["bash", "-c", PROBE_SH], heads));
  } else if (osKey === "linux") {
    await ensureLinuxBox();
    Object.assign(out, await probeStdin(["docker", "exec", "-i", "lxverify", "bash", "-c", PROBE_SH], heads));
  } else if (osKey === "windows") {
    // heads are junk-tolerant: strip ps-hostile chars, send as literal array
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
  const up = await sh("docker start lxverify 2>/dev/null || docker run -d --name lxverify lxverify:tools sleep infinity");
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
  const script = `cd /tmp && rm -rf fx 2>/dev/null; mkdir -p fx && chmod 700 fx && mkdir -p fx/sub && cd fx && touch a.txt b.log 'my file.txt' sub/c.md && printf 'l1\\nl2\\nerror l3\\n' > a.txt && timeout 8 bash -c ${JSON.stringify(cmd)}`;
  const r = await sh(`docker exec -u nobody -e HOME=/tmp/fx lxverify bash -c ${JSON.stringify(script)}`, { timeout: 20000 });
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
      const todoIdx = new Map(todo.map((r, i) => [r, i]));
      // payload is base64'd twice (json, then utf16 -EncodedCommand): 150 rows blew
      // the 32K windows command-line limit and those chunks failed silently
      for (let i = 0; i < winRows.length; i += 30) {
        const chunk = winRows.slice(i, i + 30);
        // key by the row's index in todo, not the windows-subset index
        const payload = Buffer.from(JSON.stringify(chunk.map((r) => ({ k: todoIdx.get(r), c: r.command }))), "utf8").toString("base64");
        const res = await sshWin(`$d=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${payload}'))|ConvertFrom-Json; foreach($r in $d){ $e=$null; [void][System.Management.Automation.Language.Parser]::ParseInput($r.c,[ref]$null,[ref]$e); if($e.Count){"BAD $($r.k)"}else{"OK $($r.k)"} }`, 120000);
        if (!res.ok) console.error(`windows syntax chunk ${i} failed: ${String(res.err).slice(0, 120)}`);
        for (const l of res.out.split(/\r?\n/)) { const m = /^(OK|BAD) (\d+)/.exec(l.trim()); if (m) winSyntax.set(Number(m[2]), m[1] === "OK"); }
      }
      console.error(`windows syntax: ${winSyntax.size}/${winRows.length} parsed remotely`);
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
  const HEADS_CACHE = path.join(DATA, "headmap.json");
  let cached = {};
  try { cached = JSON.parse(fs.readFileSync(HEADS_CACHE, "utf8")); } catch {}
  const binMaps = {};
  for (const o of ["darwin", "linux", "windows"]) {
    const known = cached[o] || {};
    const heads = [...headsByOs[o]];
    if (!heads.length) { binMaps[o] = known; continue; }
    if (o === "windows" && winSyntax.size === 0 && !(await sshWin('"ok"')).ok) { binMaps[o] = known; continue; }
    const map = { ...known };
    const fresh = heads.filter((h) => !(h in map));
    for (let i = 0; i < fresh.length; i += 400) {
      Object.assign(map, await mapHeads(fresh.slice(i, i + 400), o));
      console.error(`${o} heads ${Math.min(i + 400, fresh.length)}/${fresh.length}`);
    }
    binMaps[o] = map;
    cached[o] = map;
    fs.writeFileSync(HEADS_CACHE, JSON.stringify(cached));
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
        v.syntax = winSyntax.has(k) ? winSyntax.get(k) : null;
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
      // unknown heads FAIL (a head we can't confirm on that OS is not verified)
      const headFails = (osK) => cmdHeads(r.command).filter((h) => v.heads[`${osK}:${h}`] !== true);
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
        const bad = cmdHeads(r.command).filter((h) => v.heads[h] !== true).length;
        if (v.syntax === true && bad === 0) {
          osPasses.push("windows");
        } else if (winSyntax.size === 0) {
          // win-pc unreachable: gates unverifiable — keep the row flagged for re-verify
          v.winUnverified = true;
          osPasses.push("windows");
        }
      }

      if (osPasses.length && DO_EXEC && execIdx.has(k)) {
        const target = osPasses[0];
        const er = target === "linux" ? await execLinux(r.command)
          : target === "darwin" && hostSafe(r.command) ? await execDarwin(r.command) : null;
        // a readonly command failing on missing fixture input (grep no-match, ENOENT) is fine; option/usage errors are not
        const optErr = /illegal|invalid|unknown|unrecognized|usage:|command not found/i;
        if (er) { v.exec = er; if (er.exit !== 0 && pol.readonly && optErr.test(er.err || "")) osPasses.splice(osPasses.indexOf(target), 1); }
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
