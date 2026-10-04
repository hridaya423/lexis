"""Lexis ad score v6: cinematic pulse. The intro's pulse and tenor-drum pattern carry the whole film. Based on v5. Everything on the 16th grid; epic acoustic drums (VSCO marching snare,
tenor drums, giant drum, concert bass drum) under the synth pulse; the punchline is a mysterious D minor that climbs
Bb -> C, tape-stops with the CRT, and resolves to D when Lexis arrives.

Measured from the a16z films: synth-led, bright major key (D / Eb), pulsing 8th/16th ostinato, warm dark low end,
risers into a drop, big swings in level. Here: 100 BPM, beat 0 = frame 159, 16ths = 0.15 s, key of D.
"""
import json, os, re, subprocess
import numpy as np
import pedalboard as pb
import synth as S
from surge import make, render, SR
from sampler import perc

DUR = 15.0
N = int(SR * DUR)
fr = lambda f: f / 60.0
B = lambda b: fr(159) + 0.6 * b
X = 0.15
rng = np.random.default_rng(9)


def fit(y):
    y = y[:N]
    return np.pad(y, ((0, N - len(y)), (0, 0)))


def fx(y, *plugs):
    return pb.Pedalboard(list(plugs))(y.T.astype(np.float32), SR).T.astype(np.float64)


def sweep(y, pts, res=0.25, drive=1.0):
    """time-varying ladder low-pass: pts = [(t, hz)]"""
    lf = pb.LadderFilter(mode=pb.LadderFilter.Mode.LPF24, cutoff_hz=1000, resonance=res, drive=drive)
    out = np.zeros_like(y)
    blk = 512
    xs, ys = zip(*pts)
    for i in range(0, len(y), blk):
        t = i / SR
        lf.cutoff_hz = float(np.exp(np.interp(t, xs, np.log(ys))))
        out[i:i + blk] = lf.process(y[i:i + blk].T.astype(np.float32), SR, reset=False).T
    return out


CH = {
    "D": (38, [62, 66, 69, 74]), "A/C#": (37, [61, 64, 69, 73]), "Bm": (35, [59, 62, 66, 71]), "G": (31, [59, 62, 67, 71]),
    "A": (33, [61, 64, 69, 73]), "Asus": (33, [62, 64, 69, 74]), "D/F#": (30, [62, 66, 69, 74]), "Em7": (28, [59, 62, 67, 71]),
    "Dmaj9": (26, [62, 66, 69, 73, 76]), "Dm": (38, [62, 65, 69, 74]), "Bb": (34, [62, 65, 70, 74]), "C": (36, [64, 67, 72, 76]),
}
DROP = [(0, 2, "D"), (2, 1, "A/C#"), (3, 1, "Bm"), (4, 1, "G"), (5, 1, "A")]
LEX = [(10, 2, "D"), (12, 2, "Bm"), (14, 1.5, "G"), (15.5, 2.9, "Asus")]


def at(prog, b):
    for b0, nb, c in prog:
        if b0 <= b < b0 + nb:
            return c
    return prog[-1][2]


# ---------------- patches ----------------
pulse_p = make(a_osc_1_type="Classic", a_osc_1_unison_voices=5, a_osc_1_unison_detune=16, a_osc_2_mute=False, a_osc_2_type="Classic",
               a_osc_2_octave=-1, a_osc_2_volume=-9, a_osc_2_width_1=30,
               a_filter_1_type="LP 24 dB", a_filter_1_cutoff=700.0, a_filter_1_resonance=22.0, a_filter_1_feg_mod_amount=40,
               a_filter_eg_attack=0.0, a_filter_eg_decay=0.16, a_filter_eg_sustain=8.0, a_filter_eg_release=0.08,
               a_amp_eg_attack=0.0, a_amp_eg_decay=0.24, a_amp_eg_sustain=30.0, a_amp_eg_release=0.09)
