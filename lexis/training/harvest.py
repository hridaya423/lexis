#!/usr/bin/env python3
"""Harvest public NL->command corpora into ~/lx-data/raw/*.jsonl.

Run:  uv run --with datasets --with pyarrow python harvest.py [hf|tldr|psdocs|all]

Each output row: {"intent","command","os_hint","shell","source","license","weight"}
os_hint in {darwin,linux,windows,any-unix} — the verifier assigns final OS.
HF sources are streamed where possible so nothing huge is fully downloaded.
"""
import json, os, re, subprocess, sys
from pathlib import Path

RAW = Path(os.path.expanduser("~/lx-data/raw"))
RAW.mkdir(parents=True, exist_ok=True)

INTENT_KEYS = ["nl", "intent", "instruction", "description", "nl_command", "nl_prompt", "input", "question", "Instruction"]
CMD_KEYS = ["bash", "command", "cmd", "output", "answer", "completion", "shell_command", "powershell", "bash_code", "Response", "response"]


def msgs_to_pair(v):
    """Parse cli-1m/ShareGPT-style message columns (list or stringified list)."""
    import ast
    if isinstance(v, str):
        try:
            msgs = ast.literal_eval(v)
        except Exception:
            return None, None
    elif isinstance(v, list):
        msgs = v
    else:
        return None, None
    intent = cmd = None
    for m in msgs if isinstance(msgs, list) else []:
        role = str(m.get("role") or m.get("from") or "")
        content = str(m.get("content") or m.get("value") or "")
        if role in ("user", "human"):
            intent = content
        elif role in ("assistant", "gpt"):
            cmd = content
    return intent, cmd


def pair(row):
    intent, cmd = pick(row, INTENT_KEYS), pick(row, CMD_KEYS)
    if intent and cmd:
        return intent, cmd
    for col in ("messages", "conversations"):
        if row.get(col):
            intent, cmd = msgs_to_pair(row[col])
            if intent and cmd:
                intent = re.sub(r"^Write the Linux bash command for:\s*", "", intent)
                return intent, re.sub(r"^```(?:bash|sh|shell)?\n?|```$", "", cmd).strip()
    # generic prompt/response
    p, r = row.get("prompt"), row.get("response")
    if isinstance(p, str) and isinstance(r, str):
        return p.strip(), r.strip()
    return None, None


def out(name):
    return open(RAW / f"{name}.jsonl", "w", encoding="utf-8")


def pick(row, keys):
    for k in keys:
        v = row.get(k)
        if isinstance(v, str) and v.strip():
            return v.strip()
    return None


def emit(fh, intent, command, os_hint, shell, source, license_, weight=1.0, **extra):
    if not intent or not command:
        return False
    row = {"intent": intent, "command": command.split("\n")[0].strip() if "\n" in command else command.strip(),
           "os_hint": os_hint, "shell": shell, "source": source, "license": license_, "weight": weight}
    row.update(extra)
    fh.write(json.dumps(row, ensure_ascii=False) + "\n")
    return True


def stream(ds_id, config=None, split="train", limit=None, where=None):
    from datasets import load_dataset
    kw = {"name": config} if config else {}
    ds = load_dataset(ds_id, split=split, streaming=True, **kw)
    n = 0
    for row in ds:
        if where and not where(row):
            continue
        yield row
        n += 1
        if limit and n >= limit:
            break


def reservoir(it, k, seed=7):
    import random
    rng = random.Random(seed)
    buf = []
    for i, item in enumerate(it):
        if i < k:
            buf.append(item)
        else:
            j = rng.randint(0, i)
            if j < k:
                buf[j] = item
    return buf


