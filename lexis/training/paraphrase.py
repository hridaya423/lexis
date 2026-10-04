#!/usr/bin/env python3
"""Casual-register rewrites of real-source TRAIN intents via a local teacher.

Real corpora read like man pages ("Display the current system time..."); Lexis
users type "how much space is left on my disk". Each real-source train row gets
one teacher rewrite in a user register, keeping the verified command. Rewrites
that drop an anchor (path, number, name, quoted string, or a word the command
uses), echo the command, or land near any eval set are discarded.

  LX_TEACHER=http://localhost:8090 python3 paraphrase.py [--limit N] [--show]
Output: ~/lx-data/final/paraphrase.jsonl (resumable)
"""
import argparse, hashlib, json, os, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from split import FINAL, load_eval_keys, norm, shingles, pct

TEACHER = os.environ.get("LX_TEACHER", "http://localhost:8090")
OUT = FINAL / "paraphrase.jsonl"
OS_NAME = {"darwin": "macOS", "linux": "Linux", "windows": "Windows (PowerShell)"}

SYSTEM = (
    "You rewrite command-line requests the way a real person types them into a terminal assistant. "
    "Keep the exact meaning: every file name, path, number, user name, URL, package name and option value "
    "from the original must still appear, and the given command must still answer the rewritten request "
    "completely, no more and no less. Do not mention the command or its flags unless the original did. "
    "Output only the rewritten request, on one line."
)
STYLES = [
    "short and lowercase, like a quick note to yourself (e.g. 'kill whatever is hogging port 3000', 'last 20 lines of the nginx log')",
    "a question that opens with what/which/where/is/are/how many/can you (e.g. 'which process is listening on 8080', "
    "'is docker running?', 'what's eating space in ~/Downloads'); do not open with 'how do i'",
    "first person and casual, varying the opening (e.g. 'my disk is almost full, what's big in /var', "
    "'need the last 20 lines of my nginx log', 'can i see who's logged in'); do not open with 'i need' or 'i want'",
    "casual verbs (e.g. 'nuke the build dir', 'grab', 'peek at', 'stick it in')",
    "plain imperative, the way a competent user types it (e.g. 'show lines 100-120 of app.log', 'list open ports')",
]


def anchors(intent, command):
    """Tokens a faithful rewrite must keep."""
    words = re.findall(r"[^\s,;:!?()\"']+", intent)
    quoted = re.findall(r"['\"]([^'\"]+)['\"]", intent)
    keep = {w.strip(".") for w in words if re.search(r"[\d/~_.\\]", w.strip(".")) and len(w.strip(".")) > 1}
    keep |= {w for w in words if len(w) >= 3 and re.search(rf"(?<![\w-]){re.escape(w)}(?![\w-])", command)
             and w.lower() not in {"the", "and", "for", "all", "with", "from", "into", "file", "files"}}
    return keep | {q for q in quoted if q.strip()}


def ok(rewrite, r, eval_int, eval_sh):
    low = rewrite.lower()
    return (rewrite and "\n" not in rewrite and 3 <= len(rewrite.split()) <= 30
            and norm(rewrite) != norm(r["intent"]) and r["command"].lower() not in low
            and not low.startswith(("here", "sure", "rewritten", "request"))
            and all(a.lower() in low for a in anchors(r["intent"], r["command"]))
            and norm(rewrite) not in eval_int and not (shingles(rewrite) & eval_sh))


def rid(r):
    return hashlib.sha1(f"{r['intent']}\x00{r['command']}".encode()).hexdigest()[:12]


def style_of(r):
    return STYLES[pct(r["intent"], "style") % len(STYLES)]


AGENT_BRIEF = """First invoke the `prose` skill and apply it to every rewrite: plain human register, no AI tells,
no filler. Where prose and the rules below disagree, the rules below win (they protect correctness).

You are writing training data for a terminal-command model. Read every line of {shard}.
Each line is {{"id", "platform", "request", "command", "style"}}. For EACH line, write ONE rewrite of
"request" in the given style, following these rules:

{rules}

Vary how rewrites open across the shard: no single opening word or phrase for more than about 1 in 10.
Write each rewrite yourself, one by one, reading the request and command. Do NOT write a script,
template, regex or loop that generates rewrites; programmatic output is worthless here and will be discarded.
Append results to {out} as JSON lines {{"id": "<same id>", "rewrite": "<text>"}}, in batches of about 50
lines per write, until every id in the shard has exactly one line. Do not modify any other file.
When done, print the number of lines in {out}."""


