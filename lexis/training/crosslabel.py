#!/usr/bin/env python3
"""Show portable train rows under the other unix platform too.

Source labels put generic tools (sed/awk/grep/find) almost only on linux and dev CLIs
(docker/npm/kubectl) almost only on darwin, so the model learned "macOS -> exotic tool".

  prep:  train rows verified on one unix OS, with no OS-specific wording/paths
         -> ~/lx-data/xlabel_in.jsonl (os_hint any-unix) for verify.mjs
  merge: verify output -> ~/lx-data/final/crosslabel.jsonl, the other-OS copy of a row:
         linux->darwin only if it actually ran clean on this Mac (verify --exec; GNU-only
         flags like date -d / sed -i 's..' / find -printf pass the flag gate but fail here);
         darwin->linux if heads+flags pass in the linux image, or all heads are OS-agnostic
         CLIs the image doesn't ship, and no BSD-only idiom
"""
import json, re, subprocess, sys
from split import DATA, FINAL, pct

OS_WORDS = re.compile(r"\b(mac|macos|osx|os x|darwin|finder|spotlight|keychain|xcode|homebrew|brew|linux|ubuntu|debian|fedora|centos|rhel|arch|alpine|apt|yum|dnf|systemd|wsl)\b", re.I)
OS_PATHS = re.compile(r"/Applications|~/Library|/Library/|/System/|/Volumes/|/opt/homebrew|/usr/local/Cellar|/proc/|/sys/|/etc/apt|/etc/systemd|/dev/sd|/dev/disk|\.app\b|\.plist\b")
CROSS_CLI = {"docker", "docker-compose", "kubectl", "helm", "npm", "npx", "node", "pnpm", "yarn", "bun", "deno", "gh", "git",
             "cargo", "rustc", "rustup", "go", "python3", "pip", "pip3", "uv", "ffmpeg", "ffprobe", "yt-dlp", "terraform",
             "gcloud", "az", "aws", "jq", "yq", "rg", "fd", "fzf", "tmux", "curl", "wget", "ssh", "scp", "rsync", "openssl",
             "stripe", "flutter", "dart", "java", "mvn", "gradle", "ruby", "gem", "bundle", "php", "composer", "redis-cli",
             "psql", "mysql", "sqlite3", "mongosh", "pandoc", "convert", "magick", "exiftool", "httpie", "http", "nmap", "tldr"}
CROSS_CAP = 6000
BSD_TOOLS = r"(sed|find|xargs|cp|mv|rm|ln|stat|date|du|ls|head|tail|cut|tr|ps|touch|mkdir|chmod|chown|df|wc|uniq|split|join|paste|nl|tar)"
GNU_ONLY = re.compile(r"(^|[|;&(]\s*|\bsudo\s+)" + BSD_TOOLS + r"\b[^|;&]*\s--[a-z]|\bdate\b[^|;]*\s-d\b|\bsed\s+(-\w+\s+)*-i\s*['\"]?s|\bsed\b[^|;]*\\[ULlu]|"
                      r"\bfind\b[^|;]*-(printf|regextype|readable|writable|executable)\b|\bgrep\s+(-\w+\s+)*-\w*P|\bstat\s+(-\w+\s+)*-c\b|\bxargs\s+(-\w+\s+)*-\w*r\b|"
                      r"\bhead\s+-n\s*-\d|\bbase64\b[^|;]*\s-w\d*\b|\bps\s+(-\w+\s+)*(-e\w*|aux)\b[^|;]*--|\btop\b[^|;]*\s-b\b|\bps\s+-ef\b")
BASH_OR_GNU_SEMANTICS = re.compile(r"(^|[|;&(`]\s*)(help|shopt|mapfile|readarray|compgen|complete)\b|\bread\s+(-\w+\s+)*-\w*p\b|\$\{\w+(,,|\^\^)\}|"
                                   r"\bdate\b[^|;]*%N|\bfuser\b[^|;]*/(tcp|udp)\b")
LOW_QUALITY_SOURCES = ("cli-1m", "nl2sh-alfa", "cmdline-sugg", "nl2shell")


def quality_ok(r, tgt):
    if r.get("risk") in ("high", "critical"):
        return False
    if r["source"].startswith(LOW_QUALITY_SOURCES) and not r.get("readonly"):
        return False
    return tgt != "darwin" or not BASH_OR_GNU_SEMANTICS.search(r["command"])


