#!/usr/bin/env python3
"""Build fixcmd rows: corrupt a verified command, run it in the lxverify
container to capture real stderr, emit {broken, stderr, fixed}.

Output: ~/lx-data/final/fixcmd.jsonl
"""
import json, random, re, subprocess, sys
from pathlib import Path

# fixcmd rows must come from the TRAIN partition only — eval intents are off-limits
VERIFIED = Path.home() / "lx-data" / "final" / "sft_train.jsonl"
OUT = Path.home() / "lx-data" / "final" / "fixcmd2.jsonl"
N_TARGET = 3000

def typo_head(cmd):
    m = re.match(r"^(\s*)([a-zA-Z][a-zA-Z]{2,})\b", cmd)
    if not m:
        return None
    h = m.group(2)
    i = random.randrange(len(h) - 1)
    bad = random.choice([h[:i] + h[i + 1] + h[i] + h[i + 2:], h[:i] + h[i + 1:], h[:i + 1] + h[i] + h[i + 1:]])
    return None if bad == h else cmd.replace(h, bad, 1)


def corrupt(cmd):
    c = random.choice(["head_typo", "head_typo", "flag_typo", "unquoted", "bsd_sed", "drop_quote"])
    if c == "head_typo":
        return typo_head(cmd)
    if c == "flag_typo":
        m = re.search(r"(\s)-([a-zA-Z]+)\b", cmd)
        if m:
            f = m.group(2)
            i = random.randrange(len(f))
            bad = f[:i] + random.choice("jqzJQZ") + f[i + 1:]
            return cmd.replace("-" + f, "-" + bad, 1)
        return None
    if c == "unquoted":
        m = re.search(r'"([^"]*\s[^"]*)"', cmd)
        return cmd.replace('"' + m.group(1) + '"', m.group(1), 1) if m else None
    if c == "bsd_sed":
        return re.sub(r"\bsed -i (['\"])", r"sed -i '' \1", cmd, count=1) if re.search(r"\bsed -i ['\"]", cmd) else None
    if c == "drop_quote":
        m = re.search(r"'[^']+'", cmd)
        return cmd[:m.end() - 1] + cmd[m.end():] if m else None
    return None


DESTRUCTIVE = re.compile(r"\b(rm|rmdir|dd|mkfs\w*|shred|shutdown|reboot|halt|poweroff|kill|pkill|killall|chmod|chown|mv|truncate|wipefs|fdisk|parted|systemctl|service|iptables|ufw|userdel|useradd|passwd|sudo|apt|apt-get|crontab|mount|umount)\b|>|\bfind\b.*-(delete|exec)")
ERRISH = re.compile(r"error|invalid|unrecognized|not found|unknown|illegal|cannot|can't|unexpected|No such|missing|usage", re.I)
INFRA_ERR = re.compile(r"docker (API|daemon)|Cannot connect to the Docker|Error response from daemon|No such container", re.I)


def real_stderr(cmd):
    try:
        r = subprocess.run(
            ["docker", "exec", "-u", "nobody", "-e", "HOME=/tmp/fxf", "lxverify", "bash", "-c",
             f"cd /tmp && rm -rf fxf && mkdir fxf && cd fxf && timeout 5 bash -c {json.dumps(cmd)}"],
            capture_output=True, text=True, timeout=15)
        lines = [l.strip() for l in (r.stderr or r.stdout).strip().split("\n") if l.strip()]
        hit = next((l for l in lines if ERRISH.search(l)), lines[0] if lines else "")
        return r.returncode, hit[:200]
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
        if "linux" in (r.get("os") or []) and len(r.get("command", "")) < 120 and not DESTRUCTIVE.search(r["command"]):
            rows.append(r)
    random.shuffle(rows)
    OUT.parent.mkdir(exist_ok=True)
    n = 0
    with open(OUT, "w", encoding="utf-8") as f:
        for r in rows:
            if n >= N_TARGET:
                break
            broken = corrupt(r["command"])
            if not broken or broken == r["command"]:
                continue
            code, err = real_stderr(broken)
            if code in (0, -1) or not err or INFRA_ERR.search(err):
                continue
            code0, err0 = real_stderr(r["command"])
            if INFRA_ERR.search(err0) or (code0 != 0 and err0 == err):
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
