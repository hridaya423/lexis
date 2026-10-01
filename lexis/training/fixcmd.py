#!/usr/bin/env python3
"""Build fixcmd rows: corrupt a verified command, run it in the lxverify
container to capture real stderr, emit {broken, stderr, fixed}.

Output: ~/lx-data/final/fixcmd.jsonl
"""
import json, random, re, subprocess, sys
from pathlib import Path

# fixcmd rows must come from the TRAIN partition only — eval intents are off-limits
VERIFIED = Path.home() / "lx-data" / "final" / "sft_train.jsonl"
OUT = Path.home() / "lx-data" / "final" / "fixcmd.jsonl"
N_TARGET = 3000

FIXABLE = {"rm": "rm -r", "cp": "cp -r", "scp": "scp -r", "grep": "grep -r", "tar": "tar -z"}


def typo_head(cmd):
    m = re.match(r"^(\s*)([a-zA-Z][a-zA-Z]+)", cmd)
    if not m:
        return None
    h = m.group(2)
    i = random.randrange(len(h))
    bad = h[:i] + h[i] + h[i + 1:] if i < len(h) - 1 else h + "x"
    return cmd.replace(h, bad, 1), f"{bad}: command not found"


def corrupt(cmd):
    c = random.choice(["head_typo", "missing_r", "flag_typo", "unquoted", "missing_o"])
    if c == "head_typo":
        return typo_head(cmd)
    if c == "missing_r":
        for base, fix in FIXABLE.items():
            if re.match(rf"^\s*{base}\s+[^-]", cmd) and f"{base} -r" not in cmd:
                return cmd, f"{base}: directory omitted"
        return None
    if c == "flag_typo":
        m = re.search(r"(\s)-([a-zA-Z]{2,})", cmd)
        if m:
            f = m.group(2)
            bad = f[0] + f[::-1][1:]
            return cmd.replace("-" + f, "-" + bad, 1), None
        return None
    if c == "unquoted":
        m = re.search(r'"([^"]*\s[^"]*)"', cmd)
        if m:
            return cmd.replace('"' + m.group(1) + '"', m.group(1), 1), None
        return None
    if c == "missing_o":
        if re.match(r"^\s*(curl|wget)\s", cmd):
            return cmd.replace(" -o ", " ").replace(" -O ", " "), None
        return None
    return None


def real_stderr(cmd):
    try:
        r = subprocess.run(
            ["docker", "exec", "lxverify", "bash", "-c",
             f"cd /tmp && rm -rf fxf && mkdir fxf && cd fxf && timeout 5 bash -c {json.dumps(cmd)}"],
            capture_output=True, text=True, timeout=15)
        return r.returncode, (r.stderr or r.stdout).strip().split("\n")[-1][:200]
    except Exception:
        return -1, ""


def main():
    random.seed(5)
    rows = []
    for line in open(VERIFIED, encoding="utf-8"):
        try:
            r = json.loads(line)
        except Exception:
            continue
        if "linux" in (r.get("os") or []) and len(r.get("command", "")) < 120:
            rows.append(r)
    random.shuffle(rows)
    OUT.parent.mkdir(exist_ok=True)
    n = 0
    with open(OUT, "w", encoding="utf-8") as f:
        for r in rows:
            if n >= N_TARGET:
                break
            res = corrupt(r["command"])
            if not res:
                continue
            broken, hint = res
            if broken == r["command"]:
                continue
            code, err = real_stderr(broken)
            if code == 0 or not err:
                err = hint or err
            if not err:
                continue
            f.write(json.dumps({
                "broken": broken, "stderr": err, "fixed": r["command"],
                "intent": r.get("intent"), "task": "fixcmd",
                "source": "synth:" + str(r.get("source")), "license": r.get("license", "internal"),
            }, ensure_ascii=False) + "\n")
            n += 1
            if n % 200 == 0:
                print(f"{n}...", file=sys.stderr)
    print(f"fixcmd: {n} rows -> {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
