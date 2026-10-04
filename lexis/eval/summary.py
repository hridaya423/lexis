#!/usr/bin/env python3
"""Per-tag pass counts from eval/reports: summary.py [--rescored] [tag-prefix ...] (latest report per slice wins).
--rescored reads <report>.rescored.json (eval/rescore.mjs --write) instead of the live-run reports."""
import glob, json, os, re, sys
from collections import defaultdict

rescored = "--rescored" in sys.argv
latest = {}
for f in sorted(glob.glob(os.path.join(os.path.dirname(__file__), "reports", "*.json")), key=os.path.getmtime):
    if f.endswith(".rescored.json") != rescored:
        continue
    d = json.load(open(f))
    m = re.match(r"(.*)-(core|wide|holdout_a|holdout_b|holdout|testx)-(darwin|linux|windows)$", d.get("tag") or "")
    if m:
        latest[m.groups()] = (d["passed"], d["total"])
by = defaultdict(dict)
for (tag, ds, os_), v in latest.items():
    by[tag][f"{ds}-{os_[:3]}"] = v
want = [a for a in sys.argv[1:] if not a.startswith("--")]
for tag in sorted(by):
    if want and not any(tag.startswith(w) for w in want):
        continue
    v = by[tag]
    dev = [x for k, x in v.items() if k.startswith(("core", "wide"))]
    tx = [x for k, x in v.items() if k.startswith("testx")]
    ha = [x for k, x in v.items() if k.startswith("holdout_a")]
    ho = [x for k, x in v.items() if k.startswith("holdout_b")]
    tot = lambda xs: f"{sum(a for a, _ in xs)}/{sum(b for _, b in xs)}" if xs else "-"
    print(f"{tag:24} dev {tot(dev):9} testx {tot(tx):9} hA {tot(ha):9} hB {tot(ho):9} " + " ".join(f"{k}={a}/{b}" for k, (a, b) in sorted(v.items())))
