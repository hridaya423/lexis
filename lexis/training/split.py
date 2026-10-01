#!/usr/bin/env python3
"""Final build: verified.jsonl -> balanced, decontaminated, leak-free splits.

Outputs under ~/lx-data/final/:
  sft_train.jsonl / sft_val.jsonl / sft_test.jsonl   (Format A: lexis prompt format)
  sft_train_chat.jsonl ...                          (Format B: chat messages)
  dpo.jsonl                                         (chosen/rejected pairs, TRAIN intents only)
  fixcmd.jsonl                                      (broken+stderr -> fixed, train only)
  sources.json                                      (provenance + license tally)

Split rule: UNION-FIND groups. Rows sharing a normalized intent OR a normalized
command are one family and land in one split — a template's variants can never
straddle train/val. DPO and fixcmd are built from the train partition only, so
eval prompts can never appear in any training artifact.
"""
import hashlib, json, random, re, sys
from collections import Counter, defaultdict
from pathlib import Path

DATA = Path.home() / "lx-data"
FINAL = DATA / "final"
FINAL.mkdir(parents=True, exist_ok=True)
REPO_EVAL = Path(__file__).resolve().parent.parent / "eval" / "datasets"
HOLDOUT = DATA / "holdout.jsonl"
EXTRA_EVALS = [DATA / "alfa-test.jsonl"] + sorted(REPO_EVAL.glob("*.jsonl"))

WS = re.compile(r"\s+")
PLACEHOLDER = re.compile(r"\{\{(?!\.)[^}]*\}\}")  # tldr-style {{arg}}; docker {{.Names}} survives


def norm(s):
    return WS.sub(" ", (s or "").lower().strip())


def norm_cmd(s):
    return re.sub(r"['\"]", "", norm(s))


def shingles(s, n=4):
    w = norm(s).split()
    return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)} or {" ".join(w)}


def prose_like(cmd):
    """Sentence-as-command: all alphabetic/punct tokens, >=6 words."""
    toks = cmd.split()
    return len(toks) >= 6 and all(re.fullmatch(r"[A-Za-z'.,:;!?()\[\]-]+", t) for t in toks)


# ---- union-find over (normed intent, normed command) families ----
class UF:
    def __init__(self):
        self.p = {}

    def find(self, x):
        p = self.p
        while p.setdefault(x, x) != x:
            p[x] = p[p[x]]
            x = p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[ra] = rb


def split_of(root):
    h = int(hashlib.sha1(root.encode()).hexdigest()[:8], 16) % 100
    return "train" if h < 88 else "val" if h < 94 else "test"


def load_eval_keys():
    keys, sh_keys = set(), set()
    files = ([HOLDOUT] if HOLDOUT.exists() else []) + [f for f in EXTRA_EVALS if f.exists()]
    for f in files:
        for line in open(f, encoding="utf-8"):
            try:
                r = json.loads(line)
            except Exception:
                continue
            for k in ("intent", "nl", "request"):
                i = r.get(k)
                if i:
                    keys.add(norm(i))
                    sh_keys |= shingles(i)
    return keys, sh_keys


SYS_BASH = "You are a bash command generator. Given a natural language request, output only the bash command that accomplishes it. No explanation, no markdown fences."
SYS_PWSH = "You are a PowerShell command generator. Given a natural language request, output only the PowerShell command that accomplishes it. No explanation, no markdown fences."
OS_HINT = {"darwin": "macOS (BSD)", "linux": "Linux (GNU)", "windows": "windows"}


def prod_user(intent, r, rng01):
    """Production prompt shape; ~15% of rows drop the platform suffix."""
    if rng01 < 0.15:
        return intent
    oses = r.get("os") or []
    os_hint = next((OS_HINT[o] for o in oses if o in OS_HINT), "unix")
    return f"{intent}\n(Platform: {os_hint}, shell: {r.get('shell') or 'bash'})"


def chatfmt(intent, command, r):
    shell = r.get("shell") or "bash"
    sys_p = SYS_PWSH if shell == "powershell" else SYS_BASH
    # deterministic per-row suffix-drop via row hash
    drop = int(hashlib.sha1(("drop:" + norm(intent)).encode()).hexdigest()[:6], 16) % 100 < 15
    user = intent if drop else prod_user(intent, r, 1)
    return {"messages": [
        {"role": "system", "content": sys_p},
        {"role": "user", "content": user},
        {"role": "assistant", "content": command}]}


