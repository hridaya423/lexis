"""Lexis ad score v3: hybrid orchestral techno-optimism (VSCO-2 CE samples + synth), locked to the picture.

100 BPM, beat 0 = frame 159 (Saturn V). 16ths = 0.15 s.
0.00  CRT power-on, organ pedal swells
0.50  window: timpani + bass drum, glock ticks under the patent strobe
0.85  spiccato ostinato (D D A D) enters pp and crescendos with a timpani roll and horn swell
2.65  TUTTI: D - A/C# - Bm - G - A, horns + trumpets melody, low brass, timpani, synth pulse
5.57  flipbook: violins up the octave, snare roll, brass crescendo -> cut
6.25  punch: low strings cluster, typewriter; 6.85 brass stab cluster + gong; wall: chromatic strings climb
7.75  CRT off, silence
8.65  Lexis: harp + glock + organ, ostinato returns, G - D/F# - Em7 - Asus4
13.67 logo: D major tutti, gong, rings out
"""
import json, os, re, subprocess
import numpy as np
import synth as S
from sampler import lib, organ, perc, wav, SR

DUR = 15.0
N = int(SR * (DUR + 4))
fr = lambda f: f / 60.0
B = lambda b: fr(159) + 0.6 * b
X = 0.15  # sixteenth
L = lib()
ORG = organ()
rng = np.random.default_rng(5)

strings, brass, perc_b, keysb, synthb, fx, sfxk, low = (S.Bus(N) for _ in range(8))


def play(bus, ins, m, t, dur, vel=0.7, pan=0.0, release=0.25, pre=0.0, gain=1.0, attack=0.0):
    y = L[ins].play(m, dur, vel, release, attack)
    on = 0.0 if attack > 0 else min(L[ins].last_onset, 0.12)
    bus.add(y, t - on, gain, pan)


def chord_tones(ch):
    return {
        "D": (38, [50, 54, 57, 62, 66, 69]), "A/C#": (37, [49, 52, 57, 61, 64, 69]), "Bm": (35, [47, 50, 54, 59, 62, 66]),
        "G": (31, [43, 50, 55, 59, 62, 67]), "A": (33, [45, 52, 57, 61, 64, 69]), "Asus": (33, [45, 50, 57, 62, 64, 69]),
        "D/F#": (30, [42, 50, 54, 57, 62, 69]), "Em7": (28, [40, 50, 55, 59, 62, 67]), "Dadd9": (26, [38, 50, 54, 57, 64, 66, 69, 76]),
    }[ch]


# percussion one-shots
TIMP = perc("Percussion/Timpani/Timpani*_Hit_v*_rr1_Sum.wav")
TROLL = perc("Percussion/Timpani/Rolls/*.wav")
BD = perc("Percussion/bassdrum_rub*.wav")
CRASH = perc("Percussion/cymbal-crash1_ff_rr*.wav")
GONG = perc("Percussion/gongHit_fff.wav")
SCR = perc("Percussion/susCymb1-cresc-Long_v1.wav")[0]
SNR = perc("Percussion/timpsnare*_f*.wav")
BIGBD = perc("VSCO 1 Percussion/drums/bass/bdrum*_fff*.wav") or BD

# ---------------- 0. power-on + organ pedal ----------------
fx.add(S.crt_on(0.45), 0.0, 0.6)
for m in (38, 45, 50):
    keysb.add(ORG.play(m, B(0) - 0.05, 0.6, 0.15, attack=1.8), 0.05, 0.55 if m == 38 else 0.35)
relay = S.load("sfx/relay.mp3")
for f in (0, 17):
    fx.add(relay, fr(f), 0.4)

# ---------------- 1. window + patent strobe ----------------
perc_b.add(TIMP[0], fr(30), 1.0)
perc_b.add(BD[1], fr(30), 0.9)
fx.add(S.projector(fr(47) - fr(30), 30), fr(30), 0.3)
for k, f in enumerate(range(30, 47, 2)):
    play(keysb, "glock", [74, 76, 78, 81, 83, 86, 88, 90, 93][k], fr(f), 0.2, 0.5, pan=0.3 * (k % 2 * 2 - 1), gain=0.5)

