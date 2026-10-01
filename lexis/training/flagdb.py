#!/usr/bin/env python3
"""Build flagdb.json — allowed short/long flags per command head per OS.

darwin: parses local man pages (--help fallback).
linux:  parses `--help` inside the lxverify container (docker must be up).
windows: parses `Get-Help` synopsis text on win-pc (ssh) — best effort.

Usage: flagdb.py [--os darwin|linux] --heads "a.txt" | --top candidates.jsonl
"""
import json, re, subprocess, sys
from collections import Counter
from pathlib import Path

DATA = Path.home() / "lx-data"
OUT = DATA / "flagdb.json"
FLAG_RE = re.compile(r"(?<![\w/])(-{1,2}[a-zA-Z][\w-]*)")


def flags_from_text(text):
    out = set()
    for m in FLAG_RE.finditer(text or ""):
        f = m.group(1)
        if len(f) <= 20 and not re.search(r"(\d{4}|\{)", f):
            out.add(f.split("=")[0])
    return out


def darwin_flags(heads):
    db = {}
    for h in heads:
        text = ""
        try:
            text = subprocess.run(["man", h], capture_output=True, text=True, timeout=8).stdout
        except Exception:
            pass
        if not text.strip():
            try:
                text = subprocess.run(["sh", "-c", f"{h} --help 2>&1 || {h} -h 2>&1"], capture_output=True, text=True, timeout=8).stdout
            except Exception:
                pass
        fs = flags_from_text(text)
        if fs:
            db[h] = sorted(fs)
    return db


def linux_flags(heads):
    db = {}
    joined = " ".join(heads)
    cmd = ["docker", "exec", "lxverify", "bash", "-c",
           f'for h in {joined}; do echo "## $h"; ($h --help 2>&1 || man $h 2>/dev/null | col -b) | head -120; done']
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=600).stdout
    except Exception:
        return db
    cur = None
    for line in out.splitlines():
        if line.startswith("## "):
            cur = line[3:].strip()
            db.setdefault(cur, set())
        elif cur:
            db[cur] |= flags_from_text(line)
    return {k: sorted(v) for k, v in db.items() if v}


def top_heads(cand, n=200):
    heads = Counter()
    for line in open(cand, encoding="utf-8"):
        try:
            cmd = json.loads(line).get("command", "")
        except Exception:
            continue
        seg0 = cmd.split("|")[0].split(";")[0].split("&&")[0].strip().split()
        if seg0:
            heads[re.sub(r"^\(|\)$", "", seg0[0])] += 1
    return [h for h, _ in heads.most_common(n)]


if __name__ == "__main__":
    args = sys.argv[1:]
    os_arg = args[args.index("--os") + 1] if "--os" in args else "all"
    heads = top_heads(DATA / "candidates.jsonl") if "--top" in args else open(args[args.index("--heads") + 1]).read().split()
    db = json.load(open(OUT)) if OUT.exists() else {}
    if os_arg in ("darwin", "all"):
        db["darwin"] = darwin_flags(heads)
        print(f"darwin: {len(db['darwin'])} heads", file=sys.stderr)
    if os_arg in ("linux", "all"):
        db["linux"] = linux_flags(heads)
        print(f"linux: {len(db['linux'])} heads", file=sys.stderr)
    OUT.write_text(json.dumps(db, indent=1))
    print(f"wrote {OUT}", file=sys.stderr)