def main():
    eval_int, eval_sh = load_eval_keys()
    rows = []
    for vf in sorted(DATA.glob("verified*.jsonl")):
        for line in open(vf, encoding="utf-8"):
            try:
                r = json.loads(line)
                if r.get("os"):
                    rows.append(r)
            except Exception:
                pass
    print(f"verified in: {len(rows)}", file=sys.stderr)

    # junk gates: unresolved placeholders, prose-as-command
    before = len(rows)
    rows = [r for r in rows if not PLACEHOLDER.search(r["command"]) and not prose_like(r["command"])]
    print(f"junk filter: dropped {before - len(rows)} placeholder/prose rows", file=sys.stderr)

    # decon: exact intent or shared 4-shingle with ANY eval set
    clean, contam = [], []
    for r in rows:
        ni = norm(r["intent"])
        if ni in eval_int or (shingles(r["intent"]) & eval_sh):
            contam.append(r)
        else:
            clean.append(r)
    print(f"decon: dropped {len(contam)} eval-adjacent rows", file=sys.stderr)

    # dedupe on (intent, command) keeping highest weight
    best = {}
    for r in clean:
        k = (norm(r["intent"]), norm_cmd(r["command"]))
        if k not in best or r.get("weight", 1) > best[k].get("weight", 1):
            best[k] = r
    rows = list(best.values())

    # union-find families: same intent OR same command => same split
    uf = UF()
    for i, r in enumerate(rows):
        uf.union(f"i:{norm(r['intent'])}", f"r{i}")
        uf.union(f"c:{norm_cmd(r['command'])}", f"r{i}")

    by_os = defaultdict(list)
    for r in rows:
        for o in (r.get("os") or [r.get("os_hint", "any-unix")]):
            by_os[o].append(r)
    print("pre-balance os counts:", {o: len(v) for o, v in by_os.items()}, file=sys.stderr)

    # cap any single source at 35% of total rows
    src_groups = defaultdict(list)
    for r in rows:
        src_groups[r.get("source", "?")].append(r)
    cap = int(0.35 * len(rows))
    kept = []
    for src, grp in src_groups.items():
        if len(grp) > cap:
            grp.sort(key=lambda r: -r.get("weight", 1))
            kept.extend(grp[:cap])
        else:
            kept.extend(grp)
    print(f"balance: capped at {cap}/source, dropped {len(rows) - len(kept)}", file=sys.stderr)
    rows = kept

    # rebuild families on survivors only (dropped rows shouldn't drag siblings' split)
    uf = UF()
    for i, r in enumerate(rows):
        uf.union(f"i:{norm(r['intent'])}", f"r{i}")
        uf.union(f"c:{norm_cmd(r['command'])}", f"r{i}")

    splits = {"train": [], "val": [], "test": []}
    for i, r in enumerate(rows):
        # family split keyed on the canonical root of this row's intent node
        splits[split_of(uf.find(f"i:{norm(r['intent'])}"))].append(r)

    rng = random.Random(3)
    for name, arr in splits.items():
        rng.shuffle(arr)
        with open(FINAL / f"sft_{name}.jsonl", "w", encoding="utf-8") as a, \
             open(FINAL / f"sft_{name}_chat.jsonl", "w", encoding="utf-8") as b:
            for r in arr:
                rec = {"intent": r["intent"], "command": r["command"],
                       "os": r.get("os"), "shell": r.get("shell"), "weight": r.get("weight", 1),
                       "source": r.get("source"), "license": r.get("license")}
                a.write(json.dumps(rec, ensure_ascii=False) + "\n")
                b.write(json.dumps(chatfmt(r["intent"], r["command"], r), ensure_ascii=False) + "\n")
        print(f"{name}: {len(arr)}", file=sys.stderr)

    # DPO pairs from TRAIN rows only — eval prompts must never reach training files
    train_keys = {norm(r["intent"]) for r in splits["train"]}
    with open(FINAL / "dpo.jsonl", "w", encoding="utf-8") as f:
        n = 0
        for r in splits["train"]:
            if r.get("rejected"):
                f.write(json.dumps({"prompt": r["intent"], "chosen": r["command"],
                                    "rejected": r["rejected"], "source": r.get("source")}, ensure_ascii=False) + "\n")
                n += 1
    print(f"dpo pairs: {n} (train-only)", file=sys.stderr)

    lic = Counter(r.get("license", "unknown") for r in rows)
    src = Counter(r.get("source", "?") for r in rows)
    (FINAL / "sources.json").write_text(json.dumps({"licenses": dict(lic), "sources": dict(src)}, indent=1))
    print(f"total final rows: {len(rows)}; licenses: {dict(lic)}", file=sys.stderr)


if __name__ == "__main__":
    main()
