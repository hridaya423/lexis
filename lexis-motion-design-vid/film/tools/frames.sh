#!/bin/bash
# Fast review: seek the composition in a plain browser and grab frames.
# usage: tools/frames.sh <outdir> <frame> [frame...]   (frames at 60fps)
out="$1"; shift
mkdir -p "$out"
agent-browser set viewport 1920 1080 >/dev/null 2>&1
agent-browser open "http://localhost:8765/index.html?r=$RANDOM" >/dev/null
agent-browser wait 1200 >/dev/null
for f in "$@"; do
  agent-browser eval "(async()=>{const {tl}=await LX_BUILD;const t=$f/60;
    await Promise.all([...document.querySelectorAll('video[data-start]')].map(v=>new Promise(r=>{
      const s=+v.dataset.start,d=+v.dataset.duration,m=+(v.dataset.mediaStart||0);
      v.style.visibility=(t>=s&&t<s+d)?'visible':'hidden';
      const ct=m+Math.max(0,Math.min(d,t-s)); if(Math.abs(v.currentTime-ct)<0.001) return r();
      v.addEventListener('seeked',()=>r(),{once:true}); v.currentTime=ct; setTimeout(r,800);})));
    tl.seek(t,false); return 1})()" >/dev/null
  agent-browser screenshot "$out/f$(printf %04d $f).png" >/dev/null
done
python3 - "$out" <<'EOF'
import sys, glob
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + "/f*.png"))
cols = 4; w, h = 480, 270
sheet = Image.new("RGB", (cols * w, ((len(fs) + cols - 1) // cols) * h), "gray")
for i, f in enumerate(fs):
    sheet.paste(Image.open(f).convert("RGB").resize((w, h)), ((i % cols) * w, (i // cols) * h))
sheet.save(sys.argv[1] + "/sheet.jpg", quality=88)
EOF
