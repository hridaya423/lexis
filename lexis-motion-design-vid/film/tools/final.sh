#!/bin/bash
# Final master: render at 240fps, integrate a 270-degree shutter down to 60fps, mux the score.
# Cuts sit on 60fps frame boundaries, so each output frame only ever blends sub-frames of one shot.
set -e
cd "$(dirname "$0")/.."
npx hyperframes render --fps 240 --quality high -o renders/hi240.mp4
ffmpeg -v error -y -i renders/hi240.mp4 -i assets/score.wav \
  -filter_complex "[0:v]tmix=frames=3:weights='1 1 1',select='eq(mod(n\,4)\,2)',setpts=N/60/TB[v]" \
  -map "[v]" -map 1:a -r 60 -c:v libx264 -preset slow -crf 12 -pix_fmt yuv420p -profile:v high \
  -c:a aac -b:a 320k -movflags +faststart -shortest ../lexis-ad.mp4
ffprobe -v error -show_entries format=duration:stream=codec_type,r_frame_rate,width,height -of compact ../lexis-ad.mp4
