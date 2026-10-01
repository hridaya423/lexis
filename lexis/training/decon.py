#!/usr/bin/env python3
"""Decontamination: drop training rows that collide with eval/holdout sets.

Checks each candidate intent against the eval intents with:
  1. normalized exact match (lowercase, punctuation/whitespace collapsed)
  2. word-4-shingle Jaccard >= THRESH (paraphrase leakage), via inverted index
Usage: decon.py eval1.jsonl eval2.jsonl < candidates.jsonl > clean.jsonl
Summary on stderr. Stdlib only.
"""
import json, re, sys
from collections import defaultdict

THRESH = 0.6
_ws = re.compile(r"[^a-z0-9]+")


def norm(s):
    return _ws.sub(" ", (s or "").lower()).strip()


def shingles(s, n=4):
    w = norm(s).split()
    if len(w) <= n:
        return {" ".join(w)} if w else set()
    return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}


def main():
    eval_paths = [a for a in sys.argv[1:] if a.endswith(".jsonl")]
    if not eval_paths:
        sys.exit("usage: decon.py EVAL.jsonl [EVAL2.jsonl ...] < candidates.jsonl")
    exact = set()
    eval_sets = []
    index = defaultdict(set)  # shingle -> eval intent ids
    for p in eval_paths:
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            i = row.get("intent") or row.get("nl") or ""
            if not i:
                continue
            exact.add(norm(i))
            eid = len(eval_sets)
            es = shingles(i)
            eval_sets.append(es)
            for sh in es:
                index[sh].add(eid)

    kept, dropped = 0, 0
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        row = json.loads(line)
        i = row.get("intent") or row.get("nl") or ""
        ni = norm(i)
        bad = ni in exact
        if not bad and ni:
            cs = shingles(i)
            hits = defaultdict(int)
            for sh in cs:
                for eid in index.get(sh, ()):
                    hits[eid] += 1
            for eid in hits:
                es = eval_sets[eid]
                if hits[eid] / len(cs | es) >= THRESH:
                    bad = True
                    break
        if bad:
            dropped += 1
            continue
        kept += 1
        sys.stdout.write(line + "\n")
    sys.stderr.write(f"decon: kept={kept} dropped={dropped} (eval intents={len(exact)})\n")


if __name__ == "__main__":
    main()