pad_p = make(a_osc_1_type="Classic", a_osc_1_unison_voices=7, a_osc_1_unison_detune=24, a_osc_2_mute=False, a_osc_2_type="Classic",
             a_osc_2_octave=1, a_osc_2_unison_voices=5, a_osc_2_unison_detune=18, a_osc_2_volume=-8,
             a_filter_1_type="LP 12 dB", a_filter_1_cutoff=2600.0, a_filter_1_resonance=8.0,
             a_amp_eg_attack=0.35, a_amp_eg_decay=1.0, a_amp_eg_sustain=100.0, a_amp_eg_release=0.9)
bass_p = make(a_play_mode="Mono", a_osc_1_type="Classic", a_osc_2_mute=False, a_osc_2_type="Sine", a_osc_2_octave=-1, a_osc_2_volume=-2,
              a_filter_1_type="LP 24 dB", a_filter_1_cutoff=260.0, a_filter_1_resonance=15.0, a_filter_1_feg_mod_amount=26,
              a_filter_eg_decay=0.12, a_filter_eg_sustain=10.0, a_amp_eg_attack=0.0, a_amp_eg_decay=0.22, a_amp_eg_sustain=70.0, a_amp_eg_release=0.06)
lead_p = make(a_play_mode="Mono (Fingered Portamento)", a_portamento=0.05, a_osc_1_type="Classic", a_osc_1_shape=-60.0, a_osc_1_unison_voices=3,
              a_osc_1_unison_detune=9, a_osc_2_mute=False, a_osc_2_type="Classic", a_osc_2_octave=1, a_osc_2_volume=-14,
              a_filter_1_type="LP 24 dB", a_filter_1_cutoff=3600.0, a_filter_1_resonance=12.0, a_filter_1_feg_mod_amount=12, a_filter_eg_decay=0.3,
              a_filter_eg_sustain=60.0, a_amp_eg_attack=0.008, a_amp_eg_decay=0.4, a_amp_eg_sustain=85.0, a_amp_eg_release=0.25)
braam_p = make(a_osc_1_type="Classic", a_osc_1_unison_voices=9, a_osc_1_unison_detune=32, a_osc_2_mute=False, a_osc_2_type="Classic",
               a_osc_2_octave=-1, a_osc_2_unison_voices=5, a_osc_2_unison_detune=20, a_waveshaper_type="Soft", a_waveshaper_drive=10.0,
               a_filter_1_type="LP 24 dB", a_filter_1_cutoff=420.0, a_filter_1_resonance=30.0, a_filter_1_feg_mod_amount=46,
               a_filter_eg_attack=0.04, a_filter_eg_decay=0.9, a_filter_eg_sustain=20.0, a_filter_eg_release=0.6,
               a_amp_eg_attack=0.004, a_amp_eg_decay=1.2, a_amp_eg_sustain=60.0, a_amp_eg_release=0.9)
pluck_p = make(a_osc_1_type="String", a_filter_1_type="LP 12 dB", a_filter_1_cutoff=5200.0,
               a_amp_eg_attack=0.0, a_amp_eg_decay=0.7, a_amp_eg_sustain=0.0, a_amp_eg_release=0.5)
arp_p = make(a_osc_1_type="Classic", a_osc_1_shape=-80.0, a_filter_1_type="LP 24 dB", a_filter_1_cutoff=1800.0, a_filter_1_feg_mod_amount=30,
             a_filter_eg_decay=0.09, a_filter_eg_sustain=0.0, a_amp_eg_attack=0.0, a_amp_eg_decay=0.16, a_amp_eg_sustain=0.0, a_amp_eg_release=0.12)

sub_p = make(a_osc_1_type="Sine", a_osc_2_mute=False, a_osc_2_type="Classic", a_osc_2_volume=-18, a_filter_1_type="LP 24 dB", a_filter_1_cutoff=180.0,
             a_amp_eg_attack=0.01, a_amp_eg_decay=1.0, a_amp_eg_sustain=90.0, a_amp_eg_release=0.15)
