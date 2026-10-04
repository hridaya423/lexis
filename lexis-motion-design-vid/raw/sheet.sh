#!/bin/bash
# usage: sheet.sh video.mp4 interval_seconds [cols] [start] [dur]
f="$1"; n="$2"; cols="${3:-12}"; ss="${4:-0}"; dur="${5:-99999}"
b="sheets/$(basename "${f%.*}")_${ss}"
mkdir -p sheets
ffmpeg -hide_banner -nostats -y -ss "$ss" -t "$dur" -skip_frame nokey -i "$f" \
  -vf "select='isnan(prev_selected_t)+gte(t-prev_selected_t\,$n)',scale=192:-2,showinfo,tile=${cols}x12:padding=2" \
  -fps_mode vfr "${b}_%02d.jpg" 2> "${b}.log"
rg -o "pts_time:[0-9.]+" "${b}.log" | sed 's/pts_time://' | awk -v ss="$ss" -v c="$cols" '{printf "%d:%.1f ", NR-1, $1+ss; if (NR%c==0) print ""}' > "${b}.times"
ls "${b}"_*.jpg
