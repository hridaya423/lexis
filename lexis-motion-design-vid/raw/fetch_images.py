import json, os, sys
from concurrent.futures import ThreadPoolExecutor
from commons import download
L = [
 ("File:Reprogramming ENIAC.png","eniac_reprogram.jpg"),
 ("File:Glen Beck and Betty Snyder program the ENIAC in building 328 at the Ballistic Research Laboratory.jpg","eniac_beck_snyder.jpg"),
 ("File:Two women operating ENIAC.gif","eniac_two_women.png"),
 ("File:Margaret Hamilton - restoration.jpg","hamilton.jpg"),
 ("File:Buzz Aldrin's bootprint on the Moon, AS11-40-5877.jpg","bootprint.jpg"),
 ("File:IBM card storage.NARA.jpg","card_storage.jpg"),
 ("File:Blue-punch-card-front-horiz.png","punchcard_blue.png"),
 ("File:Teletype Model 33 (15427779806).jpg","teletype33.jpg"),
 ("File:DEC VT100 terminal.jpg","vt100.jpg"),
 ("File:DEC VT100 terminal transparent.png","vt100_cut.png"),
 ("File:Hollerith card reader closeup.jpg","hollerith_reader.jpg"),
 ("File:Oculus imaginationis inTractatus 1 Section 2 Portion 3 Robert Fludd’s Ars Memoriae Fludd, 1617.jpg","fludd_oculus.jpg"),
 ("File:Fotothek df tg 0006516 Theosophie ^ Philosophie ^ Judentum ^ Kabbala ^ Mnemotechnik ^ Theater.jpg","fludd_theatre.jpg"),
 ("File:Fotothek df tg 0006513 Theosophie ^ Philosophie ^ Judentum ^ Kabbala ^ Mnemotechnik.jpg","fludd_mnemo.jpg"),
 ("File:IBM 704 Computer Operations (LRC-1957-B701 P-05391).tiff","ibm704_langley.jpg"),
 ("File:IBM Electronic Data Processing Machine - GPN-2000-001881.jpg","ibm_edp.jpg"),
 ("File:Human computer with IBM 704 in 1959.jpg","human_computer_704.jpg"),
 ("File:The Blue Marble (remastered).jpg","blue_marble.jpg"),
 ("File:Blue Marble transparent.png","blue_marble_cut.png"),
 ("File:NASA-Apollo8-Dec24-Earthrise.jpg","earthrise.jpg"),
 ("File:Chip layout from the development phase of the Intel 4004 from 1971, the first microprocessor of the world (cropped and edited image).jpg","intel4004_layout.jpg"),
 ("File:Langley Women Computer with X-4 with Friden machine (LRC-1952-B701 P-74753).tiff","langley_friden.jpg"),
 ("File:Drawing of the brain, by Vesalius. Wellcome M0011758.jpg","vesalius_brain.jpg"),
 ("File:Apollo display and keyboard unit (DSKY) used on F-8 DFBW DVIDS683588.jpg","dsky.jpg"),
 ("File:Grace Hopper and UNIVAC.jpg","hopper_univac.jpg"),
 ("File:Punch card 1.jpg","punchcard_photo.jpg"),
]
os.makedirs("img", exist_ok=True)
def f(t):
    try: return download(t[0], "img/"+t[1])
    except Exception as e: return {"title": t[0], "error": str(e)}
import time
res=[]
for t in L:
    r=f(t); res.append(r); print(r.get("file"), r.get("license"), r.get("error","")[:80], flush=True); time.sleep(1.5)
json.dump(res, open("img/credits.json","w"), indent=1)

