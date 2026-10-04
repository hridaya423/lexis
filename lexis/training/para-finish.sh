#!/usr/bin/env bash
# Unattended tail of the paraphrase job: steal unstarted mini shards once the local
# queue drains, retry short shards, then filter -> mix -> upload. Training is launched by hand.
set -u
D=~/lx-data/para-shards
T=$(cd "$(dirname "$0")" && pwd)
MINI=mac-tailscale
CLEAN_ENV=(env -i HOME="$HOME" USER="$USER" TERM=xterm PATH=/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:$HOME/.local/bin)
log() { echo "$(date +%T) $*" >> "$D/finish.log"; }

run_shard() {
  local s=$1
  rm -f "$D/$s.out.jsonl"
  log "local run $s"
  (cd "$D" && "${CLEAN_ENV[@]}" devin -p --prompt-file "$s.prompt.md" --model swe-2-max \
    --permission-mode accept-edits --respect-workspace-trust false > "$s.log" 2>&1)
  log "local done $s lines=$(wc -l < "$D/$s.out.jsonl" 2>/dev/null || echo 0)"
}

steal() {
  for p in "$D"/shard_*.prompt.md; do
    s=$(basename "$p" .prompt.md)
    ssh -o BatchMode=yes $MINI "mkdir ~/lx-para/$s.lock" 2>/dev/null || continue
    ssh -o BatchMode=yes $MINI "touch ~/lx-para/$s.stolen"
    run_shard "$s"
  done
}

complete() { [ "$(wc -l < "$D/$1.out.jsonl" 2>/dev/null || echo 0)" -ge 300 ]; }
sync_mini() { rsync -aq --include='*.out.jsonl' --exclude='*' $MINI:lx-para/ "$D/mini-out/"; for f in "$D"/mini-out/*.out.jsonl; do [ -e "$f" ] || continue; b=$(basename "$f"); complete "${b%.out.jsonl}" || cp "$f" "$D/$b"; done; }

mkdir -p "$D/mini-out"
log "finisher started"
while pgrep -f "para-worker.sh $D" >/dev/null; do sleep 60; done
log "local queue drained; stealing mini shards"
for _ in 1 2 3; do steal & sleep 5; done; wait
while ssh -o BatchMode=yes $MINI 'pgrep -f prompt-file' >/dev/null; do sleep 60; done
sync_mini
for pass in 1 2; do
  for p in "$D"/shard_*.prompt.md; do s=$(basename "$p" .prompt.md); complete "$s" || run_shard "$s"; done
done
missing=$(for p in "$D"/shard_*.prompt.md; do s=$(basename "$p" .prompt.md); complete "$s" || echo "$s"; done)
[ -n "$missing" ] && log "still incomplete after retries: $missing (continuing; filter treats them as missing)"

cd "$T" || exit 1
rm -f ~/lx-data/final/paraphrase.jsonl
python3 paraphrase.py --from-dir "$D" >> "$D/finish.log" 2>&1
python3 build_mix.py >> "$D/finish.log" 2>&1
modal volume put --force lx-data ~/lx-data/final/train_mix_chat.jsonl train_mix_chat.jsonl >> "$D/finish.log" 2>&1
log "FINISHED: mix uploaded as train_mix_chat.jsonl; training NOT launched (manual)"
