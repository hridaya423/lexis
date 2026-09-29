#!/bin/bash
cd /Users/hridyaagrawal/Honey/React/smartterminal/lexis
M=$HOME/.local/share/lexis/models
run() { echo; echo "===== $(basename "$3" 2>/dev/null || echo "$2") $(date +%H:%M) ====="; node eval/run.mjs "$@" --repeat 2 --tag bake 2>&1 | tail -4; }
run --provider llama-server --model-file "$M/Qwen2.5-Coder-1.5B-Instruct-Q4_K_M.gguf"
run --provider llama-server --model-file "$M/Qwen3-1.7B-Q8_0.gguf"
run --provider llama-server --model-file "$M/Qwen3.5-2B-M-TS-Q4_K_M.gguf"
run --provider llama-server --model-file "$M/Qwen2.5-3B-Instruct.Q4_K_M.gguf"
run --provider llama-server --model-file "$M/nl2sh-1.5b-Q4_K_M.gguf" --plain
run --provider llama-server --model-file "$M/shellwhisperer-1.5b-Q4_K_M.gguf" --plain
run --provider llama-server --model-file "$M/howdo-4b-v4-Q4_K_M.gguf" --plain
run --provider apple-fm
echo; echo "===== ALL DONE $(date) ====="
