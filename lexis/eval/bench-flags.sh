#!/usr/bin/env bash
# llama-server flag tuning: run the eval once per flag profile, restarting the
# server between profiles. Compare warm p50 across reports.
#   bash eval/bench-flags.sh <model.gguf> [case-limit]
set -u
MODEL="${1:?usage: bench-flags.sh <model.gguf> [limit]}"
LIMIT="${2:-30}"
cd "$(dirname "$0")/.."

profiles=(
  ""                              # shipped defaults
  "-t 8"                          # explicit threads
  "-fa on"                        # flash attention
  "-c 2048"                       # smaller context
  "--cache-reuse 0"               # no prompt-prefix reuse
  "-fa on -c 4096 --cache-reuse 256"  # combined best guess
)

for flags in "${profiles[@]}"; do
  tag="flags_$(echo "${flags:-default}" | tr ' /' '__' | tr -cd '[:alnum:]_.-')"
  echo "=== profile: '${flags:-default}'"
  node src/index.mjs model stop >/dev/null 2>&1 || true
  LEXIS_SERVER_ARGS="$flags" node eval/run.mjs --provider llama-server --model-file "$MODEL" \
    --limit "$LIMIT" --repeat 2 --tag "$tag" 2>&1 | tail -3
done
