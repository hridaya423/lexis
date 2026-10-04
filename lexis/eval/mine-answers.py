#!/usr/bin/env python3
"""Collect distinct answers that strong models gave per eval case, for regex widening.

  mine-answers.py <outdir> [--per-batch 60]
Writes batch_NNN.json: [{dataset, id, os, platform, intent, gold, expect, answers: [{cmd, passed, failed_checks}]}]
Only cases with at least one failing answer are emitted. Model identity is dropped (blind review).
"""
import glob, json, os, re, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
STRONG = re.compile(r"^(f-v4a|f-v5|f-lx05|p6-|p5-|p4-lx05|p4-v2b|b3-q4|v2a|v2b|v3|v4|v5-q4)")
SLICE = re.compile(r"(.*)-(core|wide|holdout_a|holdout_b|holdout)-(darwin|linux|windows)$")


def main(outdir, per_batch=60):
    answers = defaultdict(dict)
    for f in glob.glob(os.path.join(ROOT, "reports", "*.json")):
        if f.endswith(".rescored.json"):
            continue
        try:
            d = json.load(open(f))
        except ValueError:
            continue
        m = SLICE.match(d.get("tag") or "")
        if not m or not STRONG.match(m.group(1)):
            continue
        ds = "holdout" if m.group(2).startswith("holdout") else m.group(2)
        for r in d["results"]:
            cmd = (r.get("commands") or [""])[0].strip()
            if not cmd:
                continue
            key = (ds, r["id"], m.group(3))
            prev = answers[key].get(cmd)
            failed = sorted(k for k, v in (r.get("checks") or {}).items() if v is False and k != "execDetail")
            answers[key][cmd] = {"cmd": cmd, "passed": bool(r["pass"]) or bool(prev and prev["passed"]), "failed_checks": failed if not r["pass"] else []}
    cases = {}
    for ds in ("core", "wide", "holdout"):
        for line in open(os.path.join(ROOT, "datasets", f"{ds}.jsonl"), encoding="utf-8"):
            if line.strip():
                c = json.loads(line)
                cases[(ds, c["id"])] = c
    items = []
    for (ds, cid, os_), ans in sorted(answers.items()):
        if not any(not a["passed"] for a in ans.values()):
            continue
        c = cases[(ds, cid)]
        items.append({"dataset": ds, "id": cid, "os": os_, "case_os": c.get("os") or c.get("platform"), "intent": c["intent"],
                      "gold": c.get("gold"), "expect": {k: v for k, v in c["expect"].items() if k != "exec"},
                      "has_exec": "exec" in c["expect"], "answers": sorted(ans.values(), key=lambda a: (a["passed"], a["cmd"]))})
    os.makedirs(outdir, exist_ok=True)
    for i in range(0, len(items), per_batch):
        with open(os.path.join(outdir, f"batch_{i // per_batch:03d}.json"), "w", encoding="utf-8") as f:
            json.dump(items[i:i + per_batch], f, ensure_ascii=False, indent=1)
    print(f"{len(items)} case/os slices with failing answers, "
          f"{sum(sum(not a['passed'] for a in it['answers']) for it in items)} failing answers -> {outdir}")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    n = int(sys.argv[sys.argv.index("--per-batch") + 1]) if "--per-batch" in sys.argv else 60
    main(args[0], n)
