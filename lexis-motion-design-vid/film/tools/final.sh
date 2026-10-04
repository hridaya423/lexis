#!/bin/bash
# Final master: render at 240fps, integrate a 270-degree shutter down to 60fps, CRT pass on the history half, mux audio.
# Cuts sit on 60fps frame boundaries, so each output frame only ever blends sub-frames of one shot.
# usage: tools/final.sh [audio.wav] [out.mp4] [--skip-render]
set -e
cd "$(dirname "$0")/.."
AUDIO="${1:-assets/score.wav}"
OUT="${2:-../lexis-ad.mp4}"
if [ "$3" != "--skip-render" ]; then
  npx hyperframes render --fps 240 --quality high -o renders/hi240.mp4
  ffmpeg -v error -y -i renders/hi240.mp4 \
    -vf "tmix=frames=3:weights='1 1 1',select='eq(mod(n\,4)\,2)',setpts=N/60/TB" \
    -r 60 -c:v libx264 -preset slow -crf 10 -pix_fmt yuv420p -an renders/mb60.mp4
  python3 ../raw/crt.py renders/mb60.mp4 renders/crt60.mp4
fi
ffmpeg -v error -y -i renders/crt60.mp4 -i "$AUDIO" -map 0:v -map 1:a -c:v libx264 -preset slow -crf ${CRF:-17} -pix_fmt yuv420p \
  -profile:v high -c:a aac -b:a 320k -movflags +faststart -shortest "$OUT"
ffprobe -v error -show_entries format=duration:stream=codec_type,r_frame_rate,width,height -of compact "$OUT"
