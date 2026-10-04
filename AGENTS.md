<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Lexis model training/eval (lexis/)

- Tests: `cd lexis && npm test`.
- Dev eval of a GGUF (core + wide + testx + holdout_a, per OS, production prompt path): `bash lexis/eval/dev-eval.sh <gguf> <tag>`; summary: `python3 lexis/eval/summary.py [tag-prefix...]`.
- `holdout_a` is for model selection; `holdout_b` is touched once for the final report (`dev-eval.sh <gguf> <tag> --final`). Never select on holdout_b.
- Only one eval at a time (shared llama-server): queue jobs as `~/lx-data/evalq/NN-name.sh` for `~/lx-data/evalq-runner.sh`.
- Training: `lexis/training/train_modal.py` on Modal (`--full`, 1 epoch, lr 2e-5 is the best recipe so far; more epochs or higher LR overfit). Mix: `build_mix.py <out> crosslabel distill:3`.
- Data gates: `verify.mjs` (needs Docker `lxverify` container; linux exec runs as `nobody`), `distill_verify.py`, `fixcmd.py`. Docker Desktop tends to quit; check `docker info` before verifying.
