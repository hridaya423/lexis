#!/usr/bin/env python3
"""Gate distilled rows: ~/lx-data/distill_raw.jsonl -> ~/lx-data/final/distill.jsonl

  unix:    verify.mjs --exec (syntax, heads per OS, exec sample, policy) + per-OS usage-db flag check
           + GNU-only idioms rejected on darwin / BSD-only idioms rejected on linux
  windows: PowerShell AST parse (pwsh in the lxverify container) + every head confirmed on win-pc
           earlier (headmap.json); unknown heads drop
  all:     decon vs every eval set (decon.py rules) + near-duplicate word-set check
"""
import json, re, subprocess, sys
from pathlib import Path
from crosslabel import GNU_ONLY, BSD_ONLY, usage_db, flags_ok
from decon import norm, shingles
from split import DATA, FINAL

ROOT = Path(__file__).resolve().parent.parent
EVALS = [ROOT / f"eval/datasets/{n}.jsonl" for n in ("core", "wide", "holdout", "testx")]


UNIX_EXTRA = {
    "linux": set("docker npm npx node pip pip3 pipx nvm nmcli snap setfacl getfacl xclip ufw xdg-open dmidecode flatpak upower lspci at add-apt-repository lsb_release logrotate hwclock cal gnome-control-center nautilus ubuntu-drivers exiftool black yarn pnpm".split()),
    "darwin": set("magick nvm exiftool pipx pyenv mas 7z sox jupyter pip pip3 yarn pnpm".split()),
}


def eval_index():
    intents = []
    for p in EVALS:
        for l in open(p, encoding="utf-8"):
            if l.strip():
                intents.append(json.loads(l)["intent"])
    return {norm(i) for i in intents}, [shingles(i) for i in intents], [set(norm(i).split()) for i in intents]


def leaks(intent, idx):
    exact, sh, words = idx
    if norm(intent) in exact:
        return True
    s, w = shingles(intent), set(norm(intent).split())
    if any(len(s & e) / max(1, len(s | e)) >= 0.6 for e in sh if e & s):
        return True
    return any(len(w & e) / max(1, len(w | e)) >= 0.8 for e in words if len(e) >= 3)


def win_parse(cmds):
    script = "$in = [Console]::In.ReadToEnd() | ConvertFrom-Json; foreach ($c in $in) { $e=$null; [void][System.Management.Automation.Language.Parser]::ParseInput($c,[ref]$null,[ref]$e); [Console]::Out.WriteLine($e.Count) }"
    out = subprocess.run(["docker", "exec", "-i", "lxverify", "pwsh", "-NoProfile", "-c", script],
                         input=json.dumps(cmds), capture_output=True, text=True, timeout=600).stdout.split()
    assert len(out) == len(cmds), f"pwsh parse returned {len(out)}/{len(cmds)}"
    return [n == "0" for n in out]


WIN_EXTRA = {h.lower() for h in """docker ffmpeg ffprobe pip pip3 python py magick scoop npx npm node dotnet code where.exe pwsh nvm pipx uv
    exiftool winget git ssh scp curl.exe tar Dism.exe dism compact.exe taskmgr sls gci ii ls cat Get-Volume Get-PhysicalDisk Get-Disk
    Get-Partition Optimize-Volume Get-LocalUser Get-LocalGroupMember Receive-Job New-NetFirewallRule Get-SmbSession Get-SmbShare
    Get-DiskImage Format-Volume Set-Disk Resize-Partition Get-InstalledModule""".split()}


def win_heads(cmd):
    hs = []
    for _ in range(3):
        cmd = re.sub(r"@?\{[^{}]*\}", "X", cmd)
    for seg in re.split(r"\|\||&&|\||;", cmd):
        seg = re.sub(r"^\s*[\(\{]+", "", seg.strip())
        w = seg.split()
        if w and not re.match(r"^[$@\[\"'.\d(-]", w[0]) and w[0].lower() not in ("if", "foreach", "for", "while", "where", "echo", "cd", "%", "?"):
            hs.append(w[0])
    return hs


def main():
    raw = [json.loads(l) for l in open(DATA / "distill_raw.jsonl", encoding="utf-8")]
    idx = eval_index()
    stats = {"in": len(raw), "leak": 0, "unix_fail": 0, "flag": 0, "idiom": 0, "win_parse": 0, "win_head": 0, "kept": 0}
    rows = []
    for r in raw:
        if leaks(r["intent"], idx):
            stats["leak"] += 1
        else:
            rows.append(r)

    unix = [r for r in rows if r["prompt_os"] != "windows"]
    tmp_in, tmp_out = DATA / "distill_unix_in.jsonl", DATA / "distill_unix_out.jsonl"
    tmp_in.write_text("".join(json.dumps(r) + "\n" for r in unix), encoding="utf-8")
    subprocess.run(["node", str(ROOT / "training/verify.mjs"), "--exec", "--exec-sample", "100000",
                    "--in", str(tmp_in), "--out", str(tmp_out)], check=True)
    dbs = {o: usage_db(o) for o in ("darwin", "linux")}
    kept = []
    passed = {}
    for l in open(tmp_out, encoding="utf-8"):
        v = json.loads(l)
        passed[(v["prompt_os"], v["intent"])] = v
    for r in unix:
        v = passed.get((r["prompt_os"], r["intent"]))
        o = r["prompt_os"]
        e = (v or {}).get("verified", {}).get("exec")
        ran_ok = e is None or e.get("exit") == 0 or not re.search(r"illegal|invalid option|unknown option|unrecognized|usage:|command not found", e.get("err") or "", re.I)
        heads_ok = v and (o in v["os"] or (v["verified"].get("syntax") and not str(v["verified"].get("flags")).startswith("bad") and all(
            ok is True or h.split(":", 1)[1] in UNIX_EXTRA[o] for h, ok in v["verified"]["heads"].items() if h.startswith(o + ":"))))
        if not heads_ok or not ran_ok:
            stats["unix_fail"] += 1
        elif not flags_ok(r["command"], dbs[o]):
            stats["flag"] += 1
        elif (GNU_ONLY if o == "darwin" else BSD_ONLY).search(r["command"]):
            stats["idiom"] += 1
        else:
            kept.append({**r, "os": [o], "risk": v.get("risk"), "readonly": v.get("readonly")})

    win = [r for r in rows if r["prompt_os"] == "windows"]
    known = {k.lower() for k, ok in json.load(open(DATA / "headmap.json"))["windows"].items() if ok is True} | WIN_EXTRA
    parsed = win_parse([r["command"] for r in win]) if win else []
    for r, ok in zip(win, parsed):
        if not ok:
            stats["win_parse"] += 1
        elif not all(h.lower() in known for h in win_heads(r["command"])):
            stats["win_head"] += 1
        else:
            kept.append({**r, "os": ["windows"]})

    stats["kept"] = len(kept)
    with open(FINAL / "distill.jsonl", "w", encoding="utf-8") as f:
        f.writelines(json.dumps(r, ensure_ascii=False) + "\n" for r in kept)
    print(json.dumps(stats))


if __name__ == "__main__":
    main()