line_p = make(a_osc_1_type="Classic", a_osc_1_unison_voices=7, a_osc_1_unison_detune=14, a_filter_1_type="LP 12 dB", a_filter_1_cutoff=2200.0,
              a_amp_eg_attack=0.25, a_amp_eg_decay=1.0, a_amp_eg_sustain=100.0, a_amp_eg_release=0.4)

grid = lambda b0, b1, step=0.25: [b0 + i * step for i in range(int(round((b1 - b0) / step)))]
LAND = fr(820)
BL = (LAND - B(0)) / 0.6
CHX = {"Bm": (35, [59, 62, 66, 69, 73]), "G": (31, [59, 62, 66, 67, 71]), "D": (38, [62, 64, 66, 69, 74]), "A": (33, [61, 64, 69, 71, 76]),
       "Dm": (38, [62, 65, 69, 74]), "Bb": (34, [62, 65, 70, 74]), "C": (36, [64, 67, 72, 76]), "Asus": (33, [62, 64, 69, 74, 76]),
       "Dmaj9": (26, [62, 66, 69, 73, 76])}
PR = {"Bm": 47, "G": 43, "D": 50, "A": 45, "Dm": 50, "Bb": 46, "C": 48, "Asus": 45}
DROPX = [(0, 2, "Bm"), (2, 2, "G"), (4, 1, "D"), (5, 1, "A")]
LEXX = [(10, 2, "D"), (12, 2, "Bm"), (14, 1.5, "G"), (15.5, BL - 15.5, "Asus")]

pulse_n, pad_n, bass_n, sub_n, braam_n, line_n, pluck_n = ([] for _ in range(7))


def motif(b0, b1, r, vel, up_from=None):
    """the intro figure: r r 5th 8ve, odd 16ths jump an octave once the music is climbing"""
    for k, b in enumerate(grid(b0, b1)):
        m = [r, r, r + 7, r + 12][k % 4]
        if up_from is not None and b >= up_from and k % 2:
            m += 12
        pulse_n.append((B(b), m, 0.12, vel(b) if callable(vel) else vel))


# intro (unchanged from v5)
motif(-3, 0, 50, lambda b: 0.55 + 0.4 * (b + 3) / 3, up_from=-1)
pad_n += [(fr(4), m, B(0) - fr(4) - 0.05, 0.55) for m in (50, 57, 62, 69)]
bass_n += [(B(b), 38, 0.1, 0.5 + 0.15 * (b + 1)) for b in grid(-1, 0)]

# drop: the intro figure keeps climbing over Bm - G - D - A
for b0, nb, c in DROPX:
    root, tones = CHX[c]
    motif(b0, b0 + nb, PR[c], 0.95, up_from=2)
    sub_n.append((B(b0), root + 12, 0.6 * nb - 0.02, 1.0))
    braam_n += [(B(b0), m, 0.9 if nb == 2 else 0.5, 0.95) for m in (root + 12, root + 19, root + 24)]
    pad_n += [(B(b0) - 0.02, m, 0.6 * nb, 0.7) for m in tones[:4]]
line_n += [(B(0), 78, 1.18, 0.75), (B(2), 79, 1.18, 0.8), (B(4), 81, 0.58, 0.85), (B(5), 83, 0.58, 0.9)]

# punch: D minor mystery, figure drops low and quiet
motif(6, 7, 38, 0.5)
pad_n += [(B(6), m, 0.58, 0.55) for m in (38, 45, 50, 53)] + [(B(6), m, 0.58, 0.3) for m in (77, 81, 86)]
sub_n.append((B(6), 38, 0.58, 0.9))
# slam: Bb then C, figure back at full size, tape stop with the CRT
for b0, c in ((7, "Bb"), (8, "C")):
    root, tones = CHX[c]
    motif(b0, b0 + 1, PR[c], 0.92, up_from=7.5)
    braam_n += [(B(b0), m, 0.56, 1.0) for m in (root, root + 7, root + 12, root + 16)]
    pad_n += [(B(b0), m, 0.58, 0.8) for m in tones]
    sub_n.append((B(b0), root + 12, 0.58, 1.0))
