#!/usr/bin/env python3
"""Normalize + dedupe raw harvest into ~/lx-data/candidates.jsonl.

Drops malformed/junk rows, unifies fields, dedupes on (normalized intent,
normalized command). Keeps source/license/weight/os_hint/shell/task for
downstream verification and splits.
"""
import json, re, sys
from pathlib import Path

RAW = Path.home() / "lx-data" / "raw"
OUT = Path.home() / "lx-data" / "candidates.jsonl"

_ws = re.compile(r"\s+")

# resolved license labels (HF dataset cards / repos), replacing harvest placeholders
LICENSE_FIX = {
    "nl2sh-alfa": "mit", "bash-6k": "apache-2.0", "cmdline-sugg": "bsd-3-clause-clear",
    "bash-cmds": "mit", "nl2shell-v3": "apache-2.0",
    "nl2bash": "unlisted", "nl2bash-custom": "unlisted", "linux-balanced": "unlisted",
    "toolmaxx": "unlisted", "nl2cmd": "unlisted",
}
BAD_CMD = re.compile(r"```|<[^>]*>|^#|\bthat\b.*\bcommand\b", re.I)
GOOD_START = re.compile(r"^[\w$~.({'\"`]|\[|& |! ?", re.I)
NON_SHELL_INTENT = re.compile(r"^(write|explain|what is|how does|create a function|fix this code)\b", re.I)


def norm(s):
    return _ws.sub(" ", (s or "").lower().strip())


def main():
    seen = set()
    kept = dropped = 0
    sources = {}
    with open(OUT, "w", encoding="utf-8") as out:
        for f in sorted(RAW.glob("*.jsonl")):
            for line in open(f, encoding="utf-8"):
                line = line.strip()
                if not line:
                    continue
                try:
                    r = json.loads(line)
                except json.JSONDecodeError:
                    dropped += 1
                    continue
                intent, cmd = (r.get("intent") or "").strip(), (r.get("command") or "").strip()
                if not (3 < len(intent) < 400) or not (2 < len(cmd) < 300):
                    dropped += 1
                    continue
                if BAD_CMD.search(cmd) or not GOOD_START.match(cmd):
                    dropped += 1
                    continue
                key = (norm(intent), norm(cmd))
                if key in seen:
                    dropped += 1
                    continue
                seen.add(key)
                src = r.get("source") or f.stem
                row = {
                    "intent": intent, "command": cmd,
                    "os_hint": r.get("os_hint") or "any-unix",
                    "shell": r.get("shell") or "bash",
                    "source": src,
                    "license": LICENSE_FIX.get(src.split(":")[0], r.get("license") or "unknown"),
                    "weight": float(r.get("weight") or 1.0),
                    "task": r.get("task") or "nl2cmd",
                }
                if r.get("rejected"):
                    row["rejected"] = r["rejected"]
                if r.get("tool"):
                    row["tool"] = r["tool"]
                out.write(json.dumps(row, ensure_ascii=False) + "\n")
                kept += 1
                sources[row["source"]] = sources.get(row["source"], 0) + 1
    sys.stderr.write(f"normalize: kept={kept} dropped={dropped}\n")
    for s, n in sorted(sources.items(), key=lambda x: -x[1]):
        sys.stderr.write(f"  {s:34s} {n}\n")


if __name__ == "__main__":
    main()
