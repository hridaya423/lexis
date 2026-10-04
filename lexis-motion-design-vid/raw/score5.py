"""Lexis ad score v5: tighter, more epic v4. Everything on the 16th grid; epic acoustic drums (VSCO marching snare,
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

# ---------------- notes (everything on the 16th grid) ----------------
pulse_n, pad_n, bass_n, lead_n, braam_n, pluck_n, arp_n = ([] for _ in range(7))
grid = lambda b0, b1, step=0.25: [b0 + i * step for i in range(int(round((b1 - b0) / step)))]

# build: D pedal ostinato, filter opens via sweep
for k, b in enumerate(grid(-3, 0)):
    pulse_n.append((B(b), [50, 50, 57, 62][k % 4] + (12 if b >= -1 and k % 2 else 0), 0.12, 0.55 + 0.4 * (b + 3) / 3))
pad_n += [(fr(4), m, B(0) - fr(4) - 0.05, 0.55) for m in (50, 57, 62, 69)]
bass_n += [(B(b), 38, 0.1, 0.5 + 0.15 * (b + 1)) for b in grid(-1, 0)]

# drop: D - A/C# - Bm - G - A
for b0, nb, c in DROP:
    root, tones = CH[c]
    r = tones[0] - 12
    for k, b in enumerate(grid(b0, b0 + nb)):
        up = 12 if b >= 5 else 0
        pulse_n.append((B(b), [r, r, r + 7, r + 12, r, r + 7, r + 12, r + 14][(k + int(b0) * 4) % 8] + up, 0.12, 0.95))
        bass_n.append((B(b), root + 12 if k % 2 == 0 else root + 24, 0.12, 0.95 if k % 2 == 0 else 0.7))
        arp_n.append((B(b + 0.125), [tones[0] + 12, tones[1] + 12, tones[2] + 12, tones[3] + 12][k % 4], 0.06, 0.45))
    pad_n += [(B(b0) - 0.02, m, 0.6 * nb, 0.85) for m in tones]
HOOK = [(0, 0.5, 69), (0.5, 0.5, 74), (1, 1, 78), (2, 0.5, 76), (2.5, 0.5, 73), (3, 0.75, 74), (3.75, 0.25, 78), (4, 1, 79), (5, 0.5, 81), (5.5, 0.5, 78)]
lead_n += [(B(b), m, 0.6 * l - 0.02, 0.9) for b, l, m in HOOK]

# punch (b6-7): D minor, mysterious - low pulse ticking, low drone, eerie high voicing
for k, b in enumerate(grid(6, 7)):
    pulse_n.append((B(b), [38, 38, 41, 45][k % 4], 0.1, 0.5))
pad_n += [(B(6), m, 0.58, 0.55) for m in (38, 45, 50, 53)] + [(B(6), m, 0.58, 0.3) for m in (77, 81, 86)]
bass_n += [(B(6), 38, 0.5, 0.9)]
# slam (b7) Bb, (b8) C: epic rise, then tape stop with the CRT
for b0, c in ((7, "Bb"), (8, "C")):
    root, tones = CH[c]
    braam_n += [(B(b0), m, 0.56, 1.0) for m in (root, root + 7, root + 12, root + 16)]
    pad_n += [(B(b0), m, 0.58, 0.8) for m in tones]
    r = tones[0] - 12
    for k, b in enumerate(grid(b0, b0 + 1)):
        pulse_n.append((B(b), [r, r, r + 7, r + 12, r, r + 7, r + 12, r + 16][k % 8] + (12 if b >= 8.5 else 0), 0.12, 0.9))
        bass_n.append((B(b), root + 12 if k % 2 == 0 else root + 24, 0.12, 0.9))
lead_n += [(B(7), 74, 0.55, 0.8), (B(8), 76, 0.3, 0.85), (B(8.5), 79, 0.4, 0.9)]

# Lexis (b10 -> logo): D - Bm - G - Asus, groove back, pulse from the arrival
LAND = fr(820)
for b0, nb, c in LEX:
    root, tones = CH[c]
    end = min(b0 + nb, (LAND - B(0)) / 0.6)
    pad_n += [(B(b0) - 0.02, m, B(end) - B(b0) + 0.1, 0.7) for m in tones]
    r = tones[0] - 12
    for k, b in enumerate(grid(b0, end)):
        pulse_n.append((B(b), [r, r, r + 7, r + 12][k % 4], 0.12, 0.45 + 0.4 * (b - 10) / 8.3))
        if k % 2 == 0:
            bass_n.append((B(b), root + 12 if k % 4 == 0 else root + 24, 0.25, 0.75))
        pluck_n.append((B(b), [tones[0], tones[1], tones[2], tones[3], tones[2] + 12, tones[1] + 12, tones[3], tones[2]][k % 8], 0.3, 0.55))
REPRISE = [(10, 2, 78), (12, 2, 74), (14, 1.5, 79), (15.5, 1, 76), (16.5, 1, 78), (17.5, 0.75, 81)]
lead_n += [(B(b), m, 0.6 * l - 0.04, 0.55) for b, l, m in REPRISE]
# logo
root, tones = CH["Dmaj9"]
pad_n += [(LAND - 0.02, m, DUR - LAND - 0.3, 1.0) for m in tones + [50, 57]]
braam_n += [(LAND, m, DUR - LAND - 0.4, 0.9) for m in (38, 45, 50, 54)]
lead_n += [(LAND, 86, 1.0, 0.8)]
bass_n += [(LAND, 38, 1.2, 1.0)]
pluck_n += [(LAND + s * 0.05, m, 1.2, 0.8) for s, m in enumerate((74, 78, 81, 85, 86, 90))]

# ---------------- render synths ----------------
print("rendering synths...", flush=True)
pulse = fit(render(pulse_p, pulse_n, DUR))
pulse = sweep(pulse, [(0, 300), (B(-3), 300), (B(0) - 0.05, 7000), (B(0), 9000), (B(6) - 0.01, 9000), (B(6), 900), (B(7) - 0.01, 900),
                      (B(7), 3000), (B(8.5), 9000), (B(9), 9000), (B(10), 1200), (B(17.5), 5000), (LAND, 9000), (DUR, 9000)], res=0.3)
pad = fit(render(pad_p, pad_n, DUR))
bass = fit(render(bass_p, bass_n, DUR))
lead = fit(render(lead_p, lead_n, DUR))
braam = fit(render(braam_p, braam_n, DUR))
pluck = fit(render(pluck_p, pluck_n, DUR))
arp = fit(render(arp_p, arp_n, DUR))
print("synths done", flush=True)
pulse = fx(pulse, pb.Chorus(rate_hz=0.6, depth=0.15, mix=0.2), pb.Delay(delay_seconds=0.45, feedback=0.2, mix=0.1), pb.Reverb(room_size=0.6, wet_level=0.16, dry_level=0.9))
pad = fx(pad, pb.Chorus(rate_hz=0.3, depth=0.3, mix=0.35), pb.Reverb(room_size=0.92, damping=0.5, wet_level=0.35, dry_level=0.75))
lead = fx(lead, pb.Delay(delay_seconds=0.3, feedback=0.25, mix=0.14), pb.Reverb(room_size=0.85, wet_level=0.28, dry_level=0.85))
braam = fx(braam, pb.Reverb(room_size=0.9, wet_level=0.3, dry_level=0.9))
pluck = fx(pluck, pb.Delay(delay_seconds=0.3, feedback=0.25, mix=0.15), pb.Reverb(room_size=0.8, wet_level=0.28, dry_level=0.85))
arp = fx(arp, pb.Reverb(room_size=0.7, wet_level=0.22))
bass = fx(bass, pb.Compressor(threshold_db=-14, ratio=3, attack_ms=5, release_ms=80))

# ---------------- epic drums ----------------
D_ = "VSCO 1 Percussion/drums/"
GIANT = perc(D_ + "other/ethnic/giant/mallet/*.wav") or perc(D_ + "bass/bdrum*_fff*.wav")
TEN = perc(D_ + "tenor/tenor_lower/tenor_ff*.wav") + perc(D_ + "tenor/tenor_lower/tenor_fff*.wav")
TENH = perc(D_ + "tenor/tenor_higher/tenorH_ff*.wav")
SN = perc(D_ + "snare/drum3_marching/snare3_f*.wav")
SNF = perc(D_ + "snare/drum3_marching/snare3_fff*.wav") or SN
CBD = perc(D_ + "bass/bdrum*_fff*.wav") + perc(D_ + "bass/bdrum_ff*.wav")
CR = perc("Percussion/cymbal-crash1_ff_rr*.wav")
GONG = perc("Percussion/gongHit_fff.wav")[0]
SCR = perc("Percussion/susCymb1-cresc-Long_v1.wav")[0]
norm = lambda x: x / (np.abs(x).max() + 1e-9)
GIANT, TEN, TENH, SN, SNF, CBD = ([norm(x) for x in L] for L in (GIANT, TEN, TENH, SN, SNF, CBD))
print("drums:", len(GIANT), len(TEN), len(TENH), len(SN), len(CBD), flush=True)
drums, acou, impacts, sfx = (S.Bus(N + SR * 4) for _ in range(4))
rr = {"n": 0}


def hit(kit, b, g, pan=0.0, bus=None):
    rr["n"] += 1
    (bus or acou).add(kit[rr["n"] % len(kit)], B(b), g, pan)


kicks = [B(b) for b in range(0, 6)] + [B(b) for b in range(10, 18)]
for t in kicks:
    drums.add(S.kick(0.45, 1.1, 48), t, 0.9)
for b in list(range(0, 6)) + list(range(10, 18)):
    drums.add(S.hat(0.03), B(b + 0.5), 0.26 if b < 6 else 0.18, pan=0.25)
    for q in (0.25, 0.75):
        drums.add(S.hat(0.02), B(b + q), 0.12 if b < 6 else 0.08, pan=-0.3)
# build: tenors 8ths -> 16ths, giant on downbeats, marching snare 32nds into the drop
for b in grid(-3, -1, 0.5):
    hit(TEN, b, 0.35 + 0.15 * (b + 3), pan=-0.2)
for b in grid(-1, -0.5):
    hit(TEN if int(b * 4) % 2 == 0 else TENH, b, 0.6, pan=0.2)
for k, b in enumerate(grid(-0.5, 0, 0.125)):
    hit(SN, b, 0.35 + 0.1 * k, pan=0.1)
for b in (-3, -2, -1):
    hit(GIANT, b, 0.55 + 0.15 * (b + 3))
impacts.add(GIANT[0], fr(30), 0.8)
for f in (60, 100, 142):
    impacts.add(CBD[f % len(CBD)], fr(f), 0.5)
# drop: giant on 0/2/4 and the "a" of 1/3, tenor syncopation, marching snare backbeat, crash 0 and 4, roll into the cut
for b in range(6):
    if b % 2 == 0:
        hit(GIANT, b, 0.9)
    else:
        hit(GIANT, b + 0.75, 0.55)
        hit(SNF, b, 0.75, pan=0.05)
        drums.add(S.clap(0.3), B(b), 0.4)
    for q in ((0.5, 0.75) if b % 2 else (0.25, 0.75)):
        hit(TENH if q == 0.75 else TEN, b + q, 0.45, pan=0.3 * (1 if q == 0.75 else -1))
for k, b in enumerate(grid(5.5, 6, 0.125)):
    hit(SN, b, 0.3 + 0.12 * k, pan=-0.1)
for b in (0, 4):
    impacts.add(CR[b // 4 % len(CR)], B(b), 0.6)
# punch: heartbeat + clock
for b, g in ((6, 0.7), (6.25, 0.4), (6.5, 0.6), (6.75, 0.35)):
    hit(GIANT, b, g * 0.8)
for b in grid(6, 7):
    drums.add(S.hat(0.015), B(b), 0.1, pan=0.4)
# slam bar: Bb then C, tenors and snare crescendo into the tape stop
hit(GIANT, 7, 1.0); hit(CBD, 7, 0.9); hit(GIANT, 7.75, 0.6); hit(TEN, 7.5, 0.5); hit(TENH, 7.625, 0.4)
hit(GIANT, 8, 1.0); hit(CBD, 8, 0.8)
for k, b in enumerate(grid(8, 8.5)):
    hit(TEN if k % 2 == 0 else TENH, b, 0.5 + 0.1 * k)
for k, b in enumerate(grid(8.25, 9, 0.125)):
    hit(SN, b, 0.35 + 0.06 * k)
# Lexis: backbeat, giant on arrival, tenor fill and roll into the logo
hit(GIANT, 10, 0.75); hit(GIANT, 14, 0.6)
for b in (11, 13, 15, 17):
    hit(SN, b, 0.45); drums.add(S.clap(0.25), B(b), 0.25)
for k, b in enumerate(grid(16.5, 17.5)):
    hit(TEN if k % 2 == 0 else TENH, b, 0.35 + 0.05 * k, pan=-0.3 + 0.15 * (k % 4))
nroll = int(round((LAND - B(17.5)) / (0.6 / 8)))
for k in range(nroll):
    acou.add(SN[k % len(SN)], B(17.5) + k * 0.075, 0.3 + 0.5 * k / nroll)
# hits
for h in (B(0), B(7), LAND):
    impacts.add(S.taiko(1.4), h, 0.8)
    impacts.add(CBD[0], h, 0.8)
    impacts.add(CR[0], h, 0.6)
    impacts.add(S.subdrop(1.8, 110, 34), h, 0.8)
impacts.add(GONG, LAND, 0.35)

# ---------------- sound design (picture sync) ----------------
sfx.add(SCR[-int(2.2 * SR):], B(0) - 2.2, 0.55)
sfx.add(SCR[-int(1.4 * SR):], LAND - 1.4, 0.45)
sfx.add(S.noise_riser(B(0) - fr(80), 0.8, 3.0), fr(80), 0.45)
sfx.add(S.noise_riser(B(9) - B(7.5), 0.6, 2.4), B(7.5), 0.35)
sfx.add(S.noise_riser(LAND - fr(788), 0.7, 2.6), fr(788), 0.4)
sfx.add(S.crt_on(0.45), 0.0, 0.6)
roar = S.load("sfx/saturn_roar.wav")
sfx.add(roar[:int(2.2 * SR)] * np.linspace(1, 0, int(2.2 * SR))[:, None] ** 1.4, B(0), 0.35)
relay = S.load("sfx/relay.mp3")
for f in (0, 17, 178, 189, 193, 221, 240, 247, 254, 260, 266, 272, 277, 282, 287, 292, 297, 301, 309, 314,
          334, 338, 342, 345, 348, 351, 354, 356, 358, 360, 362, 364, 366):
    sfx.add(relay, fr(f), 0.16, pan=0.4 * ((f // 5) % 3 - 1))
for f in range(30, 47, 2):
    sfx.add(S.blip(S.midi(86 + (f - 30) // 2), 0.02, 0.8, 120), fr(f), 0.08)
for f in range(233, 300, 3):
    sfx.add(S.blip(3200, 0.012, 0.9), fr(f), 0.04, pan=0.6)
tw = S.slices("sfx/typewriter.mp3", 12, 0.18)
for n in range(5):
    sfx.add(tw[n % len(tw)], B(6 + (n + 1) / 8), 0.8)
tele = S.load("sfx/teletype.mp3")
seg_ = tele[int(2 * SR):int(2 * SR) + int((fr(466) - fr(413)) * SR)]
sfx.add(seg_ * np.linspace(0.3, 0.8, len(seg_))[:, None], fr(413), 0.8)
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
side = kicks + [B(0), B(7), B(8), LAND]
pad = S.sidechain(pad, side, 0.55)
bass = S.sidechain(bass, side, 0.65, 0.18)
pulse = S.sidechain(pulse, side, 0.3)
dr = fx(drums.x[:N], pb.Compressor(threshold_db=-10, ratio=3, attack_ms=3, release_ms=60), pb.Reverb(room_size=0.4, wet_level=0.08))
ac = fx(acou.x[:N], pb.Compressor(threshold_db=-12, ratio=2.5, attack_ms=8, release_ms=120), pb.Reverb(room_size=0.85, damping=0.4, wet_level=0.3, dry_level=0.85))
imp = fx(impacts.x[:N], pb.Reverb(room_size=0.9, wet_level=0.25, dry_level=0.9))
sx = fx(sfx.x[:N], pb.Reverb(room_size=0.5, wet_level=0.12))
music = pulse * 2.0 + pad * 0.33 + S.lp(bass, 220) * 1.0 + lead * 0.7 + braam * 0.55 + pluck * 0.8 + dr * 0.8 + ac * 0.75 + imp * 0.4
# tape stop: the music winds down as the CRT collapses (b8.5 -> frame 481)
t0, t1 = B(8.5), fr(481)
i0, i1 = int(t0 * SR), int(t1 * SR)
u = np.arange(i1 - i0) / (i1 - i0)
pos = i0 + np.cumsum((1 - u) ** 1.6)
seg_ = np.stack([np.interp(pos, np.arange(len(music)), music[:, c]) for c in range(2)], 1)
music[i0:i1] = seg_ * (1 - u[:, None] ** 3)
music[i1:int(fr(497) * SR)] = 0
mixd = music + sx * 0.8
mixd = S.hp(mixd, 25, 6)
pts = [(0, -12), (0.5, -8), (0.85, -9), (2.55, -2), (2.65, 0), (6.24, 0), (6.25, -6), (6.84, -5), (6.85, 0), (7.7, 0), (8.05, -1),
       (8.45, -9), (8.64, -5), (8.65, -2), (13.6, -1.0), (13.67, 0), (15, 0)]
tt = np.arange(N) / SR
xs, ys = zip(*pts)
mixd *= (10 ** (np.interp(tt, xs, ys) / 20))[:, None]
j0, j1 = int(fr(483) * SR), int(fr(497) * SR)
mixd[j0 - 96:j0] *= np.linspace(1, 0, 96)[:, None]
mixd[j0:j1] = 0
fade = np.ones(N); fade[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR)) ** 2
mixd *= fade[:, None]
mixd = fx(mixd / (np.abs(mixd).max() + 1e-9) * 0.7, pb.Compressor(threshold_db=-12, ratio=2.2, attack_ms=12, release_ms=160),
          pb.Limiter(threshold_db=-2.0, release_ms=80))
mixd.astype(np.float32).tofile("/tmp/lx/mix5.f32")
pre = ["-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "/tmp/lx/mix5.f32"]
r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + pre + ["-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])
subprocess.check_call(["ffmpeg", "-v", "error", "-y"] + pre + ["-af", f"volume={-14 - I:.2f}dB,alimiter=limit=0.89:attack=1:release=60:level=false",
                                                               "-ar", "48000", "../film/assets/score5.wav"])
print("wrote score5.wav")
for nm, bus in (("pulse", pulse * 2.0), ("pad", pad * 0.33), ("bass", bass), ("lead", lead * 0.7), ("braam", braam * 0.55), ("pluck", pluck * 0.8),
                ("synthdr", dr * 0.8), ("acoustic", ac * 0.75), ("impacts", imp * 0.4), ("sfx", sx * 0.8)):
    row = []
    for a0, b0 in ((0.9, 2.6), (2.7, 6.2), (6.3, 8.0), (8.7, 13.6), (13.7, 14.8)):
        seg = bus[int(a0 * SR):int(b0 * SR)]
        row.append(round(float(10 * np.log10(np.mean(seg ** 2) + 1e-12)), 1))
    print(nm.ljust(9), "build/drop/punch/lexis/logo", row)