def hf(only=None):
    if only in (None, "alfa"):
        # --- NL2SH-ALFA: verified-ish linux bash corpus (train only; test is benchmark, never touched)
        with out("nl2sh_alfa") as f:
            n = 0
            for cfg in ("train", None):
                try:
                    for row in stream("westenfelder/NL2SH-ALFA", cfg):
                        n += emit(f, pick(row, INTENT_KEYS), pick(row, CMD_KEYS),
                                  "linux", "bash", "nl2sh-alfa", "paper", 2.0)
                    break
                except Exception as e:
                    print(f"nl2sh-alfa cfg={cfg}: {e}", file=sys.stderr)
            print(f"nl2sh-alfa: {n} rows")

    # --- cli-1m: bash native (reservoir 100K, clean flags) + pwsh cross-shell slice + dpo pairs
    def cli_ok(r):
        qf = r.get("quality_flags")
        return r.get("language") == "en" and (qf in ("[]", "", None, []) or not qf)

    if only in (None, "cli"):
      with out("cli1m_bash") as f:
        rows = reservoir((r for r in stream("carosh/cli-1m", "default") if cli_ok(r)), 100_000)
        n = 0
        for r in rows:
            i, c = pair(r)
            n += emit(f, i, c, "any-unix", "bash", "cli-1m", "apache-2.0",
                      1.5 if r.get("quality_tier") in ("gold", "hand-curated") else 1.0)
        print(f"cli-1m bash: {n} rows")
      with out("cli1m_pwsh") as f:
        rows = reservoir(
            (r for r in stream("carosh/cli-1m", "cross_shell")
             if cli_ok(r) and str(r.get("shell", "")).lower() in ("powershell", "pwsh")), 40_000)
        n = 0
        for r in rows:
            i, c = pair(r)
            n += emit(f, i, c, "windows", "powershell", "cli-1m-x", "apache-2.0")
        print(f"cli-1m pwsh: {n} rows")
      with out("cli1m_dpo") as f:
        try:
            n = 0
            for row in stream("carosh/cli-1m", "dpo"):
                intent = pick(row, INTENT_KEYS) or msgs_to_pair(row.get("prompt"))[0]
                ch = msgs_to_pair(row.get("chosen"))[1] if row.get("chosen") else None
                rj = msgs_to_pair(row.get("rejected"))[1] if row.get("rejected") else None
                if ch and rj:
                    n += emit(f, intent, ch, "any-unix", "bash", "cli-1m-dpo", "apache-2.0", 1.0, rejected=rj)
            print(f"cli-1m dpo: {n} pairs")
        except Exception as e:
            print(f"cli-1m dpo: {e}", file=sys.stderr)

    if only in (None, "multi"):
      # --- NL-SHELL-MULTI (nl2bash + tldr + nl2sh-alfa combined csv)
      with out("nl_shell_multi") as f:
        n = 0
        try:
            for row in stream("Mitchins/NL-SHELL-MULTI"):
                i, c = pair(row)
                n += emit(f, i, c, "any-unix", "bash", "nl-shell-multi:" + str(row.get("source", "?")), "mixed", 1.5)
        except Exception as e:
            print(f"nl-shell-multi: {e}", file=sys.stderr)
        print(f"nl-shell-multi: {n} rows")

    # --- kitty's original sources (breadth parity)
    kitty_sources = [
        ("GWHed/nl2bash", "nl2bash", "alfa"),
        ("AnishJoshi/nl2bash-custom", "nl2bash-custom", "kitty2"),
        ("emirkaanozdemr/bash_command_data_6K", "bash-6k", "alfa"),
        ("huytd189/command-line-suggestions", "cmdline-sugg", "alfa"),
        ("aelhalili/bash-commands-dataset", "bash-cmds", "kitty2"),
        ("Jawajawa/command-linux-bash-balanced-sft", "linux-balanced", "kitty2"),
        ("PocketDoc/Dans-Toolmaxx-ShellCommands", "toolmaxx", "kitty2"),
        ("TRamesh2/NL2CMD", "nl2cmd", "kitty2"),
        ("AryaYT/nl2shell-training-v3", "nl2shell-v3", "alfa"),
    ]
    for ds_id, tag, grp in kitty_sources:
        if only and only not in ("kitty2", grp):
            continue
        if only == "kitty2" and grp != "kitty2":
            continue
        with out(tag.replace("-", "_")) as f:
            n = 0
            try:
                for row in stream(ds_id):
                    i, c = pair(row)
                    n += emit(f, i, c, "any-unix", "bash", tag, "check-repo", 1.5)
            except Exception as e:
                print(f"{tag}: {e}", file=sys.stderr)
            print(f"{tag}: {n} rows")

    if only in (None, "misc"):
      # --- TerminalKnowledge: taxonomy only (not training rows)
      try:
        rows = list(stream("AeroAIAviation/TerminalKnowledge", None, "train", limit=50))
        (RAW / "terminal_knowledge.jsonl").write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows))
      except Exception as e:
        print(f"terminal-knowledge: {e}", file=sys.stderr)