def shard(n_per, outdir):
    outdir.mkdir(parents=True, exist_ok=True)
    rows = [r for r in map(json.loads, open(FINAL / "sft_train.jsonl")) if not r["source"].startswith("pack")]
    for i in range(0, len(rows), n_per):
        name = f"shard_{i // n_per:03d}"
        with open(outdir / f"{name}.jsonl", "w", encoding="utf-8") as f:
            for r in rows[i:i + n_per]:
                f.write(json.dumps({"id": rid(r), "platform": OS_NAME[r["prompt_os"]], "request": r["intent"],
                                    "command": r["command"], "style": style_of(r)}, ensure_ascii=False) + "\n")
        (outdir / f"{name}.prompt.md").write_text(
            AGENT_BRIEF.format(shard=f"{name}.jsonl", out=f"{name}.out.jsonl", rules=SYSTEM))
    print(f"{len(rows)} rows -> {(len(rows) + n_per - 1) // n_per} shards in {outdir}", file=sys.stderr)


def from_dir(outdir):
    got = {}
    for f in outdir.glob("*.out.jsonl"):
        for l in open(f, encoding="utf-8"):
            try:
                o = json.loads(l)
                got.setdefault(o["id"], str(o["rewrite"]).strip())
            except Exception:
                pass
    return lambda r: (r, got.get(rid(r)), None if rid(r) in got else "missing")


def ask(r):
    style = style_of(r)
    body = {"messages": [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": f"Platform: {OS_NAME[r['prompt_os']]}\nOriginal request: {r['intent']}\n"
                                    f"Command it maps to: {r['command']}\nStyle: {style}"}],
        "temperature": 0.8, "max_tokens": 60}
    req = urllib.request.Request(f"{TEACHER}/v1/chat/completions", json.dumps(body).encode(),
                                 {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            text = json.load(resp)["choices"][0]["message"]["content"]
    except Exception as e:
        return r, None, str(e)
    return r, text.strip().strip("\"'").strip(), None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--show", action="store_true")
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--shard", type=int, default=0, help="write agent shards of N rows and exit")
    ap.add_argument("--from-dir", help="filter agent-written *.out.jsonl instead of calling the teacher")
    a = ap.parse_args()
    if a.shard:
        return shard(a.shard, FINAL.parent / "para-shards")
    gen = from_dir(Path(a.from_dir)) if a.from_dir else ask

    eval_int, eval_sh = load_eval_keys()
    held = {norm(json.loads(l)["intent"]) for f in ("sft_val.jsonl", "sft_test.jsonl") for l in open(FINAL / f)}
    rows = [r for r in map(json.loads, open(FINAL / "sft_train.jsonl")) if not r["source"].startswith("pack")]
    done = {json.loads(l)["src_intent"] for l in open(OUT)} if OUT.exists() and not a.show else set()
    todo = [r for r in rows if r["intent"] not in done][: a.limit or None]
    print(f"real-source train rows: {len(rows)}, todo: {len(todo)}", file=sys.stderr)

    kept = rej = err = 0
    with open(OUT, "w" if a.show else "a", encoding="utf-8") as out, ThreadPoolExecutor(a.workers) as ex:
        for r, text, e in ex.map(gen, todo):
            if e:
                err += 1
                continue
            good = ok(text, r, eval_int, eval_sh) and norm(text) not in held
            if a.show:
                print(f"{'KEEP' if good else 'DROP'} | {r['intent'][:70]!r}\n     -> {text!r}\n     cmd: {r['command'][:70]}")
            if good:
                out.write(json.dumps({**r, "intent": text, "src_intent": r["intent"],
                                      "source": f"para:{r['source']}"}, ensure_ascii=False) + "\n")
                kept += 1
            else:
                rej += 1
            if (kept + rej) % 500 == 0:
                print(f"{kept + rej}/{len(todo)} kept={kept} rej={rej} err={err}", file=sys.stderr)
    print(f"done: kept={kept} rejected={rej} errors={err}", file=sys.stderr)


if __name__ == "__main__":
    main()
