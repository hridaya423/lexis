#!/usr/bin/env bash
# Usage: para-worker.sh <shard-dir> <worker-name>
# Claims unclaimed shards (atomic mkdir lock) and runs one headless devin session per shard.
cd "$1" || exit 1
for p in shard_*.prompt.md; do
  s=${p%.prompt.md}
  mkdir "$s.lock" 2>/dev/null || continue
  echo "$(date +%T) $2 start $s" >> workers.log
  devin -p --prompt-file "$p" --model swe-2-max --permission-mode accept-edits \
    --respect-workspace-trust false > "$s.log" 2>&1
  echo "$(date +%T) $2 done $s exit=$? lines=$(wc -l < "$s.out.jsonl" 2>/dev/null || echo 0)" >> workers.log
done
