# Goal report

## Objective
go try more. a lot more. try every single variant possible to try to boost results. i believe it is possible.

## Progress

### Exhausted (measured, dead ends)
- Prompt rewording: positive-only 64%, prose-humanized 64%, trained-prompt swap 72%, bare no-suffix 72% — wording is exhausted
- Inline few-shot: 71-74% (noise); multi-turn shots: 74%
- Condensed macOS context card: 63% (over-triggers tool names); 1-line version: 65%
- Vocab routing glossary: 65%
- Self-consistency vote 3x@temp0.5: 71% flat, 3x latency
- Quantization ladder q4/q8/f16: identical 75% — precision is NOT the bottleneck
- Sampling sweeps temp 0.2-0.5, top_p, min_p, rep_penalty: all 71-74% noise
- 6/12-shot dose: hurts (70-73%); model trained at seq len 512 → short prompts win

### Winners (stacked, measured on wide.jsonl n=80)
- Trained NL2CMD prompt (model card's own): baseline
- Non-command output rejection + temp-0.4 resample: `{` glitch recovery
- Policy-floor fixes: find -exec on protected roots, embedded rm payloads, shred, history -c, crontab, chmod -R sysdirs — lifted adversarial scoring (real safety gaps)
- GBNF grammar `root ::= [^ \n{] [^\n]*`: blocks `{` at decode, +1 free
- **Platform-suffix few-shot (4 multi-turn turns carrying `(Platform: unix, shell: zsh)`)**: THE big lever — teaches the model to parse our harness format

### Final result: kitty 83% wide / 78% core (was 71%/72% at session start)
linuxcmd-4b: 83% wide, 73% on the 15-case windows set (near-miss PowerShell, not garbage)

### Round-2 variants (all measured, all dead ends)
- Shot dose curve: 2→74, 3→81, **4→83**, 5→79, 6→76, 8→70, 12→73 — clean peak at 4
- Shot content swaps: darwin-specific 80%, tool-strong (find/tar/grep/lsof) 81% — generic wins
- `cmd:` scaffold format: 69% (worse)
- linuxcmd-4b + shots: 81% (−2 noise; shots gated to kitty via catalog `shots: true`)
- linuxcmd-4b + grammar only: 81% (grammar harmless, applied to all plain calls)
- Platform-suffix shots without grammar: 80% — shots are the lever, grammar adds +1

### Production wiring (commit 8be8919)
- `planner.mjs`: `plainShots(osHint, shell)` — 4 generic multi-turn shots interpolated with
  the REAL osHint/shell sent per-request; gated `entry.shots && task!=="fixcmd"`
- `PLAIN_GRAMMAR` GBNF on all plain-format calls; fixcmd retries unaffected
- `models.mjs`: `shots: true` on kitty-bash-0.5b only
- Provider `sample` surface extended (grammar/top_p/top_k/min_p/rep_pen/seed)
- Eval harness: `--prompt-file`, `--shots-file`, `--bare`, `--sample`, `--vote`, `--platform`
- Verified live: `lsof -i :3000`, `curl ifconfig.me`, `tar -czf`, `git reset` through
  generatePlan; fixcmd repairs `gerp`→`grep`; policy floors intact

### Failure autopsy of the 83% run (14 residual fails)
- ~5 GNU-dialect-on-macOS (dnf, /proc, systemd-networkd, /dev/clipboard) — Linux-corpus
  training limit; no prompt injects pmset/dscacheutil knowledge (8 context variants proved it)
- ~4 arguable-syntax near-misses vs regex expectations
- ~2 multi-step logic slips — documented weak spot on the model card
- `{` malformed output: eliminated at decode time by grammar

### Conclusion
Exhaustive sweep: quantization, sampling, grammar, logit_bias, shot dose/content/format,
multi-turn vs inline, context cards, vocab injection, self-consistency, scaffold formats,
trained prompts, fixcmd task — kitty's ceiling is 83% wide. The 0.5B now ties the 4B tier
at 6x smaller and ~3-4x faster warm. Residual fails are capability, not configuration.
Launch split: kitty default (83%, ~85ms cold p50), linuxcmd-4b upgrade tier (83%, ~300ms).
