#!/usr/bin/env python3
"""Training mix for Modal: SFT train + casual rewrites + fixcmd, all in the exact
production chat format (planner.mjs PLAIN_*_PROMPT / FIXCMD_SYSTEM_PROMPT; the
fixcmd user turn mirrors run.mjs: "$ <failed command>\\n<error>").

Output: ~/lx-data/final/train_mix_chat.jsonl
"""
import json, random, sys
from split import FINAL, PLACEHOLDER, chatfmt

FIXCMD_SYS = "You fix broken bash commands. Given a failed command and its error output, output only the corrected command. No explanation."


def main(out="train_mix_chat.jsonl", *extras):
    mix = [json.loads(l) for l in open(FINAL / "sft_train_chat.jsonl")]
    n_sft = len(mix)
    para = FINAL / "paraphrase.jsonl"
    rows = [json.loads(l) for l in open(para)] if para.exists() else []
    mix += [chatfmt(r["intent"], r["command"], r) for r in rows]
    n_extra = {}
    for spec in extras:
        name, _, rep = spec.partition(":")
        ex = [json.loads(l) for l in open(FINAL / f"{name}.jsonl")]
        mix += [chatfmt(r["intent"], r["command"], r) for r in ex] * int(rep or 1)
        n_extra[name] = len(ex) * int(rep or 1)
    fix = [json.loads(l) for l in open(FINAL / "fixcmd.jsonl")]
    mix += [{"messages": [{"role": "system", "content": FIXCMD_SYS},
                          {"role": "user", "content": f"$ {r['broken']}\n{r['stderr']}"},
                          {"role": "assistant", "content": r["fixed"]}]} for r in fix]
    ok = lambda a: a.strip() and "\n" not in a.strip() and not PLACEHOLDER.search(a)
    mix = [m for m in mix if ok(m["messages"][-1]["content"])]
    random.Random(7).shuffle(mix)
    with open(FINAL / out, "w", encoding="utf-8") as f:
        f.writelines(json.dumps(m, ensure_ascii=False) + "\n" for m in mix)
    print(f"mix: sft={n_sft} paraphrase={len(rows)} fixcmd={len(fix)} extra={n_extra} total={len(mix)} -> {out}")


if __name__ == "__main__":
    main(*sys.argv[1:])
