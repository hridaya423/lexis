#!/usr/bin/env python3
"""Expand pack shards (templates + slot grammars) into candidate rows.

Pack row: {"cmd","intents":[...],"slots":{"s":[...]},"os","shell"}
Emits up to COMBOS_PER_TEMPLATE slot-fill combinations x up to
INTENTS_PER_TEMPLATE phrasings, appended to ~/lx-data/candidates-synth.jsonl.
"""
import itertools, json, random, re, sys
from pathlib import Path

SHARDS = Path.home() / "lx-data" / "shards"
OUT = Path.home() / "lx-data" / "candidates-synth.jsonl"
SLOT_RE = re.compile(r"\{\{(\w+)\}\}")
COMBOS_PER_TEMPLATE = 4
INTENTS_PER_TEMPLATE = 4


def fill(cmd, slots, rng):
    names = SLOT_RE.findall(cmd)
    if not names:
        return [cmd]
    pools = [slots.get(n) or ["x"] for n in names]
    combos = list(itertools.product(*pools))
    rng.shuffle(combos)
    return [cmd.replace("{{" + n + "}}", "{}") for n in names], combos


def main():
    rng = random.Random(11)
    n_in = n_out = 0
    seen = set()
    with open(OUT, "w", encoding="utf-8") as out:
        for f in sorted(SHARDS.glob("pack_*.jsonl")):
            src = f.stem
            for line in open(f, encoding="utf-8"):
                line = line.strip()
                if not line:
                    continue
                try:
                    r = json.loads(line)
                except json.JSONDecodeError:
                    continue
                n_in += 1
                cmd, intents, slots = r.get("cmd", ""), r.get("intents") or [], r.get("slots") or {}
                names = SLOT_RE.findall(cmd)
                pools = [slots.get(n) or [] for n in names]
                combos = list(itertools.product(*pools)) if names else [()]
                rng.shuffle(combos)
                combos = combos[:COMBOS_PER_TEMPLATE]
                use_intents = rng.sample(intents, min(INTENTS_PER_TEMPLATE, len(intents)))
                for combo in combos:
                    filled = cmd
                    for n, v in zip(names, combo):
                        filled = filled.replace("{{" + n + "}}", str(v))
                    for intent in use_intents:
                        # align intent placeholders with same slots when present
                        ii = intent
                        for n, v in zip(names, combo):
                            ii = ii.replace("{{" + n + "}}", str(v))
                        key = (ii.strip().lower(), filled)
                        if key in seen:
                            continue
                        seen.add(key)
                        out.write(json.dumps({
                            "intent": ii, "command": filled,
                            "os_hint": r.get("os", "any-unix"),
                            "shell": r.get("shell") or "bash",
                            "source": f"pack:{src}",
                            "license": "internal", "weight": 1.2,
                            "task": "nl2cmd",
                        }, ensure_ascii=False) + "\n")
                        n_out += 1
    sys.stderr.write(f"expand: {n_in} templates -> {n_out} rows -> {OUT}\n")


if __name__ == "__main__":
    main()