ENOENT_ONLY = re.compile(r"No such file or directory|cannot open|does not exist|not found")
BAD_OPT = re.compile(r"illegal|invalid|unknown|unrecognized|usage:", re.I)
BSD_ONLY = re.compile(r"\bsed\s+(-\w+\s+)*-i\s*(''|\"\")|\bstat\s+(-\w+\s+)*-f\b|\bdate\b[^|;]*\s-[vj]\b|\bfind\s+-E\b|\bxargs\s+(-\w+\s+)*-J\b|\bls\b[^|;]*\s-\w*G|\bchmod\s+[+-]a\b|\bdate\b[^|;]*\s-r\s*\d")


USAGE_TOOLS = BSD_TOOLS.strip("()").split("|") + ["grep", "awk", "sort", "kill", "pkill", "pgrep", "lsof", "file", "basename", "dirname",
    "seq", "comm", "tee", "uname", "id", "env", "mktemp", "readlink", "realpath", "base64", "gzip", "gunzip", "zip", "unzip", "md5", "shasum",
    "dig", "ping", "netstat", "ifconfig", "rsync", "scp", "ssh", "diff", "cmp", "which", "whoami", "hostname", "uptime", "printf", "echo", "split", "fold", "rev", "expand", "column",
    "iostat", "vmstat", "install", "renice", "nice", "groups", "iconv", "shasum", "md5sum", "sha256sum", "traceroute", "nc", "xxd", "od", "hexdump", "less", "more",
    "bzip2", "xz", "zcat", "zless", "zgrep", "pgrep", "killall", "nohup", "watch", "free", "w", "who", "last", "umask", "fmt", "pr", "tsort", "cksum", "sum", "strings"]
BUILTINS = {"cd", "export", "unset", "alias", "true", "false", "exit", "source", ".", "bg", "fg", "jobs", "wait", "pwd", "type", "set", "read", "test", "[", "history"}
RUNNERS = {
    "darwin": lambda s: ["/bin/sh", "-c", s],
    "linux": lambda s: ["docker", "exec", "lxverify", "bash", "-c", s],
}


def usage_db(os_name):
    cache = DATA / f"{os_name}_usage.json"
    if cache.exists():
        return json.loads(cache.read_text())
    run = RUNNERS[os_name]
    db = {}
    for h in USAGE_TOOLS:
        try:
            text = subprocess.run(run(f"command -v {h} >/dev/null && {{ {h} --lx-bogus-flag; {h} --help{" all" if h == "ps" else ""}; }} </dev/null 2>&1"), capture_output=True, text=True, timeout=10).stdout
        except subprocess.TimeoutExpired:
            continue
        if not text.strip():
            continue
        usage = text[text.lower().index("usage"):].split("\n\n")[0] if "usage" in text.lower() else ""
        short = set("".join(re.findall(r"(?<![\w-])-([A-Za-z0-9@%,]+)", usage)))
        takes = set(re.findall(r"(?<![\w-])-([A-Za-z])\s*[<\[]?[a-z_#][\w.]*", usage))
        longs = set(re.findall(r"--([a-z][\w-]*)", usage))
        man = subprocess.run(run(f"MANWIDTH=200 man {h} 2>/dev/null | col -b"), capture_output=True, text=True, timeout=15).stdout
        for line in re.findall(r"^\s{1,10}(-.*)$", man + "\n" + text, re.M):
            defn = re.split(r"\s{2,}|\t", line)[0]
            for dash, name, arg in re.findall(r"(?<![\w-])(-{1,2})([A-Za-z][\w-]*)([ =\[]?[A-Z<]?)", defn):
                if dash == "--":
                    longs.add(name)
                elif len(name) == 1:
                    short.add(name)
                    if arg.strip(" [") or re.search(r"--[\w-]+=", defn):
                        takes.add(name)
        longs.update(re.findall(r"^\s{1,12}(?:\w,?\s+)+--([a-z][\w-]*)", man + "\n" + text, re.M))
        db[h] = {"short": sorted(short), "arg": sorted(takes), "long": sorted(longs)}
    cache.write_text(json.dumps(db))
    return db


def heads_known(cmd, db):
    return all(h in db or h in CROSS_CLI or h in BUILTINS for h in heads(cmd))