def sparse_clone(repo, dest, paths):
    if Path(dest).exists():
        return
    subprocess.run(["git", "clone", "--depth", "1", "--filter=blob:none", "--sparse", repo, dest], check=True)
    subprocess.run(["git", "-C", dest, "sparse-checkout", "set", *paths], check=True)


TLDR_PLAT = {"osx": "darwin", "linux": "linux", "windows": "windows", "common": "any-unix"}


def tldr():
    dest = os.path.expanduser("~/lx-data/repos/tldr")
    sparse_clone("https://github.com/tldr-pages/tldr.git", dest, ["pages/common", "pages/linux", "pages/osx", "pages/windows"])
    n = 0
    with out("tldr") as f:
        for plat_dir, os_hint in TLDR_PLAT.items():
            d = Path(dest) / "pages" / plat_dir
            if not d.exists():
                continue
            for md in sorted(d.glob("*.md")):
                tool = md.stem
                descs = re.findall(r"^-\s+(.+?):\s*$", md.read_text(encoding="utf-8", errors="replace"), re.M)
                cmds = re.findall(r"^`([^`]+)`", md.read_text(encoding="utf-8", errors="replace"), re.M)
                for desc, cmd in zip(descs, cmds):
                    shell = "powershell" if os_hint == "windows" and re.match(r"^([A-Z][a-z]+-[A-Z]|[A-Z]:\\|winget|netsh|reg\b|taskkill|ipconfig)", cmd) else ("cmd" if os_hint == "windows" else "sh")
                    n += emit(f, desc.rstrip("."), cmd, os_hint, shell, f"tldr:{plat_dir}", "cc-by-4.0", 2.0, tool=tool)
    print(f"tldr: {n} rows")


def psdocs():
    dest = os.path.expanduser("~/lx-data/repos/psdocs")
    sparse_clone("https://github.com/MicrosoftDocs/PowerShell-Docs.git", dest,
                 ["reference/7.5/Microsoft.PowerShell.Core", "reference/7.5/Microsoft.PowerShell.Management",
                  "reference/7.5/Microsoft.PowerShell.Utility", "reference/7.5/Microsoft.PowerShell.Security",
                  "reference/7.5/NetSecurity", "reference/7.5/Storage", "reference/7.5/Microsoft.WSMan.Management",
                  "reference/7.5/Appx", "reference/7.5/CimCmdlets", "reference/7.5/Microsoft.PowerShell.LocalAccounts",
                  "reference/7.5/ScheduledTasks", "reference/5.1/Microsoft.PowerShell.Core"])
    n = 0
    with out("psdocs") as f:
        for md in Path(dest, "reference").rglob("*.md"):
            text = md.read_text(encoding="utf-8", errors="replace")
            cmdlet = md.stem
            for m in re.finditer(r"### Example \d+:\s*(.*?)\n(.*?)(?=^###|^##|\Z)", text, re.S | re.M):
                title = re.sub(r"\s+", " ", m.group(1)).strip().rstrip(".")
                body = m.group(2)
                for code in re.findall(r"```(?:powershell|powershell-console)?\n(.*?)```", body, re.S):
                    lines = [l.strip() for l in code.strip().split("\n")
                             if l.strip() and not l.strip().startswith("#") and not l.strip().startswith("PS ")]
                    if len(lines) == 1 and 10 < len(lines[0]) < 300:
                        n += emit(f, title or f"use {cmdlet}", lines[0], "windows", "powershell",
                                  "psdocs", "cc-by-4.0", 2.0, tool=cmdlet.lower())
    print(f"psdocs: {n} rows")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which == "hf" or which == "all":
        hf()
    elif which.startswith("hf:"):
        hf(only=which[3:])
    if which in ("tldr", "all"):
        tldr()
    if which in ("psdocs", "all"):
        psdocs()
    print("harvest done ->", RAW)
