#!/usr/bin/env python3
"""Everyday-request distillation: agent sessions write (request, command) pairs per platform x area.

  shard <outdir>    -> shard_NNN.prompt.md, one per (platform, area); run with para-worker.sh
  collect <outdir>  -> ~/lx-data/distill_raw.jsonl (os/prompt_os/shell set, deduped) for verify.mjs
"""
import json, re, sys
from pathlib import Path
from split import DATA

PER_SHARD = 120
PLATFORMS = {
    "darwin": ("macOS 15", "zsh", "BSD userland as shipped by Apple (no GNU coreutils, no GNU-only flags such as `date -d`, "
               "`sed -i ''` needs the empty suffix, `stat -f`, `find` without -printf). Homebrew is installed as `brew`."),
    "linux": ("Ubuntu 24.04", "bash", "GNU coreutils/findutils/grep/sed, systemd, apt, iproute2 (`ip`, `ss`), no BSD-only flags."),
    "windows": ("Windows 11", "PowerShell 7", "PowerShell cmdlets and pipelines (Get-ChildItem, Select-String, Get-Process, "
                "Get-NetTCPConnection...), plus native exes people really use there (winget, ipconfig, netstat, git, ssh). "
                "No bash syntax, no cmd.exe-only syntax, no Unix tools that Windows lacks."),
}
AREAS = [
    "listing, sizing, finding, renaming, copying and moving files and folders",
    "searching inside files for text or patterns",
    "text processing: counting, sorting, deduplicating, slicing lines and columns, replacing text",
    "processes: what is running, what uses CPU or memory, killing or pausing things",
    "ports and listening services: what is on a port, freeing a port",
    "disk space and storage: free space, biggest folders, mounted volumes",
    "network basics: local and public IP, DNS lookups, ping, reachability, wifi info",
    "HTTP and downloads: fetching files, checking headers, calling APIs",
    "archives and compression: zip, tar, gzip, extracting, listing contents",
    "permissions, ownership and executable bits",
    "environment variables, PATH, shell config and aliases",
    "dates, times, timezones and timestamps",
    "everyday git: status, history, branches, diffs, undoing, remotes, stashing",
    "installing, updating, removing and checking software and packages",
    "services, background jobs, scheduled tasks and startup items",
    "docker and containers",
    "node, npm, python and pip development chores",
    "images, audio and video conversion",
    "logs: reading, following and filtering system and app logs",
    "system info: OS version, hardware, uptime, battery, users, hostname, clipboard and opening apps or folders",
]

PROMPT = """First invoke the `prose` skill and apply it to every request you write: plain human register, no AI tells.
Where prose and the rules below disagree, the rules below win.

You are writing training data for a small model that turns a person's request into ONE terminal command.
Platform: {os_name}, shell: {shell}. Tooling: {tooling}
Topic: {area}.

Write {n} different (request, command) pairs on this topic for this platform.

Requests:
- Written the way real people type into a terminal assistant: mostly lowercase, often terse or a question,
  sometimes first person ("my", "i need"), sometimes slang ("nuke", "what's hogging"), sometimes vague.
- Mix concrete details (file names, ports, package names, URLs, branch names, sizes, dates) with requests that have none.
- Vary openings: no single first word for more than about 1 in 12 requests. Never mention the command or its flags
  unless a real person plausibly would ("grep for TODO").
- Cover the common everyday things people ask most on this topic first, then less common but realistic ones.
- About 1 in 10 should be risky but legitimate (deleting, killing, overwriting, force operations). Still answer with
  the correct command; never refuse, warn or add safety commentary.

Commands:
- Exactly one line, the command an experienced {os_name} user would actually type. Pipelines and `&&` are fine.
- Must be correct on {os_name} as-is: real tools, real flags for THIS platform, correct quoting, no placeholders
  like path/to/file or <name>. Use the names from the request, or sensible defaults (`.`, `~`, current branch).
- Prefer the simplest standard command. Read-only requests get read-only commands. No `sudo` unless required.
- No interactive programs (top, htop, vim, less) unless the request asks for interactive. Prefer one-shot output.

Do not run any shell commands or tools other than reading and writing files; rely on your own knowledge.
Write each pair yourself, one by one. Do NOT write a script, template or loop that generates pairs; programmatic
output is worthless here and will be discarded. Append to {sid}.out.jsonl as JSON lines {{"intent": "...", "command": "..."}}
in batches of about 40 lines per write until it has {n} lines. Do not modify any other file.
When done, print the number of lines in {sid}.out.jsonl."""