def flags_ok(cmd, db):
    for seg in re.split(r"\|\||&&|\||;|\$\(|`", cmd):
        ws = [w for w in seg.strip().split() if w not in ("sudo", "env")]
        if not ws or ws[0] not in db or ws[0] == "find":
            continue
        d = db[ws[0]]
        for w in ws[1:]:
            if w.startswith("--"):
                if len(w) > 2 and w[2:].split("=")[0] not in d["long"]:
                    return False
            elif re.match(r"^-[A-Za-z]", w):
                for ch in w[1:]:
                    if not ch.isalpha():
                        break
                    if ch not in d["short"]:
                        return False
                    if ch in d["arg"]:
                        break
    return True


def sub_heads_exist(cmd):
    for inner in re.findall(r"\$\(\s*([\w.-]+)|`\s*([\w.-]+)", cmd):
        h = inner[0] or inner[1]
        if subprocess.run(["/bin/sh", "-c", f"command -v {h}"], capture_output=True).returncode:
            return False
    return True


def heads(cmd):
    out = []
    for seg in re.split(r"\|\||&&|\||;", cmd):
        ws = [w for w in seg.split() if not re.match(r"^[A-Za-z_]+=", w) and w not in ("sudo", "env", "command", "builtin")]
        if ws and not re.match(r"^[/~.$({\"'\[@&-]", ws[0]):
            out.append(ws[0])
    return out


def prep():
    n = 0
    with open(DATA / "xlabel_in.jsonl", "w", encoding="utf-8") as f:
        for l in open(FINAL / "sft_train.jsonl", encoding="utf-8"):
            r = json.loads(l)
            if r["prompt_os"] == "windows" or len(r["os"]) != 1 or OS_WORDS.search(r["intent"]) or OS_PATHS.search(r["command"]):
                continue
            f.write(json.dumps({**r, "os_hint": "any-unix", "src_os": r["os"][0]}) + "\n")
            n += 1
    print(f"prep: {n} candidates -> {DATA / 'xlabel_in.jsonl'}")


def merge():
    by_target = {"darwin": [], "linux": []}
    usage = {o: usage_db(o) for o in RUNNERS}
    rows = [json.loads(l) for l in open(DATA / "xlabel_out.jsonl", encoding="utf-8")]
    rows = [r for r in rows if r["src_os"] == "darwin"] + [json.loads(l) for l in open(DATA / "xlabel_exec_out.jsonl", encoding="utf-8")]
    for r in rows:
        src = r["src_os"]
        tgt = "linux" if src == "darwin" else "darwin"
        hs, v = heads(r["command"]), r["verified"]
        e = v.get("exec")
        ran_ok = e is not None and (e.get("exit") == 0 or (ENOENT_ONLY.search(e.get("err") or "") and not BAD_OPT.search(e.get("err") or "")))
        db = usage[tgt]
        ok = heads_known(r["command"], db) and flags_ok(r["command"], db) and (
             (tgt == "darwin" and "darwin" in r["os"] and not GNU_ONLY.search(r["command"]) and (ran_ok or e is None)
              and sub_heads_exist(r["command"])) or
             (tgt == "linux" and not BSD_ONLY.search(r["command"]) and
              ("linux" in r["os"] or (hs and all(h in CROSS_CLI for h in hs) and v.get("syntax")))))
        if ok and quality_ok(r, tgt):
            pos = tgt
            shell = ("zsh" if pct(r["intent"], "sh") < 75 else "bash") if pos == "darwin" else ("bash" if pct(r["intent"], "sh") < 85 else "zsh")
            by_target[tgt].append({k: r[k] for k in ("intent", "command", "source", "license", "weight")} | {"os": [src, tgt], "prompt_os": pos, "shell": shell})
    out = []
    for tgt, rows in by_target.items():
        rows.sort(key=lambda r: pct(r["intent"] + r["command"], "xl"))
        out += rows[:CROSS_CAP]
        print(f"{tgt}: {len(rows)} portable, kept {min(len(rows), CROSS_CAP)}")
    with open(FINAL / "crosslabel.jsonl", "w", encoding="utf-8") as f:
        f.writelines(json.dumps(r, ensure_ascii=False) + "\n" for r in out)


if __name__ == "__main__":
    {"prep": prep, "merge": merge}[sys.argv[1]]()
