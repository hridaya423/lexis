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


R3_STYLE = """
This round, make the requests harder than the obvious ones: more specific, with two or three constraints
("only .png files over 2MB modified this week, newest first"), follow-up phrasing ("same but recursive"),
occasional typos and missing words the way people really type, and some vague ones ("my disk is full, what's
taking the space"). Still ONE command per request, and still the simplest correct command for it.
"""


# Round 4: tool clusters the 1.5B/0.5B failure audit showed the models don't know or misuse.
AREAS_R4 = {
    "darwin": [
        "unified logging: log show / log stream with --predicate, --last, --style, --info; reading app and system logs",
        "copying and archiving the mac way: ditto (incl. -c -k --keepParent), cp -R vs cp -a differences, rsync shipped with macOS",
        "Finder-level file state: chflags (hidden/nohidden/uchg), xattr, SetFile-free alternatives, ~/.Trash, mdls, GetFileInfo-free alternatives",
        "Spotlight and file search: mdfind (-onlyin, -name, kMDItem queries), find on BSD (no -printf, -E, -mtime/-newer), locate on macOS",
        "who and where: whois, dig, host, nslookup, scutil --dns, dscacheutil -flushcache, networksetup -getinfo, route -n get default",
        "ssh agent and keys on mac: ssh-add -l/-D/--apple-use-keychain, ssh-keygen -l -f, ~/.ssh/config, ssh -G",
        "developer versions and paths: xcodebuild -version, xcode-select -p, xcrun --find, sw_vers, uname -m, sysctl -n machdep.cpu.brand_string",
        "BSD process and resource tools: ps -axo with -r/-m sorting (no --sort), top -l 1 -o cpu, vm_stat, sysctl hw.memsize, lsof -nP",
        "BSD text tools precision: sed -i '', date -j -f / -v, stat -f, sort -r/-h/-k, head/tail, wc, base64 -i, md5 vs shasum -a 256",
        "power, display and devices: pmset -g (read) vs pmset changes, caffeinate, system_profiler data types, ioreg battery, diskutil list/info",
    ],
    "linux": [
        "finding files fast and precisely: locate/plocate and updatedb, find -printf/-newermt/-size/-mmin, fd if installed, lsof +L1 for deleted-but-open files",
        "ACLs and special permissions: getfacl, setfacl -m/-d/-x/-R, chattr/lsattr, umask, setuid/setgid/sticky bits",
        "network interfaces and routes with iproute2: ip link set up/down, ip addr add/del, ip route, ip neigh, ss -tulpn, mtr --report, tracepath",
        "kernel modules and kernel state: lsmod, modinfo, modprobe and modprobe -r, /etc/modules-load.d, sysctl -a/-w, dmesg -T --level",
        "name service and accounts: getent passwd/group/hosts, id, groups, usermod -aG, chage -l, last/lastb, who, w",
        "package managers by distro: apt/apt-cache/dpkg -L/-S on Ubuntu, dnf/rpm -qf on Fedora, pacman -Ss/-Qi/-Qo/-Rns on Arch, zypper on openSUSE (the request names the distro or the context makes it clear)",
        "ssh in depth on linux: ssh -G, ssh -J, -L/-R/-D forwards with -N, ssh-copy-id, ssh-keyscan, known_hosts cleanup with ssh-keygen -R",
        "desktop integration: wl-copy/wl-paste on Wayland vs xclip -selection clipboard/xsel on X11, xdg-open, notify-send, gsettings get/set",
        "GNU text tools precision: sort -rn/-h/-k/-t, uniq -c/-d/-D, grep -i/-w/-r/-l/-c/-P/-o, cut, awk field math, sed -n with addresses, tr, comm, join",
        "bash builtins and shell state: type, command -v, hash, alias, export, set -o, shopt, ulimit, read, printf, history, fc, jobs, disown, trap",
    ],
    "windows": [
        "power and sleep diagnostics: powercfg /lastwake, /requests, /a, /batteryreport, /energy, /waketimers, /list, /change",
        "Windows Update and servicing: Get-WindowsUpdateLog, Get-HotFix, wuauclt-free alternatives, UsoClient, DISM /Online /Get-Packages, sfc /scannow",
        "event logs precisely: Get-WinEvent -FilterHashtable (LogName, Id, Level, StartTime), -MaxEvents with newest-first default, wevtutil qe/el",
        "networking cmdlets and native tools: Get-NetAdapter, Get-NetIPConfiguration, Get-DnsClientServerAddress, Clear-DnsClientCache, Test-NetConnection -Port, Get-NetTCPConnection -State Listen, netsh wlan show, arp -a, route print, tracert, pathping",
        "firewall and sharing: Get-NetFirewallRule with filters, New-NetFirewallRule, Set-NetFirewallProfile, Get-SmbShare, netsh advfirewall",
        "processes precisely: Get-Process | Sort-Object CPU/WS -Descending | Select-Object -First N, Stop-Process -Name/-Id, taskkill /F /PID /IM, tasklist /svc",
        "files with exact constraints: Get-ChildItem -Recurse -File -Filter/-Include, Where-Object Length/LastWriteTime, Sort-Object -Descending, Measure-Object -Sum, Select-String -SimpleMatch/-CaseSensitive",
        "PackageManagement vs winget: Find-Package/Install-Package/Uninstall-Package, Get-Package, winget search/show/list/upgrade/uninstall, Get-AppxPackage",
        "system info and hardware: Get-CimInstance Win32_* classes, Get-ComputerInfo -Property, systeminfo, wmic-free alternatives, Get-PnpDevice, Get-PhysicalDisk",
        "PowerShell 5.1-safe syntax: chaining with ; and if ($?) instead of &&, here-strings, -f formatting, splatting, ForEach-Object, Get-Date -Format",
    ],
}