AREAS_R2 = {
    "darwin": [
        "defaults read/write and app preferences", "launchctl and launchd agents/daemons", "plist files with plutil and PlistBuddy",
        "Spotlight: mdfind and mdls", "disks and images: diskutil, hdiutil, mounting and ejecting", "network config: networksetup, scutil, ipconfig, wifi",
        "power and sleep: pmset, caffeinate, battery", "security: codesign, spctl, xattr and quarantine, keychain with security",
        "media on mac: sips, afconvert, say, screencapture", "clipboard and opening things: pbcopy, pbpaste, open, Finder reveal",
        "Time Machine (tmutil), softwareupdate and system versions", "Xcode tools: xcode-select, xcrun, simctl, swift build",
        "Homebrew in depth: services, casks, taps, pins, cleanup", "BSD userland text and file tools used correctly on macOS (sed -i '', stat -f, date -v, find -E)",
        "Bluetooth, Bonjour (dns-sd) and notifications (osascript display notification)"],
    "linux": [
        "systemd units, timers and journalctl in depth", "apt, dpkg, snap and flatpak package management", "ip, ss, nmcli, resolvectl and DNS",
        "block devices and mounts: lsblk, blkid, mount, fstab, df", "users, groups, sudo and passwords", "cron, at and systemd timers for scheduling",
        "kernel and hardware: uname, sysctl, modprobe, lsmod, dmesg, lspci, lsusb", "firewall: ufw and iptables/nftables",
        "links, permissions, ACLs and special bits", "GNU-only flags used correctly (find -printf, sed -i, date -d, stat -c, du --max-depth, sort -h, grep -P)",
        "clipboard and desktop integration: xclip, xsel, wl-copy, xdg-open, notify-send", "lsof, fuser, strace, ps and /proc inspection",
        "memory and swap: free, vmstat, swapon, /proc/meminfo, top in batch mode", "logs in /var/log, logrotate, tail and grep on logs",
        "docker and docker compose on a linux server"],
    "windows": [
        "services: Get-Service, Start/Stop/Restart-Service, Set-Service, sc.exe", "registry: Get-ItemProperty, Set-ItemProperty, New-Item, reg.exe",
        "event logs: Get-WinEvent with filters", "networking: Get-NetIPAddress, Test-NetConnection, Resolve-DnsName, Get-NetTCPConnection, ipconfig, netsh",
        "disks, volumes and partitions: Get-Volume, Get-Disk, Get-PSDrive, fsutil", "scheduled tasks: Get/Register/Unregister-ScheduledTask, schtasks",
        "environment variables: $env:, [Environment]::SetEnvironmentVariable, setx, PATH edits", "file content ops: Get-Content -Tail/-Wait, Select-String, Set-Content, Add-Content, Out-File",
        "files and folders: Get-ChildItem filters, Copy/Move/Remove/Rename-Item, sizes with Measure-Object", "hashing, certificates and signatures: Get-FileHash, Cert:, Get-AuthenticodeSignature",
        "packages: winget, choco, scoop, Get-Package, Install-Module", "system repair and info: DISM, sfc, Get-ComputerInfo, systeminfo, Get-CimInstance",
        "WSL, Hyper-V and virtualization", "symlinks, junctions and hard links with New-Item and mklink", "firewall rules, users and groups: New-NetFirewallRule, Get-LocalUser, Get-LocalGroupMember"],
    "any": [
        "advanced git: rebase, reflog, bisect, worktrees, tags, submodules, cherry-pick", "json and yaml with jq and yq", "ssh, scp, rsync, keys and tunnels",
        "curl against APIs: auth headers, JSON bodies, uploads, status codes", "encoding and hashing: base64, hex, iconv, checksums",
        "kubectl day-to-day", "python environments: venv, pip, uv, pipx", "node toolchains: npm, pnpm, yarn, npx scripts",
        "text pipelines combining awk, sed, sort, uniq, cut, tr, paste, column"],
}


def shard(outdir, round2=False):
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    i = 0
    if round2:
        for os_key, (os_name, shell, tooling) in PLATFORMS.items():
            for area in AREAS_R2[os_key] + AREAS_R2["any"]:
                sid = f"shard_{i:03d}"
                (out / f"{sid}.prompt.md").write_text(PROMPT.format(os_name=os_name, shell=shell, tooling=tooling, area=area, n=PER_SHARD, sid=sid))
                (out / f"{sid}.meta.json").write_text(json.dumps({"os": os_key, "area": area}))
                i += 1
        print(f"{i} shards -> {out}")
        return
    for area in AREAS:
        for os_key, (os_name, shell, tooling) in PLATFORMS.items():
            sid = f"shard_{i:03d}"
            (out / f"{sid}.prompt.md").write_text(PROMPT.format(os_name=os_name, shell=shell, tooling=tooling, area=area, n=PER_SHARD, sid=sid))
            (out / f"{sid}.meta.json").write_text(json.dumps({"os": os_key, "area": area}))
            i += 1
    print(f"{i} shards -> {out}")


SHELL = {"darwin": "zsh", "linux": "bash", "windows": "powershell"}


def collect(outdir):
    seen, n, bad = set(), 0, 0
    with open(DATA / "distill_raw.jsonl", "w", encoding="utf-8") as f:
        for meta in sorted(Path(outdir).glob("shard_*.meta.json")):
            m = json.loads(meta.read_text())
            outp = meta.with_name(meta.name.replace(".meta.json", ".out.jsonl"))
            if not outp.exists():
                continue
            for line in outp.read_text(encoding="utf-8").splitlines():
                try:
                    r = json.loads(line)
                    intent, cmd = r["intent"].strip(), r["command"].strip()
                except (ValueError, KeyError, AttributeError):
                    bad += 1
                    continue
                key = (m["os"], re.sub(r"\W+", " ", intent.lower()).strip())
                if not intent or not cmd or "\n" in cmd or key in seen:
                    bad += 1
                    continue
                seen.add(key)
                f.write(json.dumps({"intent": intent, "command": cmd, "os": [m["os"]], "prompt_os": m["os"],
                                    "shell": SHELL[m["os"]], "source": "distill:swe2", "license": "own", "weight": 1,
                                    "os_hint": m["os"]}, ensure_ascii=False) + "\n")
                n += 1
    print(f"collect: {n} rows, {bad} dropped (bad json/empty/multiline/dup)")


if __name__ == "__main__":
    {"shard": shard, "shard2": lambda d: shard(d, True), "collect": collect}[sys.argv[1]](sys.argv[2])
