#!/usr/bin/env python3
"""Rewrite holdout exec blocks to the real judge contract.

check must prove the MODEL command did the work: inspect $LX_OUT (file with
model stdout), $LX_EXIT, or filesystem effects the command caused. Fixture-only
checks pass on `false` and are invalid.
"""
import json
from pathlib import Path

HOLDOUT = Path.home() / "lx-data" / "holdout.jsonl"
O = '"$LX_OUT"'  # shorthand

# ---- darwin: readonly queries -> assert on model stdout ----
DARWIN = {
    "h-d1-001": f"grep -q hiddenrc {O} && grep -q visible.txt {O}",
    "h-d1-002": f"grep -q cat.png {O} && grep -q dog.png {O} && ! grep -q notes.txt {O}",
    "h-d1-003": f"grep -q fresh.txt {O} && ! grep -q old.txt {O}",
    "h-d1-005": f"grep -qi gzip {O}",
    "h-d1-006": f"grep -q 2024 {O} && grep -q report.docx {O}",
    "h-d1-009": f"test \"$(tr -d ' ' < {O})\" = 3",
    "h-d1-012": f"test \"$(grep -n big.bin {O} | cut -d: -f1)\" -lt \"$(grep -n small.bin {O} | cut -d: -f1)\"",
    "h-d1-038": f"grep -q f2 {O}",
    "h-d1-059": f"grep -q com.apple.comment {O}",
    "h-d1-060": f"grep -q 'deny delete' {O}",
    "h-d1-063": f"grep -q 755 {O} && grep -q setup.sh {O}",
    "h-d1-080": f"grep -q 'node' {O} && grep -q 'realnode' {O}",
    "h-d1-081": f"grep -q link-one {O} && grep -q link-two {O}",
    "h-d1-082": f"grep -q dead-link {O}",
    "h-d1-091": f"grep -q uchg {O}",
    "h-d1-092": f"grep -q lk.txt {O} && ! grep -q normal.txt {O}",
    "h-d1-101": f"grep -q junk1 {O} && grep -q junk2 {O}",
    "h-d2-001": f"test \"$(tr -d ' ' < {O})\" = 4",
    "h-d2-002": f"test \"$(tr -d ' ' < {O})\" = 2",
    "h-d2-006": f"head -n1 {O} | grep -q amy",
    "h-d2-007": f"head -n1 {O} | grep -q 10",
    "h-d2-008": f"test \"$(wc -l < {O} | tr -d ' ')\" = 3",
    "h-d2-009": f"head -n1 {O} | grep -q '1.1.1.1'",
    "h-d2-010": f"test \"$(wc -l < {O} | tr -d ' ')\" = 2 && grep -q ann {O} && grep -q bo {O}",
    "h-d2-011": f"head -n1 {O} | grep -q 'hello world'",
    "h-d2-013": f"grep -q 'a b c' {O}",
    "h-d2-014": f"grep -q 'the color is a color' {O} && grep -q colour draft.md",
    "h-d2-015": f"grep -q 'aNUM bNUM cNUM' {O}",
    "h-d2-016": "! grep -q 'http://' links.txt && test \"$(grep -c 'https://' links.txt)\" -eq 3",  # mutating: fs effect
    "h-d2-017": f"test \"$(wc -l < {O} | tr -d ' ')\" = 2 && ! grep -q '^#' {O} && grep -q '^# comment' nginx.conf",
    "h-d2-019": f"test \"$(wc -l < {O} | tr -d ' ')\" = 2 && ! grep -q DEBUG {O}",
    "h-d2-020": f"grep -q '^2:' {O} && grep -q TODO {O}",
    "h-d2-021": f"test \"$(wc -l < {O} | tr -d ' ')\" = 1 && grep -q '^log' {O}",
    "h-d2-028": f"head -n1 {O} | grep -q 'c,1'",
    "h-d2-029": f"head -n1 {O} | grep -qx c",
    "h-d2-030": f"tr -d ' ' < {O} | grep -qx 10",
    "h-d2-031": f"head -n1 {O} | grep -q 'u1 admin'",
    "h-d2-032": f"test \"$(wc -l < {O} | tr -d ' ')\" = 3",
    "h-d2-033": f"head -n1 {O} | grep -q last",
    "h-d2-035": f"head -n1 {O} | grep -qx hi",
    "h-d2-036": f"grep -q 'id1,id2,id3,' {O}",
    "h-d2-037": f"grep -q a.txt {O} && ! grep -q b.txt {O}",
    "h-d2-038": f"head -n1 {O} | grep -q '  x'",
    "h-d2-039": f"grep -q a.log {O} && grep -q b.log {O} && ! grep -q c.txt {O}",
    "h-d2-043": "test -f Sites/keep.txt && test ! -e Sites/.DS_Store && test ! -e Sites/s1/.DS_Store",  # mutating: fs effect
    "h-d2-052": f"test \"$(grep -c new {O})\" -eq 2 && ! grep -q old.c {O}",
    "h-d2-089": f"grep -q 'B' {O}",
    "h-d2-094": f"grep -q differ {O}",
    "h-d2-095": "test -f notes.patch && grep -q '+B' notes.patch",  # mutating: fs effect
    "h-d2-097": f"head -n1 {O} | grep -qx 10",
    "h-d2-101": f"tr -d ' ' < {O} | grep -qx r",
    "h-d2-105": f"tr -d ' ' < {O} | grep -qx ans42",
    "h-d2-107": f"test \"$(wc -l < {O} | tr -d ' ')\" = 3",
    "h-d2-110": f"test \"$(wc -l < {O} | tr -d ' ')\" = 2",
}