# ---------------- 2. build: ostinato enters at beat -3 ----------------
DDAD = lambda r: [r, r, r + 7, r + 12]
t0 = B(-3)
for i in range(int(round((B(0) - t0) / X))):
    t = t0 + i * X
    u = (t - t0) / (B(0) - t0)
    v = 0.35 + 0.6 * u ** 1.2
    pat = DDAD(50)
    play(strings, "vla_spic", pat[i % 4], t, 0.12, v, -0.25, 0.12)
    play(strings, "vc_spic", pat[i % 4] - 12, t, 0.12, v, 0.3, 0.12)
    if t >= B(-2):
        play(strings, "vln_spic", pat[i % 4] + 12, t, 0.12, v, -0.55, 0.12)
    if t >= B(-1):
        play(strings, "vln_spic", pat[(i + 2) % 4] + 24, t, 0.1, v * 0.8, -0.7, 0.1, gain=0.7)
perc_b.add(TROLL[-1][:int((B(0) - B(-2)) * SR)] * np.linspace(0.15, 1, int((B(0) - B(-2)) * SR))[:, None] ** 2, B(-2), 0.9)
for m, p in ((50, -0.3), (57, 0.0), (62, 0.3)):
    play(brass, "horn", m, B(-2), B(0) - B(-2), 0.85, p, 0.05, attack=1.0, gain=0.7)