line_n += [(B(7), 77, 0.58, 0.8), (B(8), 79, 0.58, 0.85)]

# Lexis: a second build in the same language, D - Bm - G - Asus into the logo
for b0, nb, c in LEXX:
    root, tones = CHX[c]
    motif(b0, b0 + nb, PR[c], lambda b: 0.5 + 0.45 * (b - 10) / (BL - 10), up_from=15.5)
    pad_n += [(B(b0) - 0.02, m, 0.6 * nb + 0.1, 0.65) for m in tones[:4]]
    sub_n.append((B(b0), root + 12, 0.6 * nb - 0.02, 0.85))
    braam_n += [(B(b0), m, 0.6, 0.6) for m in (root + 12, root + 19)]
line_n += [(B(10), 78, 1.15, 0.6), (B(12), 78, 1.15, 0.65), (B(14), 79, 0.85, 0.7), (B(15.5), 81, B(BL) - B(15.5) - 0.03, 0.8)]
# logo
root, tones = CHX["Dmaj9"]
pad_n += [(LAND - 0.02, m, DUR - LAND - 0.3, 1.0) for m in tones + [50, 57]]
braam_n += [(LAND, m, DUR - LAND - 0.4, 0.95) for m in (38, 45, 50, 54)]
sub_n.append((LAND, 38, 1.3, 1.0))
line_n += [(LAND, 86, DUR - LAND - 0.4, 0.9), (LAND, 81, DUR - LAND - 0.4, 0.6)]
pluck_n += [(LAND + s * 0.05, m, 1.2, 0.8) for s, m in enumerate((74, 78, 81, 85, 86, 90))]

print("rendering synths...", flush=True)
pulse = fit(render(pulse_p, pulse_n, DUR))
pulse = sweep(pulse, [(0, 300), (B(-3), 300), (B(0) - 0.05, 6000), (B(0), 3000), (B(6) - 0.01, 8000), (B(6), 700), (B(7) - 0.01, 700),
                      (B(7), 3500), (B(8.5), 8000), (B(9), 8000), (B(10), 500), (B(BL) - 0.05, 7000), (LAND, 8000), (DUR, 8000)], res=0.3)
pulse = fx(pulse, pb.Reverb(room_size=0.6, wet_level=0.14, dry_level=0.9))
pad = fx(fit(render(pad_p, pad_n, DUR)), pb.Chorus(rate_hz=0.3, depth=0.3, mix=0.35), pb.Reverb(room_size=0.92, wet_level=0.35, dry_level=0.75))
bass = fit(render(bass_p, bass_n, DUR))
sub = fit(render(sub_p, sub_n, DUR))
braam = fx(fit(render(braam_p, braam_n, DUR)), pb.Reverb(room_size=0.9, wet_level=0.3, dry_level=0.9))
line = fx(fit(render(line_p, line_n, DUR)), pb.Reverb(room_size=0.95, wet_level=0.4, dry_level=0.8))
pluck = fx(fit(render(pluck_p, pluck_n, DUR)), pb.Delay(delay_seconds=0.3, feedback=0.25, mix=0.15), pb.Reverb(room_size=0.8, wet_level=0.28, dry_level=0.85))
print("synths done", flush=True)

# ---------------- drums: the intro's tenor pattern carries everything ----------------
D_ = "VSCO 1 Percussion/drums/"
norm = lambda x: x / (np.abs(x).max() + 1e-9)
GIANT = [norm(x) for x in perc(D_ + "other/ethnic/giant/mallet/*.wav")]
TEN = [norm(x) for x in perc(D_ + "tenor/tenor_lower/tenor_ff*.wav") + perc(D_ + "tenor/tenor_lower/tenor_fff*.wav")]
TENH = [norm(x) for x in perc(D_ + "tenor/tenor_higher/tenorH_ff*.wav")]
SN = [norm(x) for x in perc(D_ + "snare/drum3_marching/snare3_f*.wav")]
SNF = [norm(x) for x in (perc(D_ + "snare/drum3_marching/snare3_fff*.wav") or SN)]
CBD = [norm(x) for x in perc(D_ + "bass/bdrum*_fff*.wav") + perc(D_ + "bass/bdrum_ff*.wav")]
CR = perc("Percussion/cymbal-crash1_ff_rr*.wav")
GONG = perc("Percussion/gongHit_fff.wav")[0]
SCR = perc("Percussion/susCymb1-cresc-Long_v1.wav")[0]
ac, imp, sfx = (S.Bus(N + SR * 4) for _ in range(3))
rr = {"n": 0}


