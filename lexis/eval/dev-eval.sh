#!/bin/bash
set -u
GGUF=${1:-}
TAG=${2:-}
MODE=${3:-}
if [ -z "$GGUF" ] || [ -z "$TAG" ]; then
  echo "usage: dev-eval.sh <gguf> <tag> [--final]" >&2
  exit 2
fi
cd "$(dirname "$0")/.."
if [ "$MODE" = "--final" ]; then
  for os in darwin linux windows; do
    node eval/run.mjs --model-file "$GGUF" --prod --no-shots --dialect-hint --dataset holdout.jsonl --os "$os" --exec all --tag "$TAG-holdout-$os"
  done
else
  for ds in core.jsonl wide.jsonl; do
    for os in darwin linux windows; do
      node eval/run.mjs --model-file "$GGUF" --prod --no-shots --dialect-hint --dataset "$ds" --os "$os" --exec all --tag "$TAG-${ds%.jsonl}-$os"
    done
  done
fi