play(brass, "tbn", 38, B(-1), 0.6, 0.8, 0.2, 0.05, attack=0.5, gain=0.8)
fx.add(SCR[-int(min(len(SCR), 2.2 * SR)):], B(0) - min(len(SCR) / SR, 2.2), 0.7)
for f in (60, 82, 100, 116, 130, 142):
    perc_b.add(BD[f % len(BD)], fr(f), 0.55)
    perc_b.add(TIMP[(f // 7) % len(TIMP)], fr(f), 0.45)
fx.add(S.noise_riser(B(0) - fr(90), 0.5, 3.0), fr(90), 0.5)

# ---------------- 3. TUTTI: beats 0..6 ----------------
prog = [(0, 2, "D"), (2, 1, "A/C#"), (3, 1, "Bm"), (4, 1, "G"), (5, 1, "A")]
for b0, nb, ch in prog:
    root, tones = chord_tones(ch)
    d = 0.6 * nb
    # ostinato: root root fifth octave, violins an octave above
    for i in range(int(nb * 4)):
        t = B(b0) + i * X
        r = tones[0] + 12 if tones[0] < 48 else tones[0]
        pat = [r, r, r + 7, r + 12]
        play(strings, "vc_spic", pat[i % 4] - 12, t, 0.12, 0.95, 0.3, 0.12)
        play(strings, "vla_spic", pat[i % 4], t, 0.12, 0.95, -0.2, 0.12)
        play(strings, "vln_spic", pat[i % 4] + 12, t, 0.12, 0.9, -0.55, 0.12)
        play(strings, "cb_spic", root + 12 if i % 2 == 0 else root + 24, t, 0.12, 0.9, 0.45, 0.12, gain=0.8)
    # sustained strings + low brass
    for m in tones[2:5]:
        play(strings, "vln_sus", m + 12, B(b0), d, 0.8, -0.4, 0.3, pre=0.05, gain=0.45)
    play(brass, "tbn", tones[0] + 12, B(b0), d, 0.95, 0.2, 0.15, pre=0.03)
    play(brass, "tbn", tones[1], B(b0), d, 0.9, 0.35, 0.15, pre=0.03)
    play(brass, "tuba", root + 12, B(b0), d, 0.95, 0.1, 0.15, pre=0.03)
    low.add(S.sub(S.midi(root + 12), d, 0.8), B(b0), 0.5)
# melody: horns (low octave) + trumpets (top), from beat 0
MEL = [(0, 1.0, 69), (1, 0.5, 74), (1.5, 0.25, 73), (1.75, 0.25, 74), (2, 1.0, 76), (3, 0.75, 78), (3.75, 0.25, 76),
       (4, 1.0, 79), (5, 0.5, 81), (5.5, 0.5, 78)]
for b, l, m in MEL:
    play(brass, "horn", m - 12, B(b), 0.6 * l, 0.95, -0.15, 0.2, pre=0.05)
    play(brass, "horn", m - 24, B(b), 0.6 * l, 0.8, 0.15, 0.2, pre=0.05, gain=0.6)
    if b >= 2:
        play(brass, "tpt", m, B(b), 0.6 * l, 0.85 if b >= 4 else 0.6, 0.0, 0.2, pre=0.04, gain=0.75)
    play(keysb, "glock", m + 12, B(b), 0.3, 0.6, 0.35, 0.6, gain=0.35)
# percussion: timpani and bass drum on 0,2,4; synth kick four on the floor; crash on 0 and 4
for b in range(6):
    perc_b.add(S.kick(0.45, 1.0), B(b), 0.6)
    if b % 2 == 0:
        perc_b.add(TIMP[b % len(TIMP)], B(b), 1.0)
        perc_b.add(BIGBD[b % len(BIGBD)], B(b), 0.9)
    perc_b.add(S.hat(0.03), B(b) + 0.3, 0.5)
for b in (0, 4):
    perc_b.add(CRASH[b // 4 % len(CRASH)], B(b), 0.8)
perc_b.add(GONG[0], B(0), 0.35)
low.add(S.subdrop(1.6, 100, 37), B(0), 0.7)
roar = S.load("sfx/saturn_roar.wav")
fx.add(roar[:int(2.2 * SR)] * np.linspace(1, 0, int(2.2 * SR))[:, None] ** 1.4, B(0), 0.45)
# synth pulse: 8th note sub + saw pad, sidechained to the kick
pulse = S.Bus(N)
for b0, nb, ch in prog:
    root, tones = chord_tones(ch)
    for e in range(int(nb * 2)):
        pulse.add(S.supersaw([S.midi(root + 24)], 0.26, bright=3.0, attack=0.004, release=0.08), B(b0) + 0.3 * e, 0.5)
synthb.x += S.sidechain(pulse.x, [B(b) for b in range(6)], 0.7)
# plate flip ticks + year roll
for f in (196, 232, 268, 304, 340):
    fx.add(S.blip(1600, 0.04, 0.7, 70), fr(f), 0.12, pan=-0.5)
for f in range(233, 300, 3):
    fx.add(S.blip(3200, 0.012, 0.9), fr(f), 0.06, pan=0.6)
# flipbook: violins jump up, snare roll, brass crescendo on A
for i in range(int((fr(375) - fr(334)) / (X / 2))):
    t = fr(334) + i * X / 2
    perc_b.add(SNR[i % len(SNR)], t, 0.2 + 0.4 * i / 30)
for f in (334, 338, 342, 345, 348, 351, 354, 356, 358, 360, 362, 364, 366):
    fx.add(relay, fr(f), 0.3)
fx.add(S.noise_riser(fr(375) - fr(330), 0.5, 2.5), fr(330), 0.5)

for f in (178, 189, 193, 221, 240, 247, 254, 260, 266, 272, 277, 282, 287, 292, 297, 301, 309, 314):
    fx.add(relay, fr(f), 0.22, pan=0.4 * ((f // 5) % 3 - 1))

# ---------------- 4. punch ----------------
P0 = fr(375)
play(strings, "vc_sus", 38, P0, fr(411) - P0, 0.7, -0.3, 0.3, gain=0.8)
play(strings, "vc_sus", 39, P0, fr(411) - P0, 0.6, 0.3, 0.3, gain=0.6)
play(strings, "cb_spic", 26, P0, 0.4, 0.9, 0, 0.6)
perc_b.add(TIMP[-1], P0, 0.7)
tw_hits = S.slices("sfx/typewriter.mp3", 12, 0.18)
for n, f in enumerate((381, 386, 391, 396, 401)):
    sfxk.add(tw_hits[n % len(tw_hits)], fr(f), 0.8)
    play(keysb, "glock", [87, 88, 87, 88, 89][n], fr(f), 0.2, 0.4, 0.4, 0.4, gain=0.25)
S0 = fr(411)
for ins, ms in (("tpt_st", (74, 75)), ("tbn_st", (45, 46, 50)), ("tuba_st", (26, 27)), ("horn_st", (57, 58, 62))):
    for m in ms:
        play(brass, ins, m, S0, 0.5, 1.0, 0, 0.4)
perc_b.add(TIMP[0], S0, 1.0); perc_b.add(BIGBD[0], S0, 1.0); perc_b.add(GONG[0], S0, 0.7); perc_b.add(CRASH[0], S0, 0.8)
low.add(S.subdrop(1.0, 110, 30), S0, 0.7)
for i in range(int((fr(465) - fr(415)) / (X / 2))):
    t = fr(415) + i * X / 2
    m = 50 + i // 2
    v = 0.4 + 0.5 * i / 28
    play(strings, "vla_spic", m, t, 0.07, v, -0.2, 0.08)
    play(strings, "vln_spic", m + 13, t, 0.07, v, -0.6, 0.08, gain=0.8)
    play(strings, "vc_spic", m - 11, t, 0.07, v, 0.4, 0.08)
for m in (62, 63, 68):
    play(brass, "horn", m - 12, fr(415), fr(465) - fr(415), 0.85, 0, 0.05, attack=0.7, gain=0.6)
tele = S.load("sfx/teletype.mp3")
seg_ = tele[int(2 * SR):int(2 * SR) + int((fr(466) - fr(413)) * SR)]
fx.add(seg_ * np.linspace(0.4, 1.0, len(seg_))[:, None], fr(413), 1.5)
kb = S.load("sfx/kb_blue.mp3")
seg_ = kb[int(5 * SR):int(5 * SR) + int((fr(466) - fr(415)) * SR)]
sfxk.add(seg_ * np.linspace(0.4, 1.0, len(seg_))[:, None] ** 0.5, fr(415), 1.8)
fx.add(S.crt_off(0.4), fr(465), 0.9)
fx.add(S.tone_riser(S.midi(76), S.midi(40), fr(481) - fr(465), 0.2), fr(465), 0.6)

# ---------------- 5. silence -> flood -> Lexis ----------------
fx.add(S.blip(S.midi(86), 0.06, 0.1), fr(497), 0.25)
for m in (43, 50, 55, 59):
    keysb.add(ORG.play(m, B(12) - fr(503), 0.6, 0.6, attack=0.25), fr(503), 0.4)
fx.add(SCR[-int(0.4 * SR):] * 0.6, B(10) - 0.4, 0.5)
LX = [(10, 2, "G"), (12, 2, "D/F#"), (14, 1.5, "Em7"), (15.5, 2.95, "Asus")]
for b0, nb, ch in LX:
    root, tones = chord_tones(ch)
    d = 0.6 * nb
    for m in tones[2:5]:
        play(strings, "vln_sus", m + 12, B(b0), d + 0.1, 0.55 + 0.08 * (b0 - 10), -0.4, 0.4, pre=0.08, gain=0.45)
        play(strings, "vla_sus", m, B(b0), d + 0.1, 0.5, 0.0, 0.4, pre=0.08, gain=0.35)
    play(strings, "vc_sus", root + 12 if root < 36 else root, B(b0), d + 0.1, 0.65, 0.35, 0.4, pre=0.08, gain=0.6)
    low.add(S.sub(S.midi(root + 12), d, 0.6), B(b0), 0.35)
    # harp 16ths up the chord
    arp = [tones[1] + 12, tones[2] + 12, tones[3] + 12, tones[4] + 12, tones[3] + 24, tones[2] + 24, tones[4] + 12, tones[3] + 12]
    for i in range(int(nb * 4)):
        play(keysb, "harp", arp[i % 8], B(b0) + i * X, 0.3, 0.7, 0.45 - 0.1 * (i % 3), 0.5, gain=0.6)
    if b0 >= 12:
        for i in range(int(nb * 4)):
            r = tones[0] + 24
            v = 0.35 + 0.1 * (b0 - 12) + 0.25 * (i / (nb * 4))
            play(strings, "vla_spic", [r, r, r + 7, r + 12][i % 4], B(b0) + i * X, 0.12, v, -0.2, 0.12)
            play(strings, "vc_spic", [r, r, r + 7, r + 12][i % 4] - 12, B(b0) + i * X, 0.12, v, 0.3, 0.12)
for b in range(10, 18):
    perc_b.add(S.kick(0.4, 0.75), B(b), 0.45)
    perc_b.add(S.hat(0.03), B(b) + 0.3, 0.35)
perc_b.add(TIMP[1], B(10), 0.7)
perc_b.add(TROLL[-2][:int((fr(820) - B(15.5)) * SR)] * np.linspace(0.1, 1, int((fr(820) - B(15.5)) * SR))[:, None] ** 2, B(15.5), 0.8)
# typing, Return, morph sparkle (glock arpeggio of the current chord)
ASKS = [dict(a=520, q="unpack this archive", type=1.3, press=551, morph=556), dict(a=598, q="what's on port 3000", type=0.9, press=622, morph=627),
        dict(a=650, q="undo my last commit", type=1.0, press=675, morph=681)]
key_hits = S.slices("sfx/kb_slow.mp3", 30, 0.12)
enter = S.load("sfx/enter.mp3")
for n, ask in enumerate(ASKS):
    for i, c in enumerate(ask["q"]):
        tt = round(ask["a"] + 2 + i * ask["type"] + (S.jhash(i, n) - 0.5) * ask["type"] * 0.7)
        sfxk.add(key_hits[(i * 7 + n * 3) % len(key_hits)], fr(tt), 0.45 if c != " " else 0.6, pan=0.1)
    sfxk.add(enter / (np.abs(enter).max() + 1e-9), fr(ask["press"]), 0.8)
    perc_b.add(TIMP[n % len(TIMP)], fr(ask["press"]), 0.35)
    _, tones = chord_tones(["G", "D/F#", "Asus"][n])
    for s, m in enumerate([tones[2], tones[3], tones[4], tones[5], tones[3] + 12, tones[4] + 12]):
        play(keysb, "glock", m + 12, fr(ask["morph"]) + s * 0.04, 0.3, 0.6, -0.5 + s * 0.2, 0.5, gain=0.3)
for k in range(60):
    tt = fr(699) + (k / 60) ** 0.8 * 0.7 + rng.uniform(0, 0.02)
    fx.add(S.blip(2400 + 1800 * rng.random(), 0.01, 0.9), tt, 0.05, pan=rng.uniform(-0.8, 0.8))
for k in range(10):
    sfxk.add(key_hits[(k * 5) % len(key_hits)], fr(776 + k * 0.9), 0.28, pan=0.3 - k * 0.04)
for k in range(7):
    sfxk.add(key_hits[(k * 3 + 1) % len(key_hits)], fr(786 + k * 0.85), 0.28, pan=0.1 - k * 0.04)
for k in range(26):
    tt = fr(801) + (k / 26) * (fr(820) - fr(801))
    sfxk.add(key_hits[k % len(key_hits)], tt, 0.14, pan=-0.6 + 1.2 * k / 26)
    play(keysb, "glock", [74, 78, 81, 86][k % 4] + 12 * (k // 13), tt, 0.1, 0.4, -0.6 + 1.2 * k / 26, 0.3, gain=0.18)
fx.add(SCR[-int(1.2 * SR):], fr(820) - 1.2, 0.6)

# ---------------- 6. logo: D major tutti ----------------
LAND = fr(820)
ring = DUR - LAND + 0.8
root, tones = chord_tones("Dadd9")
for m in (50, 54, 57, 62):
    play(brass, "horn", m, LAND, ring, 0.95, -0.2 + 0.1 * (m % 4), 1.0, pre=0.04)
for m in (69, 74, 78):
    play(brass, "tpt", m, LAND, ring * 0.8, 0.85, 0.1, 1.0, pre=0.04, gain=0.7)
for m in (38, 45, 50):
    play(brass, "tbn", m, LAND, ring, 0.95, 0.3, 1.0, pre=0.04)
play(brass, "tuba", 26 + 12, LAND, ring, 1.0, 0, 1.0, pre=0.04)
for m in (62, 66, 69, 76):
    play(strings, "vln_sus", m + 12, LAND, ring, 0.9, -0.45, 1.0, pre=0.06, gain=0.5)
play(strings, "vc_sus", 38, LAND, ring, 0.9, 0.4, 1.0, pre=0.06)
for m in (38, 50, 57, 62, 66):
    keysb.add(ORG.play(m, ring, 0.8, 1.0), LAND, 0.4)
for s, m in enumerate((74, 78, 81, 86, 90, 93)):
    play(keysb, "glock", m, LAND + s * 0.05, 0.5, 0.7, -0.5 + 0.2 * s, 1.2, gain=0.35)
for s, m in enumerate(range(50, 98, 3)):
    play(keysb, "harp", m, LAND - 0.25 + s * 0.016, 0.4, 0.6, -0.6 + s * 0.08, 0.8, gain=0.35)
perc_b.add(TIMP[0], LAND, 1.0); perc_b.add(BIGBD[0], LAND, 1.0); perc_b.add(GONG[0], LAND, 0.8); perc_b.add(CRASH[1 % len(CRASH)], LAND, 0.8)
perc_b.add(S.kick(0.7, 1.2), LAND, 0.7)
low.add(S.subdrop(2.0, 90, 37), LAND, 0.7)

# ---------------- mix ----------------
Nd = int(DUR * SR)
str_m = S.reverb(S.hp(strings.x, 60), 2.6, 0.28, width=1.1)
brs_m = S.reverb(S.hp(brass.x, 40), 2.6, 0.32)
key_m = S.reverb(keysb.x, 2.8, 0.38)
prc_m = S.reverb(perc_b.x, 2.0, 0.22, tone=30)
syn_m = S.lp(synthb.x, 2500)
fx_m = S.reverb(fx.x, 1.6, 0.2)
sk_m = S.reverb(sfxk.x, 0.5, 0.08, tone=20)
low_m = S.lp(low.x, 140)
music = str_m * 0.9 + brs_m * 1.0 + key_m * 1.35 + prc_m * 0.75 + syn_m * 0.25 + low_m * 0.35
os.makedirs("stems", exist_ok=True)
mixd = music + fx_m * 0.8 + sk_m * 1.0
mixd = S.hp(mixd, 25, 6)[:Nd]
pts = [(0, -10), (0.5, -6), (0.85, -8), (2.55, -1.5), (2.65, 0), (6.24, 0), (6.25, -8), (6.84, -6), (6.85, 0), (7.7, -2), (8.05, -3),
       (8.45, -8), (8.64, -4), (8.65, -2), (13.6, -1.0), (13.67, 0), (15, 0)]
tt = np.arange(Nd) / SR
xs, ys = zip(*pts)
mixd *= (10 ** (np.interp(tt, xs, ys) / 20))[:, None]
i0, i1 = int(fr(483) * SR), int(fr(497) * SR)
mixd[i0 - 96:i0] *= np.linspace(1, 0, 96)[:, None]
mixd[i0:i1] = 0
fade = np.ones(Nd); fade[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR)) ** 2
mixd *= fade[:, None]
mixd = S.saturate(mixd / (np.abs(mixd).max() + 1e-9) * 1.15, 1.1) * 0.9
mixd.astype(np.float32).tofile("/tmp/lx/mix3.f32")
pre = ["-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "/tmp/lx/mix3.f32"]
meas = subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + pre + ["-af", "loudnorm=I=-14:TP=-1:LRA=14:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^}]+\}", meas, re.S).group(0))
af = (f"acompressor=threshold=-14dB:ratio=2:attack=15:release=180:makeup=1,"
      f"loudnorm=I=-14:TP=-1:LRA=14:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:linear=true")
subprocess.check_call(["ffmpeg", "-v", "error", "-y"] + pre + ["-af", af, "-ar", "48000", "/tmp/lx/score3_a.wav"])
r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", "/tmp/lx/score3_a.wav", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", "/tmp/lx/score3_a.wav", "-af", f"volume={-14 - I:.2f}dB,alimiter=limit=0.89:attack=1:release=60:level=false",
                       "-ar", "48000", "../film/assets/score3.wav"])
print("wrote score3.wav")
for nm, bus in (("strings", str_m), ("brass", brs_m), ("keys", key_m), ("perc", prc_m), ("synth", syn_m * 0.25), ("fx", fx_m * 0.8), ("sfxk", sk_m), ("low", low_m * 0.35)):
    for a0, b0, lab in ((0.9, 2.6, "build"), (2.7, 6.2, "drop"), (8.7, 13.6, "lexis"), (13.7, 14.8, "logo")):
        seg = bus[int(a0 * SR):int(b0 * SR)]
        print(nm.ljust(8), lab.ljust(6), round(10 * np.log10(np.mean(seg ** 2) + 1e-12), 1))
