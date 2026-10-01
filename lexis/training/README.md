# lexis training pipeline

Data lives outside the repo at `~/lx-data/`. Order:

1. `harvest.py` — pull public corpora → `raw/*.jsonl`
   (`uv run --with datasets python harvest.py` or `hf:cli` / `hf:alfa` etc.)
2. `normalize.py` — raw → `candidates.jsonl` (dedupe, junk filter, unified schema)
3. packs + `expand.py` — `~/lx-data/shards/pack_*.jsonl` templates with
   `{{slot}}` grammars → `candidates-synth.jsonl`
4. `flagdb.py` — build `flagdb.json` (allowed flags per head, from man/`--help`)
5. `verify.mjs` — gates: bash -n / pwsh-parse syntax, `command -v` per OS
   (darwin local, linux in the `lxverify` docker container, windows via
   `ssh win-pc`), flag allowlists, sampled exec, policy tags
   → `verified.jsonl` (+ `verified-synth.jsonl` for pack rows)
   needs: docker up with `lxverify` container, win-pc reachable for windows gates
6. `split.py` — junk+license gates, decon vs ALL eval sets (holdout, core, wide,
   ALFA test; exact intent + 4-shingle), dedupe, source-cap balance, UNION-FIND
   family splits (shared intent OR shared command = same split) →
   `final/sft_{train,val,test}.jsonl` (Format A) + `*_chat.jsonl` (Format B,
   production prompt shape incl. platform suffix) + `final/dpo.jsonl`
   (train intents only) + `final/sources.json`
7. `fixcmd.py` — corrupt TRAIN commands, capture real stderr in docker →
   `final/fixcmd.jsonl` (must run after split.py; reads sft_train only)

Eval set: `merge-holdout.py` merges `~/lx-data/holdout-shards/shard-*.jsonl` →
`~/lx-data/holdout.jsonl` (frozen, sha in `holdout.sha256`, copy into
`eval/datasets/` to use). Baselines: kitty 34%, linuxcmd-4b 47%.

`../eval/icalfa.mjs` — NL2SH-ALFA external benchmark (exec-equivalence,
`--host-wsl` for local docker or default ssh win-pc WSL). Kitty: 71%.

`../eval/exec-judge.mjs` — per-case `expect.exec` execution checks wired into
`run.mjs --exec <os>`.

`decon.py` — standalone train-vs-test contamination checker (shingle index).