R4_STYLE = """
This round targets tools and details small models get wrong. For every tool in the topic, cover its common real
subcommands and flags across several requests, not just the most famous one. Make the details matter:
ordering ("biggest first", "newest first"), case ("any capitalization"), counts ("top 5"), units, output format
("as json", "wide"), and scope ("only this folder", "recursive"). The command must honour every detail exactly.
About 1 in 5 requests should be look-only ("show", "preview", "without changing anything"); those get commands that
change nothing (no -i, no >, no in-place conversion). Never use a flag unless you are certain it exists on this
platform's version of the tool.
"""


def shard(outdir, round2=False, round3=False, round4=False):
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    i = 0
    if round4:
        for os_key, areas in AREAS_R4.items():
            os_name, shell, tooling = PLATFORMS[os_key]
            for area in areas:
                sid = f"shard_{i:03d}"
                prompt = PROMPT.format(os_name=os_name, shell=shell, tooling=tooling, area=area, n=PER_SHARD, sid=sid)
                (out / f"{sid}.prompt.md").write_text(prompt.replace("\nRequests:\n", R4_STYLE + "\nRequests:\n", 1))
                (out / f"{sid}.meta.json").write_text(json.dumps({"os": os_key, "area": area, "round": 4}))
                i += 1
        print(f"{i} shards -> {out}")
        return
    if round3:
        for area in AREAS:
            for os_key, (os_name, shell, tooling) in PLATFORMS.items():
                sid = f"shard_{i:03d}"
                prompt = PROMPT.format(os_name=os_name, shell=shell, tooling=tooling, area=area, n=PER_SHARD, sid=sid)
                (out / f"{sid}.prompt.md").write_text(prompt.replace("\nRequests:\n", R3_STYLE + "\nRequests:\n", 1))
                (out / f"{sid}.meta.json").write_text(json.dumps({"os": os_key, "area": area, "round": 3}))
                i += 1
        print(f"{i} shards -> {out}")
        return
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


def collect(outdir, outpath=None):
    seen, n, bad = set(), 0, 0
    with open(outpath or DATA / "distill_raw.jsonl", "w", encoding="utf-8") as f:
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
    {"shard": shard, "shard2": lambda d: shard(d, True), "shard3": lambda d: shard(d, round3=True), "shard4": lambda d: shard(d, round4=True), "collect": collect}[sys.argv[1]](*sys.argv[2:3], *(sys.argv[3:] or []))