def hit(kit, b, g, pan=0.0, bus=None):
    rr["n"] += 1
    (bus or ac).add(kit[rr["n"] % len(kit)], B(b), g, pan)


def tenors(b0, b1, g, step=0.25):
    """the intro's tenor figure: accented downbeat, lighter in-betweens, low/high alternating"""
    for k, b in enumerate(grid(b0, b1, step)):
        acc = [1.0, 0.55, 0.75, 0.55][k % 4] if step == 0.25 else [1.0, 0.7][k % 2]
        hit(TEN if k % 2 == 0 else TENH, b, g * acc, pan=0.25 * (1 if k % 2 else -1))


def roll(b0, b1, g0, g1):
    ks = grid(b0, b1, 0.125)
    for j, b in enumerate(ks):
        hit(SN, b, g0 + (g1 - g0) * j / max(1, len(ks) - 1), pan=0.1)


# intro (unchanged)
tenors(-3, -1, 0.42, step=0.5)
tenors(-1, -0.5, 0.6)
roll(-0.5, 0, 0.35, 1.05)
for b in (-3, -2, -1):
    hit(GIANT, b, 0.55 + 0.15 * (b + 3))
imp.add(GIANT[0], fr(30), 0.8)
for f in (60, 100, 142):
    imp.add(CBD[f % len(CBD)], fr(f), 0.5)
# drop: tenor figure runs on, giant every beat, half-time snare on 3, roll into the cut
tenors(0, 5.5, 0.5)
for b in range(6):
    hit(GIANT, b, 1.0 if b % 2 == 0 else 0.6)
    if b % 2 == 0:
        hit(CBD, b, 0.65)
    else:
        hit(SNF, b, 0.95); ac.add(S.clap(0.4), B(b), 0.45)
