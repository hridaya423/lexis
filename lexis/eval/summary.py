#!/usr/bin/env python3
"""Per-tag pass counts from eval/reports: summary.py [tag-prefix ...] (latest report per slice wins)."""
import glob, json, os, re, sys
from collections import defaultdict

latest = {}
for f in sorted(glob.glob(os.path.join(os.path.dirname(__file__), "reports", "*.json")), key=os.path.getmtime):
    d = json.load(open(f))
    m = re.match(r"(.*)-(core|wide|holdout|testx)-(darwin|linux|windows)$", d.get("tag") or "")
    if m:
        latest[m.groups()] = (d["passed"], d["total"])
by = defaultdict(dict)
for (tag, ds, os_), v in latest.items():
    by[tag][f"{ds}-{os_[:3]}"] = v
want = sys.argv[1:]
for tag in sorted(by):
    if want and not any(tag.startswith(w) for w in want):
        continue
    v = by[tag]
    dev = [x for k, x in v.items() if k.startswith(("core", "wide"))]
    tx = [x for k, x in v.items() if k.startswith("testx")]
    ho = [x for k, x in v.items() if k.startswith("holdout")]
    tot = lambda xs: f"{sum(a for a, _ in xs)}/{sum(b for _, b in xs)}" if xs else "-"
    print(f"{tag:24} dev {tot(dev):9} testx {tot(tx):9} holdout {tot(ho):9} " + " ".join(f"{k}={a}/{b}" for k, (a, b) in sorted(v.items())))
