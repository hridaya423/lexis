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

Write each pair yourself, one by one. Do NOT write a script, template or loop that generates pairs; programmatic
output is worthless here and will be discarded. Append to {sid}.out.jsonl as JSON lines {{"intent": "...", "command": "..."}}
in batches of about 40 lines per write until it has {n} lines. Do not modify any other file.
When done, print the number of lines in {sid}.out.jsonl."""


def shard(outdir):
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    i = 0
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
    {"shard": shard, "collect": collect}[sys.argv[1]](sys.argv[2])
