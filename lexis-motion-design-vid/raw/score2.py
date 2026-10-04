"""Lexis ad score v2: cinematic techno-optimism, cut to the v2 picture.

0.00  CRT power-on, dark drone, cursor ticks
0.50  window opens: projector clatter under the patent strobe
0.77  montage: tom roll + arp accelerate into the drop, every cut hits a rising ladder
2.65  DROP (Saturn V): taiko, sub drop, crash, supersaw anthem D-A-Bm-G-A, sidechained, bell lead
6.25  punch: music cuts to a low drone; typewriter strikes into Fludd's memory panels
6.85  slam: cluster stab, then teletype/keyboard chatter and a Shepard climb
7.75  CRT power-off, then true silence
8.45  paper floods: soft swell, then the Lexis bloom (G - D/F# - Em - A), keys + Return + morph sparkles
13.67 logo lands on D major, rings out
"""
import os, subprocess
import numpy as np
from synth import *

DUR = 15.0
N = int(SR * (DUR + 3))


def fr(f):
    return f / 60.0


def beat(b):
    return fr(159) + 0.6 * b


music, drums, fx, keys, low, lead = (Bus(N) for _ in range(6))

# ---------- 0. power-on ----------
fx.add(crt_on(0.45), 0.0, 0.7)
low.add(sub(midi(26), 0.5, 0.5, attack=0.2), 0.0, 0.4)
relay = load("sfx/relay.mp3")
for f in (0, 17):
    fx.add(relay, fr(f), 0.45)
fx.add(noise_riser(fr(30) - fr(18), 0.5, 2.2), fr(18), 0.55)

