#!/usr/bin/env python3
"""Build a stratified pilot slice from final/sft_train.jsonl.

Balances OS coverage (up to --per-os rows per primary OS) so the pilot tests
whether unified conditioning works rather than replaying linux dominance.
Writes chat-format rows compatible with sft_train_chat.jsonl.
"""
import argparse, hashlib, json, random, re
from collections import defaultdict
from pathlib import Path

FINAL = Path.home() / "lx-data" / "final"
WS = re.compile(r"\s+")

SYS_BASH = "You are a bash command generator. Given a natural language request, output only the bash command that accomplishes it. No explanation, no markdown fences."
SYS_PWSH = "You are a PowerShell command generator. Given a natural language request, output only the PowerShell command that accomplishes it. No explanation, no markdown fences."
OS_HINT = {"darwin": "macOS (BSD)", "linux": "Linux (GNU)", "windows": "windows"}


def norm(s):
    return WS.sub(" ", s.lower().strip())


def chatfmt(r):
    shell = r.get("shell") or "bash"
    sys_p = SYS_PWSH if shell == "powershell" else SYS_BASH
    drop = int(hashlib.sha1(("drop:" + norm(r["intent"])).encode()).hexdigest()[:6], 16) % 100 < 15
    if drop:
        user = r["intent"]
    else:
        os_hint = next((OS_HINT[o] for o in r["os"] if o in OS_HINT), "unix")
        user = f"{r['intent']}\n(Platform: {os_hint}, shell: {shell})"
    return {"messages": [{"role": "system", "content": sys_p},
                         {"role": "user", "content": user},
                         {"role": "assistant", "content": r["command"]}]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-os", type=int, default=20000)
    ap.add_argument("--out", default=str(FINAL / "pilot.jsonl"))
    a = ap.parse_args()

    by_os = defaultdict(list)
    for line in open(FINAL / "sft_train.jsonl", encoding="utf-8"):
        r = json.loads(line)
        primary = r["os"][0] if r.get("os") else "linux"
        by_os[primary].append(r)

    rng = random.Random(7)
    out = []
    for osname, rows in sorted(by_os.items()):
        rng.shuffle(rows)
        rows = rows[: a.per_os]
        out.extend(rows)
        print(f"{osname}: {len(rows)}")
    rng.shuffle(out)
    with open(a.out, "w", encoding="utf-8") as f:
        for r in out:
            f.write(json.dumps(chatfmt(r), ensure_ascii=False) + "\n")
    print(f"pilot: {len(out)} rows -> {a.out}")


if __name__ == "__main__":
    main()
