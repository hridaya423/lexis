"""Lexis ad score v4: a16z-style cinematic electronic (Surge XT synths + impacts), locked to the picture.

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
    "Dmaj9": (26, [62, 66, 69, 73, 76]),
}
DROP = [(0, 2, "D"), (2, 1, "A/C#"), (3, 1, "Bm"), (4, 1, "G"), (5, 1, "A")]
LEX = [(10, 2, "G"), (12, 2, "D/F#"), (14, 1.5, "Em7"), (15.5, 2.95, "Asus")]


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

# ---------------- notes ----------------
pulse_n, pad_n, bass_n, lead_n, braam_n, pluck_n, arp_n = ([] for _ in range(7))
kicks = []

# build: ostinato from beat -3, filter opens via sweep
for i in range(int(round((B(0) - B(-3)) / X))):
    t = B(-3) + i * X
    pulse_n.append((t, [50, 50, 57, 62][i % 4] + (12 if t >= B(-1) and i % 2 else 0), 0.12, 0.55 + 0.4 * (t - B(-3)) / 1.8))
pad_n += [(fr(4), m, B(0) - fr(4) - 0.05, 0.6) for m in (50, 57, 62, 69)]
bass_n += [(B(-1) + 0.15 * k, 38, 0.1, 0.5 + 0.06 * k) for k in range(4)]

# drop
for b0, nb, c in DROP:
    root, tones = CH[c]
    for i in range(int(nb * 4)):
        t = B(b0) + i * X
        r = tones[0] - 12
        pulse_n.append((t, [r, r, r + 7, r + 12, r, r + 7, r + 12, r + 14][(i + int(b0) * 4) % 8], 0.12, 0.95))
    pad_n += [(B(b0) - 0.02, m, 0.6 * nb, 0.85) for m in tones]
    for e in range(int(nb * 4)):
        bass_n.append((B(b0) + e * X, root + 12 if e % 2 == 0 else root + 24, 0.12, 0.95 if e % 2 == 0 else 0.7))
    arp = [tones[0] + 12, tones[1] + 12, tones[2] + 12, tones[3] + 12]
    for i in range(int(nb * 4)):
        arp_n.append((B(b0) + i * X + X / 2, arp[i % 4], 0.07, 0.5))
HOOK = [(0, 0.5, 69), (0.5, 0.5, 74), (1, 1, 78), (2, 0.5, 76), (2.5, 0.5, 73), (3, 0.75, 74), (3.75, 0.25, 78), (4, 1, 79), (5, 0.5, 81), (5.5, 0.5, 76)]
lead_n += [(B(b), m, 0.6 * l - 0.02, 0.9) for b, l, m in HOOK]
kicks += [B(b) for b in range(6)]
# flipbook push: pulse up an octave on the A chord
pulse_n = [(t, m + (12 if fr(334) <= t < fr(375) else 0), l, v) for t, m, l, v in pulse_n]
# slam braam, wall climb
braam_n += [(fr(411), m, 0.9, 1.0) for m in (38, 45, 50, 51, 57)]
for i in range(int((fr(465) - fr(415)) / (X / 2))):
    t = fr(415) + i * X / 2
    pulse_n.append((t, 50 + i // 2, 0.06, 0.5 + 0.45 * i / 28))
pad_n += [(fr(415), m, fr(465) - fr(415), 0.6) for m in (62, 63, 68, 69)]
# punch drone
pad_n += [(fr(375), m, fr(411) - fr(375), 0.5) for m in (38, 39, 45)]

# Lexis
for b0, nb, c in LEX:
    root, tones = CH[c]
    pad_n += [(B(b0) - 0.02, m, 0.6 * nb + 0.1, 0.7) for m in tones]
    for e in range(int(nb * 2)):
        bass_n.append((B(b0) + e * 0.3, root + 12 if e % 2 == 0 else root + 24, 0.25, 0.7))
    plk = [tones[0], tones[1], tones[2], tones[3], tones[2] + 12, tones[1] + 12, tones[3], tones[2]]
    for i in range(int(nb * 4)):
        pluck_n.append((B(b0) + i * X, plk[i % 8], 0.3, 0.6 + 0.02 * i))
    if b0 >= 12:
        for i in range(int(nb * 4)):
            r = tones[0] - 12
            pulse_n.append((B(b0) + i * X, [r, r, r + 7, r + 12][i % 4], 0.12, 0.5 + 0.12 * (b0 - 12)))
kicks += [B(b) for b in range(10, 18)]
REPRISE = [(10, 1, 71), (11, 1, 74), (12, 1.5, 78), (13.5, 0.5, 76), (14, 1, 74), (15, 0.5, 76), (15.5, 1.5, 78), (17, 1, 81)]
lead_n += [(B(b), m, 0.6 * l - 0.03, 0.6) for b, l, m in REPRISE]
# logo
LAND = fr(820)
root, tones = CH["Dmaj9"]
pad_n += [(LAND - 0.02, m, DUR - LAND - 0.3, 1.0) for m in tones + [50, 57]]
braam_n += [(LAND, m, DUR - LAND - 0.4, 0.9) for m in (38, 45, 50, 54)]
lead_n += [(LAND, 86, 1.0, 0.8)]
bass_n += [(LAND, 26 + 12, 1.2, 1.0)]
for s, m in enumerate((74, 78, 81, 85, 86, 90)):
    pluck_n.append((LAND + s * 0.05, m, 1.2, 0.8))

# ---------------- render synths ----------------
print("rendering synths...", flush=True)
pulse = fit(render(pulse_p, pulse_n, DUR))
pulse = sweep(pulse, [(0, 300), (B(-3), 300), (B(0) - 0.05, 7000), (B(0), 9000), (fr(375), 9000), (fr(376), 2000), (fr(415), 900),
                      (fr(465), 9000), (fr(483), 9000), (B(10), 1500), (B(15.5), 3500), (fr(820), 9000), (DUR, 9000)], res=0.3)
pad = fit(render(pad_p, pad_n, DUR))
bass = fit(render(bass_p, bass_n, DUR))
lead = fit(render(lead_p, lead_n, DUR))
braam = fit(render(braam_p, braam_n, DUR))
pluck = fit(render(pluck_p, pluck_n, DUR))
arp = fit(render(arp_p, arp_n, DUR))
print("synths done", flush=True)

pulse = fx(pulse, pb.Chorus(rate_hz=0.6, depth=0.15, mix=0.25), pb.Delay(delay_seconds=0.45, feedback=0.25, mix=0.14), pb.Reverb(room_size=0.6, wet_level=0.18, dry_level=0.9, width=1.0))
pad = fx(pad, pb.Chorus(rate_hz=0.3, depth=0.3, mix=0.35), pb.Reverb(room_size=0.92, damping=0.5, wet_level=0.35, dry_level=0.75, width=1.0))
lead = fx(lead, pb.Delay(delay_seconds=0.3, feedback=0.3, mix=0.18), pb.Reverb(room_size=0.85, wet_level=0.3, dry_level=0.85))
braam = fx(braam, pb.Reverb(room_size=0.9, wet_level=0.28, dry_level=0.9))
pluck = fx(pluck, pb.Delay(delay_seconds=0.45, feedback=0.3, mix=0.2), pb.Reverb(room_size=0.8, wet_level=0.3, dry_level=0.85))
arp = fx(arp, pb.Delay(delay_seconds=0.225, feedback=0.35, mix=0.25), pb.Reverb(room_size=0.7, wet_level=0.25))
bass = fx(bass, pb.Compressor(threshold_db=-14, ratio=3, attack_ms=5, release_ms=80))

# ---------------- drums, impacts, sound design ----------------
drums, impacts, sfx = S.Bus(N + SR * 4), S.Bus(N + SR * 4), S.Bus(N + SR * 4)
BD = perc("Percussion/bassdrum_rub*.wav")
CR = perc("Percussion/cymbal-crash1_ff_rr*.wav")
GONG = perc("Percussion/gongHit_fff.wav")[0]
SCR = perc("Percussion/susCymb1-cresc-Long_v1.wav")[0]
TIMP = perc("Percussion/Timpani/Timpani*_Hit_v*_rr1_Sum.wav")
for t in kicks:
    drums.add(S.kick(0.45, 1.15, 48), t, 1.0)
for b in list(range(0, 6)) + list(range(10, 18)):
    if b % 2 == 1:
        drums.add(S.clap(0.3), B(b), 0.55 if b < 6 else 0.35)
    drums.add(S.hat(0.25, True), B(b) + 0.3, 0.32 if b < 6 else 0.22, pan=0.2)
    for q in (0.15, 0.45):
        drums.add(S.hat(0.03), B(b) + q, 0.22 if b < 6 else 0.14, pan=-0.3)
# build: accelerating toms + orchestral bass drum on montage cuts
t, k = fr(60), 0
while t < B(0) - 0.02:
    u = (t - fr(60)) / (B(0) - fr(60))
    drums.add(S.tom(80 + 50 * u, 0.3), t, 0.2 + 0.45 * u, pan=0.3 if k % 2 else -0.3)
    t += 0.15 * (1 - u) ** 1.2 + 0.0375
    k += 1
for f in (30, 60, 100, 142):
    impacts.add(BD[f % len(BD)], fr(f), 0.7)
for f in range(30, 47, 2):
    sfx.add(S.blip(S.midi(86 + (f - 30) // 2), 0.02, 0.8, 120), fr(f), 0.1)
# snare roll into the flipbook cut
for i in range(int((fr(375) - fr(330)) / (X / 2))):
    drums.add(S.clap(0.12), fr(330) + i * X / 2, 0.08 + 0.3 * i / 30)
for h, g in ((B(0), 1.0), (fr(411), 1.0), (LAND, 1.0)):
    impacts.add(S.taiko(1.4), h, 0.9 * g)
    impacts.add(BD[0], h, 0.8 * g)
    impacts.add(CR[0], h, 0.7 * g)
    impacts.add(S.subdrop(1.8, 110, 34), h, 0.8 * g)
impacts.add(GONG, LAND, 0.4)
impacts.add(TIMP[0], B(10), 0.5)
sfx.add(SCR[-int(2.2 * SR):], B(0) - 2.2, 0.6)
sfx.add(SCR[-int(1.4 * SR):], LAND - 1.4, 0.5)
sfx.add(S.noise_riser(B(0) - fr(80), 0.8, 3.0), fr(80), 0.5)
sfx.add(S.noise_riser(fr(375) - fr(330), 0.7, 2.6), fr(330), 0.45)
sfx.add(S.noise_riser(LAND - fr(788), 0.7, 2.6), fr(788), 0.45)
sfx.add(S.crt_on(0.45), 0.0, 0.6)
roar = S.load("sfx/saturn_roar.wav")
sfx.add(roar[:int(2.2 * SR)] * np.linspace(1, 0, int(2.2 * SR))[:, None] ** 1.4, B(0), 0.4)
relay = S.load("sfx/relay.mp3")
for f in (0, 17, 178, 189, 193, 221, 240, 247, 254, 260, 266, 272, 277, 282, 287, 292, 297, 301, 309, 314,
          334, 338, 342, 345, 348, 351, 354, 356, 358, 360, 362, 364, 366):
    sfx.add(relay, fr(f), 0.2, pan=0.4 * ((f // 5) % 3 - 1))
for f in (196, 232, 268, 304, 340):
    sfx.add(S.blip(1600, 0.04, 0.7, 70), fr(f), 0.1, pan=-0.5)
for f in range(233, 300, 3):
    sfx.add(S.blip(3200, 0.012, 0.9), fr(f), 0.05, pan=0.6)
tw = S.slices("sfx/typewriter.mp3", 12, 0.18)
for n, f in enumerate((381, 386, 391, 396, 401)):
    sfx.add(tw[n % len(tw)], fr(f), 0.8)
tele = S.load("sfx/teletype.mp3")
seg_ = tele[int(2 * SR):int(2 * SR) + int((fr(466) - fr(413)) * SR)]
sfx.add(seg_ * np.linspace(0.4, 1.0, len(seg_))[:, None], fr(413), 1.2)
kb = S.load("sfx/kb_blue.mp3")
seg_ = kb[int(5 * SR):int(5 * SR) + int((fr(466) - fr(415)) * SR)]
sfx.add(seg_ * np.linspace(0.4, 1.0, len(seg_))[:, None] ** 0.5, fr(415), 1.5)
sfx.add(S.crt_off(0.4), fr(465), 0.9)
sfx.add(S.tone_riser(S.midi(76), S.midi(40), fr(481) - fr(465), 0.2), fr(465), 0.6)
sfx.add(S.blip(S.midi(86), 0.06, 0.1), fr(497), 0.25)
sfx.add(SCR[-int(0.45 * SR):] * 0.7, B(10) - 0.45, 0.5)
ASKS = [dict(a=520, q="unpack this archive", type=1.3, press=551, morph=556), dict(a=598, q="what's on port 3000", type=0.9, press=622, morph=627),
        dict(a=650, q="undo my last commit", type=1.0, press=675, morph=681)]
keys = S.slices("sfx/kb_slow.mp3", 30, 0.12)
enter = S.load("sfx/enter.mp3")
for n, ask in enumerate(ASKS):
    for i, c in enumerate(ask["q"]):
        tt = round(ask["a"] + 2 + i * ask["type"] + (S.jhash(i, n) - 0.5) * ask["type"] * 0.7)
        sfx.add(keys[(i * 7 + n * 3) % len(keys)], fr(tt), 0.45 if c != " " else 0.6, pan=0.1)
    sfx.add(enter / (np.abs(enter).max() + 1e-9), fr(ask["press"]), 0.8)
    impacts.add(S.taiko(0.6), fr(ask["press"]), 0.25)
    for s, m in enumerate([74, 78, 81, 86]):
        sfx.add(S.bell(S.midi(m + 12), 0.6), fr(ask["morph"]) + s * 0.04, 0.12, pan=-0.4 + 0.25 * s)
for k in range(60):
    sfx.add(S.blip(2400 + 1800 * rng.random(), 0.01, 0.9), fr(699) + (k / 60) ** 0.8 * 0.7 + rng.uniform(0, 0.02), 0.05, pan=rng.uniform(-0.8, 0.8))
for k in range(17):
    sfx.add(keys[(k * 5) % len(keys)], fr(776 + k * 0.9) if k < 10 else fr(786 + (k - 10) * 0.85), 0.28)
for k in range(26):
    tt = fr(801) + (k / 26) * (fr(820) - fr(801))
    sfx.add(keys[k % len(keys)], tt, 0.14, pan=-0.6 + 1.2 * k / 26)
    sfx.add(S.blip(1400 + 90 * k, 0.014, 0.8), tt, 0.1, pan=-0.6 + 1.2 * k / 26)

# ---------------- mix ----------------
side = kicks + [B(0), fr(411), LAND]
pad = S.sidechain(pad, side, 0.55)
bass = S.sidechain(bass, side, 0.65, 0.18)
pulse = S.sidechain(pulse, side, 0.3)
dr = fx(drums.x[:N], pb.Compressor(threshold_db=-10, ratio=3, attack_ms=3, release_ms=60), pb.Reverb(room_size=0.4, wet_level=0.08))
imp = fx(impacts.x[:N], pb.Reverb(room_size=0.9, wet_level=0.25, dry_level=0.9))
sx = fx(sfx.x[:N], pb.Reverb(room_size=0.5, wet_level=0.12))
music = pulse * 2.0 + pad * 0.33 + S.lp(bass, 220) * 1.0 + lead * 0.7 + braam * 0.5 + pluck * 0.9 + arp * 0.35
mixd = music + dr * 0.85 + imp * 0.42 + sx * 0.8
mixd = S.hp(mixd, 25, 6)
pts = [(0, -12), (0.5, -8), (0.85, -9), (2.55, -2), (2.65, 0), (6.24, 0), (6.25, -9), (6.84, -7), (6.85, 0), (7.7, -2), (8.05, -3),
       (8.45, -9), (8.64, -5), (8.65, -2.5), (13.6, -1.0), (13.67, 0), (15, 0)]
tt = np.arange(N) / SR
xs, ys = zip(*pts)
mixd *= (10 ** (np.interp(tt, xs, ys) / 20))[:, None]
i0, i1 = int(fr(483) * SR), int(fr(497) * SR)
mixd[i0 - 96:i0] *= np.linspace(1, 0, 96)[:, None]
mixd[i0:i1] = 0
fade = np.ones(N); fade[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR)) ** 2
mixd *= fade[:, None]
mixd = fx(mixd / (np.abs(mixd).max() + 1e-9) * 0.7, pb.Compressor(threshold_db=-12, ratio=2.2, attack_ms=12, release_ms=160),
          pb.Limiter(threshold_db=-2.0, release_ms=80))
mixd.astype(np.float32).tofile("/tmp/lx/mix4.f32")
pre = ["-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "/tmp/lx/mix4.f32"]
r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + pre + ["-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])
subprocess.check_call(["ffmpeg", "-v", "error", "-y"] + pre + ["-af", f"volume={-14 - I:.2f}dB,alimiter=limit=0.89:attack=1:release=60:level=false",
                                                               "-ar", "48000", "../film/assets/score4.wav"])
print("wrote score4.wav")
for nm, bus in (("pulse", pulse * 2.0), ("pad", pad * 0.33), ("bass", bass), ("lead", lead * 0.7), ("braam", braam * 0.5), ("pluck", pluck * 0.9),
                ("drums", dr * 0.85), ("impacts", imp * 0.42), ("sfx", sx * 0.8)):
    row = []
    for a0, b0 in ((0.9, 2.6), (2.7, 6.2), (8.7, 13.6), (13.7, 14.8)):
        seg = bus[int(a0 * SR):int(b0 * SR)]
        row.append(round(10 * np.log10(np.mean(seg ** 2) + 1e-12), 1))
    print(nm.ljust(8), "build/drop/lexis/logo", row)