# ---------- 1. window + patent strobe ----------
drums.add(taiko(1.0), fr(30), 0.75)
low.add(subdrop(1.0, 80, 35), fr(30), 0.55)
fx.add(projector(fr(47) - fr(30), 30), fr(30), 0.45)
for f in range(30, 47, 2):
    fx.add(blip(midi(86 + (f - 30) // 2), 0.02, 0.8, 120), fr(f), 0.12, pan=0.4 * ((f // 2) % 2 * 2 - 1))
drums.add(kick(0.4, 0.9), fr(46), 0.7)

# ---------- 2. acceleration into the drop ----------
cuts = [46, 57, 60, 79, 82, 97, 100, 113, 116, 127, 130, 139, 142, 151, 155]
ladder = [62, 64, 66, 69, 71, 73, 74, 76, 78, 81, 83, 85, 86, 88, 90]
for f, m in zip(cuts, ladder):
    fx.add(blip(midi(m), 0.07, 0.25, 40), fr(f), 0.4, pan=0.3 * ((f // 7) % 3 - 1))
    drums.add(tom(70 + (m - 62) * 3, 0.35), fr(f), 0.35)
# tom roll: interval shrinks from 1/8 to 1/32 at the drop tempo
t, k = fr(60), 0
while t < beat(0) - 0.02:
    u = (t - fr(60)) / (beat(0) - fr(60))
    gap = lerp_ = 0.15 * (1 - u) ** 1.4 + 0.035
    drums.add(tom(85 + 40 * u, 0.25), t, 0.18 + 0.32 * u, pan=0.35 if k % 2 else -0.35)
    t += gap
    k += 1
# arp climbs on D minor-to-major colour, accelerating with the roll
arp = [50, 57, 62, 64, 66, 69, 74, 76, 78, 81]
t, k = fr(46), 0
while t < beat(0) - 0.05:
    u = (t - fr(46)) / (beat(0) - fr(46))
    gap = 0.12 * (1 - u) + 0.05
    lead.add(pluck(midi(arp[k % len(arp)] + 12 * (k // len(arp) % 2)), 0.3, 1.0 + u), t, 0.10 + 0.14 * u, pan=0.5 * np.sin(k))
    t += gap
    k += 1
fx.add(shepard(beat(0) - fr(60), 110, 0.12), fr(60), 0.8)
fx.add(noise_riser(beat(0) - fr(80), 0.9, 3.0), fr(80), 0.7)
music.add(supersaw([midi(m) for m in (50, 57, 62)], beat(0) - fr(46), bright=2.5, attack=1.6, release=0.02), fr(46), 0.35)
low.add(sub(midi(26), beat(0) - fr(46), 0.0, attack=1.5), fr(46), 0.35)
fx.add(crash(0.4)[::-1] * np.linspace(0, 1, int(0.4 * SR))[:, None] ** 2, beat(0) - 0.4, 0.6)

# ---------- 3. the drop: beats 0..6 ----------
CH = {
    "D": [38, 50, 57, 62, 66, 69], "A": [33, 49, 57, 61, 64, 69], "Bm": [35, 50, 54, 59, 62, 66],
    "G": [31, 50, 55, 59, 62, 67], "A2": [33, 52, 57, 61, 64, 71], "Em": [28, 52, 55, 59, 62, 67],
    "D/F#": [30, 50, 54, 57, 62, 69], "Asus": [33, 50, 52, 57, 62, 64], "Dmaj9": [26, 50, 57, 61, 64, 66, 69, 73],
}
roar = load("sfx/saturn_roar.wav")
fx.add(roar[:int(2.4 * SR)] * np.linspace(1, 0, int(2.4 * SR))[:, None] ** 1.3, beat(0), 0.8)
drums.add(taiko(1.4), beat(0), 1.0)
drums.add(crash(2.6), beat(0), 0.9)
low.add(subdrop(1.6, 100, 37), beat(0), 0.9)
prog = [(0, 2, "D"), (2, 1, "A"), (3, 1, "Bm"), (4, 1, "G"), (5, 1, "A2")]
kicks = []
for b0, nb, ch in prog:
    notes = CH[ch]
    d = 0.6 * nb
    music.add(supersaw([midi(m) for m in notes[1:]], d + 0.05, bright=5.5, attack=0.006, release=0.12, seed=b0), beat(b0), 0.55)
    for e in range(int(nb * 2)):
        low.add(sub(midi(notes[0] + 12 * (e % 2 == 1)), 0.28, 2.5), beat(b0) + 0.3 * e, 0.55)
for b in range(6):
    drums.add(kick(0.5, 1.1), beat(b), 1.0)
    kicks.append(beat(b))
    drums.add(hat(0.3, True), beat(b) + 0.3, 0.35, pan=0.25)
    for q in (0.15, 0.45):
        drums.add(hat(0.03), beat(b) + q, 0.25, pan=-0.3)
    if b % 2 == 1:
        drums.add(clap(), beat(b), 0.6)
# 16th arp
for b in range(6):
    notes = CH[[c for b0, nb, c in prog if b0 <= b < b0 + nb][0]]
    pat = [notes[2], notes[3], notes[4], notes[3] + 12, notes[5], notes[4] + 12, notes[3] + 12, notes[5] + 12]
    for s in range(4):
        lead.add(pluck(midi(pat[(b * 4 + s) % 8] + 12), 0.25, 1.8), beat(b) + 0.15 * s, 0.13, pan=(-0.4, 0.4)[s % 2])
# bell motif
motif = [(0, 78, 0.6), (1, 81, 0.6), (2, 85, 0.3), (2.5, 83, 0.3), (3, 81, 0.6), (4, 79, 0.6), (5, 81, 0.6)]
for b, m, d in motif:
    lead.add(bell(midi(m), 1.2), beat(b), 0.32, pan=0.15)
for f in (196, 232, 268, 304, 340):
    fx.add(blip(1600, 0.05, 0.7, 60), fr(f), 0.18, pan=-0.5)
for f in range(233, 300, 3):
    fx.add(blip(3200, 0.012, 0.9), fr(f), 0.08, pan=0.6)
# brain -> chip zoom-through, flipbook shutters, riser into the cut
fx.add(noise_riser(fr(326) - fr(312), 0.7, 2.2), fr(312), 0.55)
drums.add(tom(140, 0.3), fr(326), 0.5)
for f in (334, 338, 342, 345, 348, 351, 354, 356, 358, 360, 362, 364, 366):
    fx.add(relay, fr(f), 0.4)
    fx.add(blip(midi(88 + (f - 334) // 3), 0.02, 0.9, 140), fr(f), 0.1)
fx.add(shepard(fr(375) - fr(334), 220, 0.1), fr(334), 0.8)

# ---------- 4. punch ----------
P0 = fr(375)
music.add(supersaw([midi(m) for m in (38, 45, 51)], fr(483) - P0, bright=1.4, attack=0.01, release=0.06, detune=0.2), P0, 0.45)
low.add(sub(midi(26), fr(483) - P0, 0.15), P0, 0.55)
drums.add(kick(0.6, 1.0, 42), P0, 0.8)
tw_hits = slices("sfx/typewriter.mp3", 12, 0.18)
for n, f in enumerate((381, 386, 391, 396, 401)):
    keys.add(tw_hits[n % len(tw_hits)], fr(f), 0.75)
    lead.add(bell(midi(74 + n), 0.5), fr(f), 0.1)
# slam
S0 = fr(411)
drums.add(taiko(1.2), S0, 1.0)
drums.add(kick(0.6, 1.4, 45), S0, 1.0)
drums.add(crash(1.8), S0, 0.7)
low.add(subdrop(0.9, 120, 30), S0, 0.9)
music.add(saturate(supersaw([midi(m) for m in (50, 51, 56, 57, 62, 63)], 0.5, bright=9, attack=0.002, release=0.3), 2.5), S0, 0.55)
tele = load("sfx/teletype.mp3")
seg_ = tele[int(2 * SR):int(2 * SR) + int((fr(466) - fr(413)) * SR)]
fx.add(seg_ * np.linspace(0.5, 1.0, len(seg_))[:, None], fr(413), 2.0)
kb = load("sfx/kb_blue.mp3")
seg_ = kb[int(5 * SR):int(5 * SR) + int((fr(466) - fr(415)) * SR)]
keys.add(seg_ * np.linspace(0.4, 1.0, len(seg_))[:, None] ** 0.5, fr(415), 2.2)
fx.add(shepard(fr(466) - fr(413), 160, 0.16), fr(413), 0.9)
music.add(supersaw([midi(m) for m in (62, 63, 68, 69, 74, 75)], fr(466) - fr(413), bright=3, attack=0.5, release=0.02, detune=0.25), fr(413), 0.3)
# CRT power-off
fx.add(crt_off(0.4), fr(465), 0.9)
fx.add(tone_riser(midi(76), midi(40), fr(481) - fr(465), 0.25), fr(465), 0.6)
fx.add(blip(midi(98), 0.04, 0.0, 30), fr(481), 0.25)

# ---------- 5. silence, flood, Lexis ----------
fx.add(blip(midi(86), 0.06, 0.1), fr(497), 0.3)
fx.add(noise_riser(fr(519) - fr(503), 0.5, 2.0, hi_end=0.5), fr(503), 0.6)
fx.add(tone_riser(midi(62), midi(86), fr(519) - fr(505), 0.06), fr(505), 0.6)
L = [(10, 2, "G"), (12, 2, "D/F#"), (14, 1.5, "Em"), (15.5, 2.95, "Asus")]
for b0, nb, ch in L:
    notes = CH[ch]
    d = 0.6 * nb
    music.add(supersaw([midi(m) for m in notes[1:]], d + 0.3, bright=3.5, attack=0.08, release=0.35, seed=int(b0)), beat(b0), 0.4)
    low.add(sub(midi(notes[0] + 12), d, 0.5), beat(b0), 0.55)
    for e in range(int(nb * 2)):
        lead.add(piano(midi(notes[2 + e % 4] + 12), 0.8), beat(b0) + 0.3 * e, 0.22, pan=-0.3 + 0.15 * (e % 4))
drums.add(taiko(1.0), beat(10), 0.55)
drums.add(crash(1.6), beat(10), 0.35)
for b in range(10, 18):
    drums.add(kick(0.4, 0.85), beat(b), 0.75)
    kicks.append(beat(b))
    drums.add(hat(0.25, True), beat(b) + 0.3, 0.22, pan=0.25)
    if b % 2 == 1:
        drums.add(clap(0.3), beat(b), 0.4)
ASKS = [dict(a=520, q="unpack this archive", type=1.3, press=551, morph=556),
        dict(a=598, q="what's on port 3000", type=0.9, press=622, morph=627),
        dict(a=650, q="undo my last commit", type=1.0, press=675, morph=681)]
key_hits = slices("sfx/kb_slow.mp3", 30, 0.12)
enter = load("sfx/enter.mp3")
for n, ask in enumerate(ASKS):
    for i, c in enumerate(ask["q"]):
        tt = round(ask["a"] + 2 + i * ask["type"] + (jhash(i, n) - 0.5) * ask["type"] * 0.7)
        keys.add(key_hits[(i * 7 + n * 3) % len(key_hits)], fr(tt), 0.5 if c != " " else 0.7, pan=0.1)
    keys.add(enter / (np.abs(enter).max() + 1e-9), fr(ask["press"]), 0.9)
    drums.add(kick(0.25, 0.6), fr(ask["press"]), 0.4)
    chord = CH[["G", "D/F#", "Asus"][n]]
    for s, m in enumerate([chord[2], chord[3], chord[4], chord[5], chord[3] + 12, chord[4] + 12]):
        lead.add(bell(midi(m + 12), 0.8), fr(ask["morph"]) + s * 0.035, 0.14, pan=-0.5 + s * 0.2)
    fx.add(noise_riser(0.25, 0.3, 0.5)[::-1], fr(ask["morph"]), 0.15)
for k in range(60):
    tt = fr(699) + (k / 60) ** 0.8 * 0.7 + rng.uniform(0, 0.02)
    fx.add(blip(2400 + 1800 * rng.random(), 0.01, 0.9), tt, 0.07, pan=rng.uniform(-0.8, 0.8))
for k in range(10):
    keys.add(key_hits[(k * 5) % len(key_hits)], fr(776 + k * 0.9), 0.3, pan=0.3 - k * 0.04)
for k in range(7):
    keys.add(key_hits[(k * 3 + 1) % len(key_hits)], fr(786 + k * 0.85), 0.3, pan=0.1 - k * 0.04)
for k in range(26):
    tt = fr(801) + (k / 26) * (fr(820) - fr(801))
    fx.add(blip(1400 + 90 * k, 0.014, 0.8), tt, 0.13, pan=-0.6 + 1.2 * k / 26)
    keys.add(key_hits[k % len(key_hits)], tt, 0.16, pan=-0.6 + 1.2 * k / 26)
fx.add(noise_riser(fr(820) - fr(788), 0.8, 2.6), fr(788), 0.6)
fx.add(shepard(fr(820) - fr(788), 220, 0.08), fr(788), 0.7)
# logo lands
LAND = fr(820)
music.add(supersaw([midi(m) for m in CH["Dmaj9"][1:]], DUR - LAND + 0.4, bright=4.5, attack=0.004, release=1.1), LAND, 0.6)
low.add(subdrop(1.8, 90, 37), LAND, 0.9)
drums.add(taiko(1.6), LAND, 1.0)
drums.add(kick(0.7, 1.3), LAND, 1.0)
drums.add(crash(2.8), LAND, 0.8)
for s, m in enumerate((74, 78, 81, 85, 86, 90)):
    lead.add(bell(midi(m), 1.6), LAND + s * 0.06, 0.26, pan=-0.5 + s * 0.2)
lead.add(piano(midi(50), 1.4), LAND, 0.3)

# ---------- mix ----------
mus = sidechain(music.x, kicks + [beat(0), fr(411), LAND], 0.55)
mus = reverb(lp(hp(mus, 150), 7000), 2.4, 0.32, width=1.0)
ld = reverb(lp(hp(lead.x, 300), 9000), 2.0, 0.38)
dr = reverb(drums.x, 1.1, 0.14, tone=30)
fxb = reverb(fx.x, 1.6, 0.25)
ky = reverb(keys.x, 0.5, 0.1, tone=20)
lw = lp(low.x, 160)
mixd = mus * 1.0 + ld * 0.9 + dr * 0.85 + fxb * 0.85 + ky * 1.1 + lw * 0.42
os.makedirs("stems", exist_ok=True)
np.save("stems/sfx.npy", (fxb * 0.85 + ky * 1.1)[:int(DUR * SR)].astype(np.float32))
mixd = hp(mixd, 26, 6)
mixd = shelf(mixd, 5000, -3.0)
mixd = mixd[:int(DUR * SR)]
# macro dynamics: a quiet open, a build that climbs into the drop, a drop that hits, a breath, a warm Lexis bed, a big landing
pts = [(0, -15), (0.5, -11), (0.78, -13), (2.55, -4.5), (2.64, -4.5), (2.65, 0), (6.24, -0.5), (6.25, -8), (6.84, -7),
       (6.85, 0), (7.7, -2.5), (8.05, -3), (8.45, -12), (8.64, -9), (8.65, -3.5), (13.6, -2.5), (13.66, -2.5), (13.67, 0), (15, 0)]
tt = np.arange(len(mixd)) / SR
xs, ys = zip(*pts)
gdb = np.interp(tt, xs, ys)
mixd *= (10 ** (gdb / 20))[:, None]
i0, i1 = int(fr(483) * SR), int(fr(497) * SR)
mixd[i0 - 96:i0] *= np.linspace(1, 0, 96)[:, None]
mixd[i0:i1] = 0
fade = np.ones(len(mixd))
fade[-int(0.5 * SR):] = np.linspace(1, 0, int(0.5 * SR)) ** 2
mixd *= fade[:, None]
mixd = saturate(mixd / (np.abs(mixd).max() + 1e-9) * 1.2, 1.15) * 0.9
mixd.astype(np.float32).tofile("/tmp/lx/mix2.f32")
pre = ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "/tmp/lx/mix2.f32"]
meas = subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + pre[3:] + ["-af", "loudnorm=I=-14:TP=-1:LRA=14:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
import json, re
m = json.loads(re.search(r"\{[^}]+\}", meas, re.S).group(0))
af = (f"acompressor=threshold=-12dB:ratio=2:attack=10:release=150:makeup=1,"
      f"loudnorm=I=-14:TP=-1:LRA=14:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:linear=true")
subprocess.check_call(pre + ["-af", af, "-ar", "48000", "../film/assets/score2.wav"])
print("wrote score2.wav")
