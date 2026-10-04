#!/usr/bin/env python3
"""Build DPO pairs from on-policy samples: dpo_pairs.py <dir>  (reads prompts/samples/verify_out, writes dpo_{train,val}.jsonl)

A sample is REJECTED only on mechanical evidence, never for merely differing from gold
(the grader audit found ~1 in 3 "different" answers were valid alternatives):
  syntax / head-missing / bad-flag / exec failure on its own OS (verify.mjs gates), prose, or (fixcmd) returning the failed command unchanged.
Policy-based rules (read answered with a mutation, risk jump, extra steps) were tried and dropped:
a hand audit found ~half of those rejections were valid alternatives. Prompts from the
synthetic random-pick family (shuf, sort -R, $RANDOM), <3-word intents, and tldr-style rows
(capitalised man-page phrasing, path/to placeholders, netpbm converters) are skipped: not daily use,
and their golds are often broken.
CHOSEN is an on-policy sample equal to gold when one exists (in-distribution, less likelihood
displacement), else gold. Gold must itself pass every gate or the prompt is dropped.
Per prompt: the greedy answer if it is wrong, plus the wrong sample closest to chosen; max 2.
"""
import difflib, json, os, random, re, sys
from collections import Counter, defaultdict

D = sys.argv[1]
PROSE = re.compile(r"^(i |i'm|sorry|here|to |you |the |this |as an|```)", re.I)
HEAD_CAP = 0.03
EVERYDAY = lambda intent, gold: intent[:1].islower() and not re.search(r"path/to|\.\.\.|[{}]:|\b(p[bgnpa]m|ppm)\w*", gold + " " + intent)
JUNK = re.compile(r"\bshuf\b|sort\s+-R|\$RANDOM|/dev/u?random")


def norm(c):
    return re.sub(r"\s+", " ", c.replace('"', "'")).strip()


def segments(c):
    out, cur, q = [], "", None
    i = 0
    while i < len(c):
        ch = c[i]
        if q:
            q = None if ch == q else q
        elif ch in "'\"":
            q = ch
        elif c.startswith("&&", i) or ch == ";":
            out.append(cur); cur = ""; i += 2 if c.startswith("&&", i) else 1
            continue
        cur += ch; i += 1
    return [s.strip() for s in out + [cur] if s.strip()]


def head(seg):
    w = [x for x in seg.split() if not re.match(r"^[A-Za-z_]+=", x) and x not in ("sudo", "env", "command", "time", "nohup")]
    return w[0].lower() if w else ""


OPT_ERR = re.compile(r"illegal|invalid|unknown|unrecognized|usage:|command not found", re.I)
KNOWN_HEADS = defaultdict(set)
BUILTINS = set("let read declare typeset local export unset set shopt source . eval exec trap wait jobs fg bg disown "
               "alias unalias type hash help history fc pushd popd dirs cd pwd echo printf test [ [[ true false break "
               "continue return exit shift getopts umask ulimit times builtin command enable caller coproc compgen "
               "complete mapfile readarray suspend logout until while for if case select function".split())


def gate_fail(v):
    """Mechanical failure on the row's own OS, mirroring verify.mjs; heads absent from the
    verifier host but used by gold elsewhere in training are 'not installed here', not wrong."""
    if v is None:
        return "unverified"
    ver = v.get("verified") or {}
    if ver.get("winUnverified"):
        return "unverified"
    if ver.get("syntax") is False:
        return "syntax"
    osh = v.get("os_hint")
    for k, ok in (ver.get("heads") or {}).items():
        h = k.split(":", 1)[-1].lower()
        if ok is not True and re.fullmatch(r"[a-z][\w.+-]*", h) and h not in KNOWN_HEADS[osh] and h not in BUILTINS:
            return "head"
    if str(ver.get("flags")).startswith("bad"):
        return "flag"
    ex = ver.get("exec")
    if isinstance(ex, dict) and ex.get("exit") not in (0, None) and OPT_ERR.search(ex.get("err") or ""):
        return "exec"
    return None


def bad_reason(cmd, gold, vs, vg, broken=None):
    if not cmd.strip() or PROSE.match(cmd):
        return "prose"
    if broken and norm(cmd) == norm(broken):
        return "unchanged"
    g = gate_fail(vs)
    if g and g != "unverified":
        return g
    return None


