#!/usr/bin/env python3
"""Training mix for Modal: SFT train + casual rewrites + fixcmd (+ extra row files), all in the
exact production chat format (planner.mjs PLAIN_*_PROMPT / FIXCMD_SYSTEM_PROMPT; the fixcmd user
turn mirrors run.mjs: "$ <failed command>\\n<error>").

  build_mix.py [out.jsonl] [extra[:repeat] ...] [--drop-source nl2sh-alfa,...] [--no-para]

Rewrites must point at a current train row; nothing whose command is in val/test survives.
Output: ~/lx-data/final/<out>
"""
import json, random, sys
from split import FINAL, PLACEHOLDER, chatfmt

FIXCMD_SYS = "You fix broken bash commands. Given a failed command and its error output, output only the corrected command. No explanation."


def load(name):
    p = FINAL / name
    return [json.loads(l) for l in open(p, encoding="utf-8")] if p.exists() else []


def main(argv):
    drop = set()
    no_para = "--no-para" in argv
    argv = [a for a in argv if a != "--no-para"]
    if "--drop-source" in argv:
        i = argv.index("--drop-source")
        drop = set(argv[i + 1].split(","))
        argv = argv[:i] + argv[i + 2:]
    out, extras = (argv[0] if argv else "train_mix_chat.jsonl"), argv[1:]
    src_of = lambda r: (r.get("source") or "").removeprefix("para:").split(":")[0]
    train = [r for r in load("sft_train.jsonl") if src_of(r) not in drop]
    held = {r["command"].strip() for n in ("sft_val.jsonl", "sft_test.jsonl") for r in load(n)}
    train_keys = {(r["prompt_os"], r["command"]) for r in train}
    mix = [chatfmt(r["intent"], r["command"], r) for r in train]
    n = {"sft": len(mix)}
    para = [] if no_para else [r for r in load("paraphrase.jsonl") if (r["prompt_os"], r["command"]) in train_keys and r["command"].strip() not in held]
    mix += [chatfmt(r["intent"], r["command"], r) for r in para]
    n["paraphrase"] = len(para)
    for spec in extras:
        name, _, rep = spec.partition(":")
        ex = [r for r in load(f"{name}.jsonl") if r["command"].strip() not in held and src_of(r) not in drop]
        mix += [chatfmt(r["intent"], r["command"], r) for r in ex] * int(rep or 1)
        n[name] = len(ex) * int(rep or 1)
    fix = [r for r in load("fixcmd.jsonl") if r["fixed"].strip() not in held]
    mix += [{"messages": [{"role": "system", "content": FIXCMD_SYS},
                          {"role": "user", "content": f"$ {r['broken']}\n{r['stderr']}"},
                          {"role": "assistant", "content": r["fixed"]}]} for r in fix]
    n["fixcmd"] = len(fix)
    ok = lambda a: a.strip() and "\n" not in a.strip() and not PLACEHOLDER.search(a)
    mix = [m for m in mix if ok(m["messages"][-1]["content"])]
    random.Random(7).shuffle(mix)
    with open(FINAL / out, "w", encoding="utf-8") as f:
        f.writelines(json.dumps(m, ensure_ascii=False) + "\n" for m in mix)
    print(f"mix: {n} total={len(mix)} drop={sorted(drop)} -> {out}")


if __name__ == "__main__":
    main(sys.argv[1:])