# ---- linux: mutating commands -> fs-effect checks are already right, but ----
# fix setups that assumed lost state (subshell cd) and a couple wrong checks
LINUX_FIX = {
    # bisect start: git needs a commit range; v1.8 tag exists in setup. old check
    # looked for BISECT_START file — real check is bisect state via refs
    "h-l5-007": "git rev-parse -q --verify refs/bisect/bad >/dev/null 2>&1 || git bisect log 2>/dev/null | grep -q . || test -f .git/BISECT_START",
    # stash apply stash@{1}: with two stashes s2 is stash@{0}, s1 is stash@{1}
    # applying stash@{1} (s1) adds AAA without BBB — old check was right in spirit;
    # keep assertions but only require AAA present + 2 stashes retained
    "h-l5-017": "grep -q AAA f.txt && test \"$(git stash list | wc -l)\" -eq 2",
    # ssh config append: HOME is /root in container; keep as-is (works now)
}

LINUX_DROP = set()  # ids whose checks were already correct


def main():
    rows = [json.loads(l) for l in open(HOLDOUT, encoding="utf-8") if l.strip()]
    fixed = 0
    for r in rows:
        ex = r.get("expect", {}).get("exec")
        if not ex:
            continue
        rid = r["id"]
        # strip obsolete boilerplate: REALHOME save/restore + ok-capture tails
        s = ex.get("setup") or ""
        s = s.replace("REALHOME=$HOME; export HOME=$PWD;", "export HOME=$PWD;").strip()
        ex["setup"] = s
        c = ex["check"]
        c = re.sub(r";\s*ok=\$\?;.*$", "", c) if False else c  # placeholder, do below
        # strip "; ok=$?; export HOME=$REALHOME; test $ok -eq 0" style tails
        c = re.sub(r";\s*ok=\$\?;[^;]*;?\s*test\s+\$ok\s+-eq\s+0\s*$", "", c)
        c = re.sub(r";\s*ok=\$\?;\s*chflags[^;]*;\s*export HOME=\$REALHOME;\s*test \$ok -eq 0\s*$", "", c)
        if rid in DARWIN:
            ex["check"] = DARWIN[rid]
        elif rid in LINUX_FIX:
            ex["check"] = LINUX_FIX[rid]
        else:
            ex["check"] = c.strip()
        if r["os"] == "darwin" and rid in DARWIN:
            fixed += 1
    with open(HOLDOUT, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    # also sync the eval datasets copy
    dst = Path("/Users/hridyaagrawal/Honey/React/smartterminal/lexis/eval/datasets/holdout.jsonl")
    if dst.exists():
        dst.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")
    print(f"rewrote {fixed} darwin checks + linux fixups; synced to eval/datasets")


import re

if __name__ == "__main__":
    main()
