#!/bin/bash
# usage: sheet2.sh video.mp4 interval [start] [dur]   -> tile i is at start + i*interval
f="$1"; n="$2"; ss="${3:-0}"; dur="${4:-99999}"
b="sheets/$(basename "${f%.*}")_full_${ss}"
mkdir -p sheets
ffmpeg -v error -y -ss "$ss" -t "$dur" -i "$f" -vf "fps=1/$n,scale=192:-2,tile=12x12:padding=2" -fps_mode vfr "${b}_%02d.jpg"
ls "${b}"_*.jpg
