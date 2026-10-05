# How the Lexis models were built

Lexis turns a plain-English request into one shell command for macOS, Linux or Windows. It shows that command on an approval card before anything runs. The models only translate requests into commands; deciding whether a command is safe to run is the job of the Lexis policy checker, which lives in the app, not in the weights.

Two models are published:

| | Base | Training data | Learning rate |
|---|---|---|---|
| `lexis-0.5b` | Qwen2.5-Coder-0.5B-Instruct | 147,065 rows (v6 mix) | 2e-5 |
| `lexis-1.5b` | Qwen2.5-Coder-1.5B-Instruct | 138,977 rows (v5 mix) | 1e-5 |

Both are full fine-tunes (every weight updated, no LoRA) for one epoch, then quantized to Q4_K_M with llama.cpp.

## Training data

Every row is one request and one command, in the chat format the app uses at run time (see the model cards). The v5 mix:

| Part | Rows | What it is |
|---|---|---|
| Verified base set | 54,268 | Requests from public command corpora (Apache-2.0, MIT, BSD-3-Clause-Clear and CC-BY-4.0 sources, plus tldr and the PowerShell docs), and templated packs covering one area each, such as launchd, the Windows registry, systemd or the macOS Finder. |
| Paraphrases | 15,997 | The same requests reworded, so the model sees terse, lowercase, typo-laden phrasing and not only tidy documentation English. |
| Cross-labelled | 3,266 | Requests answered by a second, larger model, kept only where its answer passed the checks below. |
| Distilled | 62,502 | Fresh requests and answers written by a coding agent in 120-pair shards, one platform per shard. Repeated three times in the mix. |
| Fix-a-failed-command | 3,000 | A training command corrupted on purpose (a bad flag, a typo), its real error text captured in a container, and the original command as the answer. |

The v6 mix used for the 0.5B adds 8,088 rows: 2,711 targeted examples, repeated three times. They cover about 60 tools a failure review showed the models didn't know, such as `log show`, `ditto` and `chflags nohidden` on macOS, `getent`, `setfacl -d`, `mtr` and `pacman` on Linux, and `powercfg /lastwake` on Windows. They also cover macOS-versus-Linux flag differences.

### Checks every row had to pass

Nothing went into training on trust. Each command was checked on the OS it was written for:

- **Syntax.** `bash -n` for shell commands. PowerShell's own parser, run on a Windows PC, for PowerShell.
- **The command exists.** `command -v` on a Mac for macOS rows and in a Docker container with the relevant tools installed for Linux rows. Windows commands were looked up on the Windows PC.
- **Every flag exists.** Each flag was checked against an allowlist built from that tool's man page or `--help` on that OS. This is what removes `ps --sort` from macOS rows, since it's a GNU-only flag.
- **It runs.** A sample of Linux commands was executed in a container as an unprivileged user.
- **Not copied from the test sets.** Rows whose request matched any evaluation case, exactly or by overlapping 4-word sequences, were removed. Train and validation were split by family: two rows sharing a request or a command always land on the same side.

For the targeted round, 3,591 rows went in and 2,711 survived. 670 were duplicates of earlier rounds, 12 overlapped an eval set, 134 failed to run on Linux, 13 used a flag that doesn't exist, and 50 used a Windows command that doesn't exist.

## Evaluation

The test cases were written separately from the training data and frozen before training. Every model in the table was run through the same harness, with the same prompt and the same grader, on an Apple M4 Pro.

- **core + wide (367 cases).** Everyday requests across the three platforms.
- **Selection half (992 cases).** Used to compare training runs and pick settings.
- **Final half (919 cases).** Run once per model, after the choice was made. It is the honest number.

A case passes if the first command the model produces is right. The grader accepts any of the known-good forms of an answer, not only one reference string, and for many cases it also runs the command in a container and checks the result. It still fails some valid alternatives, so the scores below slightly understate real accuracy.

| Model | core + wide | Selection half | Final half |
|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct, untrained | | | 188 / 919 (20.5%) |
| `lexis-0.5b` | 322 / 367 | 790 / 992 | 714 / 919 (77.7%) |
| `lexis-1.5b` | 338 / 367 | 836 / 992 | 757 / 919 (82.4%) |

Final half by platform:

| Model | macOS (337) | Linux (332) | Windows (250) |
|---|---|---|---|
| `lexis-0.5b` | 246 | 261 | 207 |
| `lexis-1.5b` | 265 | 284 | 208 |

Repeating a training run with a different random seed moves the selection score by about ±15 cases, so differences smaller than that are noise.

## What the models still get wrong

From reading all 217 failures of the 1.5B on the selection side:

- **Unknown tools (about 40).** Mostly rarer platform tools. The targeted round aimed at this.
- **Invented commands or flags (about 30).** `rm -sf`, `dnf ininstall`, or `md5 -s file`, which hashes the filename text instead of the file.
- **Missing a detail in the request (about 25).** `sort -n` when asked for biggest first, or a case-sensitive `grep` when told any capitalization.
- **Writing when asked only to look (about 12).** For example `sed -i` for "preview the replacement".
- **Broken syntax (about 8),** and fix-a-failed-command answers that investigate the problem instead of fixing it.

Three times it answered a harmless question with something drastic, such as remounting `/` with `noexec` for "disk usage of /". The approval card catches these, but it's the reason the models must not run commands without one.

## Things that didn't help

These are recorded so nobody repeats them expecting a gain:

- **More epochs or a higher learning rate.** Both overfit. One epoch was best at both sizes. The 0.5B's best rate (2e-5) was too high for the 1.5B, which did better at 1e-5.
- **DPO on mechanically checked pairs.** Twice, once per size. The model answered about 39,000 training requests five times each. Answers that failed a check above became "rejected" and verified answers became "chosen", which gave roughly 700 to 900 pairs at about 87% label accuracy, checked by hand on samples. The models learned to tell the pairs apart (held-out pair accuracy rose from 66% to 77% for the 1.5B), but eval scores didn't move: 836 before and 835 after. Only about one failure in ten is the kind a mechanical check can catch. The rest are commands that are valid but do the wrong thing.
- **Targeted data for unknown tools.** It raised the selection half by 40 cases for the 0.5B and 8 for the 1.5B. That half is biased upward, though, because the tool list came from reading its failures. On the final half the gains were +5 and +9, inside noise. The 0.5B ships with it because it was at least as good everywhere. The 1.5B ships without it because it lost ground on Windows.
- **A bigger quantization.** Q8_0 of the 1.5B scored 6 cases above Q4_K_M on the selection half, which is noise, at 1.65 GB against 986 MB.

The largest single gain came from model size: the 1.5B trained on the 0.5B's data beat it by 5 points on the final half. That was more than every data change combined.

## Reproducing

The pipeline is in the Lexis repository under `lexis/training/`; its README gives the order of steps. Training runs on Modal (`train_modal.py`, an A10G for the 0.5B and an L40S for the 1.5B). Evaluation is `lexis/eval/dev-eval.sh`. The training data itself is not published.