roll(5.5, 6, 0.4, 1.0)
for b in (0, 4):
    imp.add(CR[b // 4 % len(CR)], B(b), 0.6)
# punch: heartbeat + clock
for b, g in ((6, 0.7), (6.25, 0.4), (6.5, 0.6), (6.75, 0.35)):
    hit(GIANT, b, g * 0.8)
for b in grid(6, 7):
    ac.add(S.hat(0.015), B(b), 0.08, 0.4)
# slam bar
hit(GIANT, 7, 1.0); hit(CBD, 7, 0.9); hit(GIANT, 8, 1.0); hit(CBD, 8, 0.8)
tenors(7, 8.5, 0.55)
hit(SNF, 7.5, 0.7); hit(SNF, 8.0, 0.8)
roll(8.25, 9, 0.4, 1.0)
# Lexis: second build - tenors 8ths, then 16ths, giant every two beats, then every beat, roll into the logo
tenors(10, 14, 0.32, step=0.5)
tenors(14, 17.5, 0.42)
for b in range(10, 18):
    if b < 14 and b % 2 == 0 or b >= 14:
        hit(GIANT, b, 0.6 + 0.04 * (b - 10))
    if b % 2 == 1:
        hit(SNF, b, 0.5 + 0.05 * (b - 10))
nroll = int(round((LAND - B(17.5)) / 0.075))
for k in range(nroll):
    ac.add(SN[k % len(SN)], B(17.5) + k * 0.075, 0.35 + 0.65 * k / nroll)
# hits
for h, g in ((B(0), 1.0), (B(7), 1.0), (LAND, 1.0), (B(10), 0.5)):
    imp.add(S.taiko(1.4), h, 0.8 * g); imp.add(CBD[0], h, 0.8 * g); imp.add(CR[0], h, 0.6 * g); imp.add(S.subdrop(1.8, 110, 34), h, 0.8 * g)
imp.add(GONG, LAND, 0.4)
imp.add(GONG, B(0), 0.2)

# ---------------- sound design (picture sync) ----------------
sfx.add(SCR[-int(2.2 * SR):], B(0) - 2.2, 0.55)
sfx.add(SCR[-int(1.6 * SR):], LAND - 1.6, 0.5)
sfx.add(S.noise_riser(B(0) - fr(80), 0.8, 3.0), fr(80), 0.45)
sfx.add(S.noise_riser(B(6) - B(4), 0.6, 2.6), B(4), 0.3)
sfx.add(S.noise_riser(B(9) - B(7.5), 0.6, 2.4), B(7.5), 0.35)
sfx.add(S.noise_riser(LAND - B(15), 0.7, 2.8), B(15), 0.4)
sfx.add(S.crt_on(0.45), 0.0, 0.6)
roar = S.load("sfx/saturn_roar.wav")
sfx.add(roar[:int(2.2 * SR)] * np.linspace(1, 0, int(2.2 * SR))[:, None] ** 1.4, B(0), 0.35)
relay = S.load("sfx/relay.mp3")
for f in (0, 17, 178, 189, 193, 221, 240, 247, 254, 260, 266, 272, 277, 282, 287, 292, 297, 301, 309, 314,
          334, 338, 342, 345, 348, 351, 354, 356, 358, 360, 362, 364, 366):
    sfx.add(relay, fr(f), 0.14, pan=0.4 * ((f // 5) % 3 - 1))
for f in range(30, 47, 2):
    sfx.add(S.blip(S.midi(86 + (f - 30) // 2), 0.02, 0.8, 120), fr(f), 0.08)
for f in range(233, 300, 3):
    sfx.add(S.blip(3200, 0.012, 0.9), fr(f), 0.035, pan=0.6)
tw = S.slices("sfx/typewriter.mp3", 12, 0.18)
for n in range(5):
    sfx.add(tw[n % len(tw)], B(6 + (n + 1) / 8), 0.8)
tele = S.load("sfx/teletype.mp3")
seg_ = tele[int(2 * SR):int(2 * SR) + int((fr(466) - fr(413)) * SR)]
sfx.add(seg_ * np.linspace(0.3, 0.7, len(seg_))[:, None], fr(413), 0.6)
sfx.add(S.crt_off(0.4), fr(465), 0.9)
sfx.add(S.blip(S.midi(86), 0.06, 0.1), fr(497), 0.25)
sfx.add(SCR[-int(0.45 * SR):] * 0.7, B(10) - 0.45, 0.5)
ASKS = [dict(a=520, q="unpack this archive", type=1.3, press=551, morph=556), dict(a=598, q="what's on port 3000", type=0.9, press=622, morph=627),
        dict(a=650, q="undo my last commit", type=1.0, press=675, morph=681)]
keys = S.slices("sfx/kb_slow.mp3", 30, 0.12)
enter = S.load("sfx/enter.mp3")
for n, ask in enumerate(ASKS):
    for i, c in enumerate(ask["q"]):
        tt = round(ask["a"] + 2 + i * ask["type"] + (S.jhash(i, n) - 0.5) * ask["type"] * 0.7)
        sfx.add(keys[(i * 7 + n * 3) % len(keys)], fr(tt), 0.4 if c != " " else 0.55, pan=0.1)
    sfx.add(enter / (np.abs(enter).max() + 1e-9), fr(ask["press"]), 0.75)
    for s, m in enumerate([74, 78, 81, 86]):
        sfx.add(S.bell(S.midi(m + 12), 0.6), fr(ask["morph"]) + s * 0.04, 0.1, pan=-0.4 + 0.25 * s)
for k in range(60):
    sfx.add(S.blip(2400 + 1800 * rng.random(), 0.01, 0.9), fr(699) + (k / 60) ** 0.8 * 0.7 + rng.uniform(0, 0.02), 0.04, pan=rng.uniform(-0.8, 0.8))
for k in range(17):
    sfx.add(keys[(k * 5) % len(keys)], fr(776 + k * 0.9) if k < 10 else fr(786 + (k - 10) * 0.85), 0.25)
for k in range(26):
    tt = fr(801) + (k / 26) * (fr(820) - fr(801))
    sfx.add(keys[k % len(keys)], tt, 0.12, pan=-0.6 + 1.2 * k / 26)

# ---------------- mix ----------------
a = fx(ac.x[:N], pb.Compressor(threshold_db=-12, ratio=2.5, attack_ms=8, release_ms=120), pb.Reverb(room_size=0.85, damping=0.4, wet_level=0.3, dry_level=0.85))
i_ = fx(imp.x[:N], pb.Reverb(room_size=0.9, wet_level=0.25, dry_level=0.9))
sx = fx(sfx.x[:N], pb.Reverb(room_size=0.5, wet_level=0.12))
music = pulse * 1.8 + pad * 0.3 + bass * 1.0 + sub * 0.9 + braam * 0.55 + line * 0.45 + pluck * 0.6 + a * 0.75 + i_ * 0.4
t0, t1 = B(8.5), fr(481)
j0, j1 = int(t0 * SR), int(t1 * SR)
u = np.arange(j1 - j0) / (j1 - j0)
pos = j0 + np.cumsum((1 - u) ** 1.6)
music[j0:j1] = np.stack([np.interp(pos, np.arange(len(music)), music[:, c]) for c in range(2)], 1) * (1 - u[:, None] ** 3)
music[j1:int(fr(497) * SR)] = 0
mixd = music + sx * 0.8
mixd = S.hp(mixd, 25, 6)
pts = [(0, -12), (0.5, -8), (0.85, -9), (2.55, -2), (2.65, 0), (6.24, 0), (6.25, -6), (6.84, -5), (6.85, 0), (8.05, -1),
       (8.45, -9), (8.64, -5), (8.65, -3.5), (13.6, -0.5), (13.67, 0), (15, 0)]
tt = np.arange(N) / SR
xs, ys = zip(*pts)
mixd *= (10 ** (np.interp(tt, xs, ys) / 20))[:, None]
k0, k1 = int(fr(483) * SR), int(fr(497) * SR)
mixd[k0 - 96:k0] *= np.linspace(1, 0, 96)[:, None]
mixd[k0:k1] = 0
fade = np.ones(N); fade[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR)) ** 2
mixd *= fade[:, None]
mixd = fx(mixd / (np.abs(mixd).max() + 1e-9) * 0.7, pb.Compressor(threshold_db=-12, ratio=2.2, attack_ms=12, release_ms=160), pb.Limiter(threshold_db=-2.0, release_ms=80))
mixd.astype(np.float32).tofile("/tmp/lx/mix6.f32")
pre = ["-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "/tmp/lx/mix6.f32"]
r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + pre + ["-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])
subprocess.check_call(["ffmpeg", "-v", "error", "-y"] + pre + ["-af", f"volume={-14 - I:.2f}dB,alimiter=limit=0.89:attack=1:release=60:level=false",
                                                               "-ar", "48000", "../film/assets/score6.wav"])
print("wrote score6.wav")
for nm, bus in (("pulse", pulse * 1.8), ("pad", pad * 0.3), ("sub", sub * 0.9), ("braam", braam * 0.55), ("line", line * 0.45),
                ("drums", a * 0.75), ("impacts", i_ * 0.4), ("sfx", sx * 0.8)):
    row = [round(float(10 * np.log10(np.mean(bus[int(a0 * SR):int(b0 * SR)] ** 2) + 1e-12)), 1) for a0, b0 in ((0.9, 2.6), (2.7, 6.2), (6.3, 8.0), (8.7, 13.6), (13.7, 14.8))]
    print(nm.ljust(8), "build/drop/punch/lexis/logo", row)
