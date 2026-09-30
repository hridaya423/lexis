
## Daily-use hardening — baselines (before changes, 2026-09-28)
- Eval plain 72-case unix: kitty-bash-0.5b 52/72 (p50 140 ms); qwen3-linuxcmd-4b 58/72 (p50 500 ms).
- `lexis plan` wall (warm server, web retry firing): hi 6797 ms · list files 482 · show disk usage 562 · install jq 1070 · what is using port 3000 880.

## Daily-use hardening — final state (2026-09-29)
- Runtime: `lx model tune` benchmarks llama-server flag profiles per model, persists winner in `tune.json`; kitty tuned `-fa on` = 556→200 ms median (-64%). Setup auto-tunes (`--no-tune` to skip). `LEXIS_TUNE_ARGS`/`LEXIS_SERVER_ARGS` escape hatches. Idle 1800 s default.
- Plain models: `-c 2048`, grammar `root ::= [^\n]+`, 64-token cap, thinking off, server warmup, cached ensure + stale-state recovery, 100 ms health polls.
- Approval: one-key card (enter/e/esc), critical = typed `yes`, inline edit re-runs policy from clean risk, missing-binary check runs before card (exit 127 + `lx install` hint), refusal sentinel → clean message. Non-TTY → auto-cancel.
- Web: confidence-retry killed for plain (was firing on every request — `hi` 6.8 s → 0.4 s). Intent triggers (install/update/missing-tool), lite-DDG fallback, negative cache, `Reference:` block on replan.
- Hooks: real-TTY guards (`-t 0`/`isatty stdin`/PS stdio) so `zsh -ic` agent shells get plain `command not found`; command-shaped passthrough; zsh ZLE accept-line widget handles unparseable English (`hi?`, `what's on port 3000`).
- Self-heal (one replan budget): missing head binary → `installedAlternative` table (`ss`→`netstat`/`lsof`, `ip`→`ifconfig`/`netstat`, `apt`↔`brew`, `md5sum`→`md5`, ~15 dialect pairs, filtered by `isInstalled`) → retry with intent-rewrite suffix `using X` (probed: kitty ignores parenthesized notes entirely — even verbatim tool names — but obeys `using`). Exec failure → retry with stderr tail (executor now captures bounded 2 KB `stderrTail`). Never retries signal-kills (user Ctrl+C) or user-edited commands.
- Prompt sharpening measured: `macOS (BSD)` hint → kitty 52→49 (refusal regressions), linuxcmd 58→60 (real gain). Catalog flag `dialectHint: false` opts kitty out; linuxcmd keeps it. Kitty eval unchanged at 52/72 (temp=0 ⇒ deterministic replay).
- Verified: 83/83 tests, eslint clean, PTY-verified card/edit/critical/refusal/missing-binary, live self-heal runs (`ss`→`netstat -tuln`, `ip`→`ifconfig`), evals kitty 52/72 + linuxcmd 60/72.
- Known ceiling: kitty can't follow correction context at all — exec-failure self-heal (stderr notes) only works for linuxcmd-class models. Real path past ~83%: fine-tune on Lexis-shaped data (intents + policy + platform dialects), not more model hunting.

## Round 3 (2026-09-29)
- Follow-up memory: referent prompts (`it/that/them/this`) compound the last lookup intent from audit (10-min window, same-cwd preferred) → `check port 3000` then `kill it` resolves on both models. `resolveFollowUp` pure + tested.
- `lx fix`: replans the last failed command_result with its stderrTail (now persisted to audit, bounded 500 B, redaction-inherited).
- Identical-replan guard: replan() returns false on unchanged commands → no doomed re-exec of partially-mutating commands.
- Audit events now carry `cwd`; memory + fix prefer same-directory anchors.
- Auto-run commands capped at execution.autoRunTimeoutSec (default 120 s, SIGTERM→SIGKILL); user-approved runs uncapped (killing mid-mutate is worse).
- Non-TTY card prints `non-interactive — pass --yes or --force to run` instead of dead key hints.
- history renders retry events. `fix` added to all four lx() allowlists + help.
- 86/86 tests, lint clean.
