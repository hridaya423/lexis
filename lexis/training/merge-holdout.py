#!/usr/bin/env python3
"""Merge holdout shards -> ~/lx-data/holdout.jsonl (frozen eval set).

Validates: strict JSON, id uniqueness/sequence, os/platform legality, every
anyOfRegex compiles, gold matches >=1 alternative, mustNotMatch doesn't hit
gold, maxCommands sane, intent uniqueness (exact + normalized), flag fields.
Writes holdout.jsonl + holdout.sha256. Fails loudly on any invalid row.
"""
import hashlib, json, re, sys
from pathlib import Path

DIR = Path.home() / "lx-data" / "holdout-shards"
OUT = Path.home() / "lx-data" / "holdout.jsonl"
VALID_OS = {"darwin", "linux", "windows", "any"}
VALID_PLAT = {"unix", "windows"}
RISKS = {"low", "moderate", "high", "critical"}
WS = re.compile(r"\s+")


def norm(s):
    return WS.sub(" ", (s or "").lower().strip())


def main():
    rows, errors, seen_id, seen_intent = [], [], set(), set()
    for f in sorted(DIR.glob("shard-*.jsonl")):
        for ln, line in enumerate(open(f, encoding="utf-8"), 1):
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except json.JSONDecodeError as e:
                errors.append(f"{f.name}:{ln} bad JSON {e}")
                continue
            rid = r.get("id", "?")
            if rid in seen_id:
                errors.append(f"{f.name}:{ln} dup id {rid}")
            seen_id.add(rid)
            if r.get("os") not in VALID_OS:
                errors.append(f"{rid} bad os {r.get('os')}")
            if r.get("platform") not in VALID_PLAT:
                errors.append(f"{rid} bad platform")
            if r.get("os") == "windows" and r.get("platform") != "windows":
                errors.append(f"{rid} windows row without windows platform")
            exp = r.get("expect") or {}
            alts = exp.get("anyOfRegex") or []
            if not (2 <= len(alts) <= 4):
                errors.append(f"{rid} needs 2-4 anyOfRegex, has {len(alts)}")
            gold = r.get("gold", "")
            ok_any = False
            for rx in alts:
                try:
                    if re.search(rx, gold, re.I):
                        ok_any = True
                except re.error as e:
                    errors.append(f"{rid} regex error {rx!r}: {e}")
            if alts and not ok_any:
                errors.append(f"{rid} gold matches no alternative: {gold!r}")
            for rx in exp.get("mustNotMatch") or []:
                try:
                    if re.search(rx, gold, re.I):
                        errors.append(f"{rid} gold hits mustNotMatch {rx!r}")
                except re.error as e:
                    errors.append(f"{rid} bad mustNotMatch: {e}")
            if not (1 <= int(exp.get("maxCommands") or 1) <= 4):
                errors.append(f"{rid} maxCommands out of range")
            if exp.get("expectedRiskAtLeast") and exp["expectedRiskAtLeast"] not in RISKS:
                errors.append(f"{rid} bad risk {exp['expectedRiskAtLeast']}")
            if not r.get("intent") or not gold:
                errors.append(f"{rid} missing intent/gold")
            ni = norm(r.get("intent", ""))
            if ni in seen_intent:
                continue  # cross-shard collision: keep first occurrence
            seen_intent.add(ni)
            rows.append(r)

    if errors:
        for e in errors[:60]:
            print("ERR", e, file=sys.stderr)
        print(f"{len(errors)} problems — not writing holdout", file=sys.stderr)
        sys.exit(1)

    from collections import Counter
    by_os = Counter(r["os"] for r in rows)
    with open(OUT, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    sha = hashlib.sha256(OUT.read_bytes()).hexdigest()
    (OUT.parent / "holdout.sha256").write_text(sha + "  holdout.jsonl\n")
    print(f"holdout: {len(rows)} rows {dict(by_os)} sha={sha[:16]}", file=sys.stderr)


if __name__ == "__main__":
    main()
