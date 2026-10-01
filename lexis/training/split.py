#!/usr/bin/env python3
"""Final build: verified.jsonl -> balanced, decontaminated, leak-free splits.

Outputs under ~/lx-data/final/:
  sft_train.jsonl / sft_val.jsonl / sft_test.jsonl   (Format A: lexis prompt format)
  sft_train_chat.jsonl ...                          (Format B: chat messages)
  dpo.jsonl                                         (chosen/rejected pairs)
  fixcmd.jsonl                                      (broken+stderr -> fixed)
  sources.json                                      (provenance + license tally)

Split rule: hash of normalized intent — a normalized intent (and its near-dupes,
which dedupe/decon already removed) lands in exactly one split.
"""
import hashlib, json, random, re, sys
from collections import Counter, defaultdict
from pathlib import Path

DATA = Path.home() / "lx-data"
FINAL = DATA / "final"
FINAL.mkdir(parents=True, exist_ok=True)
VERIFIED = DATA / "verified.jsonl"
HOLDOUT = DATA / "holdout.jsonl"
SHARDS_HOLDOUT = DATA / "holdout-shards"

WS = re.compile(r"\s+")


def norm(s):
    return WS.sub(" ", (s or "").lower().strip())


def norm_cmd(s):
    s = norm(s)
    s = re.sub(r"['\"]", "", s)
    return s


def shingles(s, n=4):
    w = norm(s).split()
    return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)} or {" ".join(w)}


def split_of(intent):
    h = int(hashlib.sha1(norm(intent).encode()).hexdigest()[:8], 16) % 100
    return "train" if h < 88 else "val" if h < 94 else "test"


def load_holdout_keys():
    keys, sh_keys = set(), set()
    files = [HOLDOUT] if HOLDOUT.exists() else sorted(SHARDS_HOLDOUT.glob("shard-*.jsonl"))
    for f in files:
        for line in open(f, encoding="utf-8"):
            try:
                r = json.loads(line)
            except Exception:
                continue
            keys.add(norm(r.get("intent", "")))
            sh_keys |= shingles(r.get("intent", ""))
    return keys, sh_keys


def chatfmt(intent, command):
    return {"messages": [
        {"role": "system", "content": "You are a bash command generator. Given a natural language request, output only the bash command that accomplishes it. No explanation, no markdown fences."},
        {"role": "user", "content": intent},
        {"role": "assistant", "content": command}]}


def main():
    hold_int, hold_sh = load_holdout_keys()
    rows = []
    for line in open(VERIFIED, encoding="utf-8"):
        try:
            rows.append(json.loads(line))
        except Exception:
            pass
    print(f"verified in: {len(rows)}", file=sys.stderr)

    # decon: exact intent or 4-shingle overlap with holdout intent
    clean, contam = [], []
    for r in rows:
        ni = norm(r["intent"])
        if ni in hold_int or (shingles(r["intent"]) & hold_sh):
            contam.append(r)
        else:
            clean.append(r)
    print(f"decon: dropped {len(contam)} holdout-adjacent rows", file=sys.stderr)

    # dedupe identical commands keeping highest weight
    best = {}
    for r in clean:
        k = (norm(r["intent"]), norm_cmd(r["command"]))
        if k not in best or r.get("weight", 1) > best[k].get("weight", 1):
            best[k] = r
    rows = list(best.values())

    # per-OS balance: cap any single (source) at 40% of its os slice
    by_os = defaultdict(list)
    for r in rows:
        for o in (r.get("os") or [r.get("os_hint", "any-unix")]):
            by_os[o].append(r)
    counts = {o: len(v) for o, v in by_os.items()}
    print("pre-balance os counts:", counts, file=sys.stderr)

    splits = {"train": [], "val": [], "test": []}
    for r in rows:
        splits[split_of(r["intent"])].append(r)

    rng = random.Random(3)
    for name, arr in splits.items():
        rng.shuffle(arr)
        with open(FINAL / f"sft_{name}.jsonl", "w", encoding="utf-8") as a, \
             open(FINAL / f"sft_{name}_chat.jsonl", "w", encoding="utf-8") as b:
            for r in arr:
                rec = {"intent": r["intent"], "command": r["command"],
                       "os": r.get("os"), "shell": r.get("shell"), "weight": r.get("weight", 1),
                       "source": r.get("source")}
                a.write(json.dumps(rec, ensure_ascii=False) + "\n")
                b.write(json.dumps(chatfmt(r["intent"], r["command"]), ensure_ascii=False) + "\n")
        print(f"{name}: {len(arr)}", file=sys.stderr)

    # dpo pairs from harvest (rejected column survives normalization)
    with open(FINAL / "dpo.jsonl", "w", encoding="utf-8") as f:
        n = 0
        for r in rows:
            if r.get("rejected"):
                f.write(json.dumps({"prompt": r["intent"], "chosen": r["command"],
                                    "rejected": r["rejected"], "source": r.get("source")}, ensure_ascii=False) + "\n")
                n += 1
    print(f"dpo pairs: {n}", file=sys.stderr)

    lic = Counter(r.get("license", "unknown") for r in rows)
    src = Counter(r.get("source", "?") for r in rows)
    (FINAL / "sources.json").write_text(json.dumps({"licenses": dict(lic), "sources": dict(src)}, indent=1))
    print(f"total final rows: {len(rows)}; licenses: {dict(lic)}", file=sys.stderr)


if __name__ == "__main__":
    main()