def main():
    for l in open(sys.argv[2] if len(sys.argv) > 2 else "/Users/hridyaagrawal/lx-data/final/train_v5.jsonl"):
        m = json.loads(l)["messages"]
        u = m[1]["content"]
        osh = "windows" if "PowerShell" in m[0]["content"] else "darwin" if "macOS" in u else "linux"
        for seg in segments(m[-1]["content"]):
            KNOWN_HEADS[osh].add(head(seg))
    KNOWN_HEADS["any-unix"] = KNOWN_HEADS["darwin"] | KNOWN_HEADS["linux"]
    load = lambda names: [r for n in names if os.path.exists(f"{D}/{n}") for r in map(json.loads, open(f"{D}/{n}"))]
    prompts = {r["id"]: r for r in load(["prompts.jsonl", "prompts2.jsonl"])}
    samples = {r["id"]: r for r in load(["samples.jsonl", "samples2.jsonl"])}
    ver = {(r["os_hint"], r["command"]): r for r in load(["verify_out.jsonl", "verify2_out.jsonl"])}
    stats, reasons, pairs = Counter(), Counter(), []
    for pid, p in prompts.items():
        s = samples.get(pid)
        if not s:
            stats["no-samples"] += 1; continue
        osh = p["os"] if p["os"] != "fixcmd" else "any-unix"
        gold = p["messages"][2]["content"].strip()
        if JUNK.search(gold) or len(p["intent"].split()) < 3 or (p["os"] != "fixcmd" and not EVERYDAY(p["intent"], gold)):
            stats["junk-prompt"] += 1; continue
        vg = ver.get((osh, gold))
        if vg is None or gate_fail(vg):
            stats["gold-fails-gates"] += 1; continue
        m = re.match(r"\$ (.+)", p["messages"][1]["content"]) if p["os"] == "fixcmd" else None
        broken = m.group(1).strip() if m else None
        cands = [(s["greedy"], True)] + [(c, False) for c in s["samples"]]
        good = [c for c, _ in cands if norm(c) == norm(gold)]
        chosen = good[0] if good else gold
        wrong, seen = [], set()
        for c, greedy in cands:
            if norm(c) in seen or norm(c) == norm(gold):
                continue
            seen.add(norm(c))
            why = bad_reason(c, gold, ver.get((osh, c)), vg, broken)
            if why:
                wrong.append((c, greedy, why))
        if not wrong:
            stats["no-wrong"] += 1; continue
        pick = [w for w in wrong if w[1]][:1]
        rest = sorted((w for w in wrong if w not in pick), key=lambda w: -difflib.SequenceMatcher(None, w[0], chosen).ratio())
        pick += rest[: 2 - len(pick)]
        for c, greedy, why in pick:
            reasons[why] += 1
            pairs.append({"id": pid, "os": p["os"], "split": p["split"], "head": head(segments(chosen)[0]) if segments(chosen) else "",
                          "why": why, "greedy": greedy, "on_policy_chosen": bool(good),
                          "prompt": p["messages"][:2], "chosen": [{"role": "assistant", "content": chosen}],
                          "rejected": [{"role": "assistant", "content": c}]})
        stats["prompts-with-pairs"] += 1
    by_head = defaultdict(list)
    for x in pairs:
        by_head[x["head"]].append(x)
    cap = max(20, int(HEAD_CAP * len(pairs)))
    random.seed(7)
    capped = [x for xs in by_head.values() for x in (random.sample(xs, cap) if len(xs) > cap else xs)]
    stats["dropped-by-head-cap"] = len(pairs) - len(capped)
    ids = sorted({x["id"] for x in capped}); random.shuffle(ids)
    val_ids = set(ids[: max(1, len(ids) // 20)])
    with open(f"{D}/dpo_train.jsonl", "w") as ft, open(f"{D}/dpo_val.jsonl", "w") as fv:
        for x in capped:
            (fv if x["id"] in val_ids else ft).write(json.dumps(x) + "\n")
    print(json.dumps({"stats": stats, "reasons": reasons, "pairs": len(capped),
                      "by_os": Counter(x["os"] for x in capped), "greedy_wrong": sum(x["greedy"] for x in capped),
                      "on_policy_chosen": sum(x["on_policy_chosen"] for x in capped),
                      "top_heads": Counter(x["head"] for x in capped).most_common(15)}, indent=1))


if __name__ == "__main__":
    main()
