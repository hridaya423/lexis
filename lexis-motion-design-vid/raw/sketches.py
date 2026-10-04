"""Drop sketches (A/B/C/D) on the shared v5 intro. Based on score v5: tighter, more epic v4. Everything on the 16th grid; epic acoustic drums (VSCO marching snare,
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

DUR = 6.9
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

import sys
grid = lambda b0, b1, step=0.25: [b0 + i * step for i in range(int(round((b1 - b0) / step)))]
D_ = "VSCO 1 Percussion/drums/"
norm = lambda x: x / (np.abs(x).max() + 1e-9)
GIANT = [norm(x) for x in perc(D_ + "other/ethnic/giant/mallet/*.wav")]
TEN = [norm(x) for x in perc(D_ + "tenor/tenor_lower/tenor_ff*.wav") + perc(D_ + "tenor/tenor_lower/tenor_fff*.wav")]
TENH = [norm(x) for x in perc(D_ + "tenor/tenor_higher/tenorH_ff*.wav")]
SN = [norm(x) for x in perc(D_ + "snare/drum3_marching/snare3_f*.wav")]
SNF = [norm(x) for x in (perc(D_ + "snare/drum3_marching/snare3_fff*.wav") or SN)]
CBD = [norm(x) for x in perc(D_ + "bass/bdrum*_fff*.wav") + perc(D_ + "bass/bdrum_ff*.wav")]
CR = perc("Percussion/cymbal-crash1_ff_rr*.wav")
SCR = perc("Percussion/susCymb1-cresc-Long_v1.wav")[0]
CUT = B(6)  # punchline frame 375: music stops here
PROG = [(0, 2, "Bm"), (2, 2, "G"), (4, 1, "D"), (5, 1, "A")]
CHX = {"Bm": (35, [59, 62, 66, 69, 73]), "G": (31, [59, 62, 66, 67, 71]), "D": (38, [62, 64, 66, 69, 74]), "A": (33, [61, 64, 69, 71, 76])}


def common():
    """the v5 intro exactly, plus picture-synced sound design up to the punchline"""
    n = dict(pulse=[], pad=[], bass=[])
    for k, b in enumerate(grid(-3, 0)):
        n["pulse"].append((B(b), [50, 50, 57, 62][k % 4] + (12 if b >= -1 and k % 2 else 0), 0.12, 0.55 + 0.4 * (b + 3) / 3))
    n["pad"] += [(fr(4), m, B(0) - fr(4) - 0.05, 0.55) for m in (50, 57, 62, 69)]
    n["bass"] += [(B(b), 38, 0.1, 0.5 + 0.15 * (b + 1)) for b in grid(-1, 0)]
    ac, imp, sfx = S.Bus(N + SR * 4), S.Bus(N + SR * 4), S.Bus(N + SR * 4)
    k = 0
    for b in grid(-3, -1, 0.5):
        ac.add(TEN[k % len(TEN)], B(b), 0.35 + 0.15 * (b + 3), -0.2); k += 1
    for b in grid(-1, -0.5):
        ac.add((TEN if int(b * 4) % 2 == 0 else TENH)[k % 4], B(b), 0.6, 0.2); k += 1
    for j, b in enumerate(grid(-0.5, 0, 0.125)):
        ac.add(SN[j % len(SN)], B(b), 0.35 + 0.1 * j, 0.1)
    for b in (-3, -2, -1):
        ac.add(GIANT[(b + 3) % len(GIANT)], B(b), 0.55 + 0.15 * (b + 3))
    imp.add(GIANT[0], fr(30), 0.8)
    for f in (60, 100, 142):
        imp.add(CBD[f % len(CBD)], fr(f), 0.5)
    imp.add(S.taiko(1.4), B(0), 0.8); imp.add(CBD[0], B(0), 0.8); imp.add(CR[0], B(0), 0.6); imp.add(S.subdrop(1.8, 110, 34), B(0), 0.8)
    sfx.add(SCR[-int(2.2 * SR):], B(0) - 2.2, 0.55)
    sfx.add(S.noise_riser(B(0) - fr(80), 0.8, 3.0), fr(80), 0.45)
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
    return n, ac, imp, sfx


def mixdown(stems, ac, imp, sfx, name, side=()):
    """stems: list of (audio, gain, sidechain_depth)"""
    music = np.zeros((N, 2))
    for y, g, sc in stems:
        y = fit(y)
        if sc and side:
            y = S.sidechain(y, list(side), sc)
        music += y * g
    a = fx(ac.x[:N], pb.Compressor(threshold_db=-12, ratio=2.5, attack_ms=8, release_ms=120), pb.Reverb(room_size=0.85, damping=0.4, wet_level=0.3, dry_level=0.85))
    i = fx(imp.x[:N], pb.Reverb(room_size=0.9, wet_level=0.25, dry_level=0.9))
    s = fx(sfx.x[:N], pb.Reverb(room_size=0.5, wet_level=0.12))
    mixd = music + a * 0.75 + i * 0.4 + s * 0.8
    tt = np.arange(N) / SR
    pts = [(0, -12), (0.5, -8), (0.85, -9), (2.55, -2), (2.65, 0), (6.9, 0)]
    xs, ys = zip(*pts)
    mixd *= (10 ** (np.interp(tt, xs, ys) / 20))[:, None]
    c = int(CUT * SR)
    tail = np.exp(-np.arange(N - c) / (0.12 * SR))
    mixd[c:] *= tail[:, None]
    mixd = S.hp(mixd, 25, 6)
    mixd = fx(mixd / (np.abs(mixd).max() + 1e-9) * 0.7, pb.Compressor(threshold_db=-12, ratio=2.2, attack_ms=12, release_ms=160), pb.Limiter(threshold_db=-2.0, release_ms=80))
    tmp = f"/tmp/lx/sk_{name}.f32"
    mixd.astype(np.float32).tofile(tmp)
    pre = ["-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", tmp]
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + pre + ["-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])
    subprocess.check_call(["ffmpeg", "-v", "error", "-y"] + pre + ["-af", f"volume={-14 - I:.2f}dB,alimiter=limit=0.89:attack=1:release=60:level=false",
                                                                   "-ar", "48000", f"../film/assets/sketch_{name}.wav"])
    print("wrote", name, flush=True)


def chords(fn):
    for b0, nb, c in PROG:
        root, tones = CHX[c]
        fn(b0, nb, c, root, tones)


# ================= A. cinematic pulse: half-time epic, one motif, space =================
def sketch_A():
    n, ac, imp, sfx = common()
    sub_n, braam_n, line_n = [], [], []
    def f(b0, nb, c, root, tones):
        r = root + 24 if root + 24 >= 55 else root + 36
        for k, b in enumerate(grid(b0, b0 + nb)):
            n["pulse"].append((B(b), [r - 12, r - 12, r - 5, r][k % 4], 0.12, 0.9))
        sub_n.append((B(b0), root + 12, 0.6 * nb - 0.02, 1.0))
        braam_n.extend((B(b0), m, 0.9 if nb == 2 else 0.5, 0.95) for m in (root + 12, root + 19, root + 24))
        n["pad"].extend((B(b0) - 0.02, m, 0.6 * nb, 0.7) for m in tones[:4])
    chords(f)
    line_n += [(B(0), 78, 1.18, 0.75), (B(2), 79, 1.18, 0.8), (B(4), 81, 0.58, 0.85), (B(5), 83, 0.58, 0.9)]
    for b in (0, 2, 4):
        ac.add(GIANT[b % len(GIANT)], B(b), 1.0)
        ac.add(CBD[b % len(CBD)], B(b), 0.7)
    for b in (1.75, 3.75):
        ac.add(GIANT[1], B(b), 0.5)
    for b in (1, 3, 5):
        ac.add(SNF[b % len(SNF)], B(b), 0.95)
        ac.add(S.clap(0.4), B(b), 0.5)
    for j, b in enumerate(grid(5.5, 6)):
        ac.add((TEN if j % 2 == 0 else TENH)[j % 4], B(b), 0.55 + 0.1 * j)
    for b in grid(0, 6, 0.5):
        ac.add(S.hat(0.02), B(b + 0.25), 0.06, 0.3)
    pulse = sweep(fit(render(pulse_p, n["pulse"], DUR)), [(0, 300), (B(-3), 300), (B(0) - 0.05, 6000), (B(0), 2600), (B(4), 3200), (B(6), 6000), (DUR, 6000)], res=0.3)
    pulse = fx(pulse, pb.Reverb(room_size=0.6, wet_level=0.14, dry_level=0.9))
    pad = fx(fit(render(pad_p, n["pad"], DUR)), pb.Chorus(rate_hz=0.3, depth=0.3, mix=0.35), pb.Reverb(room_size=0.92, wet_level=0.35, dry_level=0.75))
    bass = fit(render(bass_p, n["bass"], DUR))
    sub = fit(render(sub_p, sub_n, DUR))
    braam = fx(fit(render(braam_p, braam_n, DUR)), pb.Reverb(room_size=0.9, wet_level=0.3, dry_level=0.9))
    line = fx(fit(render(line_p, line_n, DUR)), pb.Reverb(room_size=0.95, wet_level=0.4, dry_level=0.8))
    mixdown([(pulse, 1.8, 0.0), (pad, 0.3, 0.0), (bass, 1.0, 0.0), (sub, 0.9, 0.0), (braam, 0.55, 0.0), (line, 0.45, 0.0)], ac, imp, sfx, "A_cinematic")


# ================= B. retro-futurist: analog arp bass, gated pad, backbeat =================
def sketch_B():
    n, ac, imp, sfx = common()
    arpb_n, gate_n, lead_n = [], [], []
    def f(b0, nb, c, root, tones):
        r = root + 12
        for k, b in enumerate(grid(b0, b0 + nb)):
            arpb_n.append((B(b), [r, r + 12, r + 7, r + 12][k % 4], 0.11, 0.95 if k % 4 == 0 else 0.75))
            gate_n.extend((B(b), m, 0.1, 0.6 if k % 2 == 0 else 0.4) for m in tones[1:4])
    chords(f)
    lead_n += [(B(0), 74, 0.55, 0.85), (B(1), 73, 0.25, 0.8), (B(1.5), 74, 0.25, 0.8), (B(2), 71, 1.15, 0.85), (B(4), 69, 0.55, 0.85), (B(5), 76, 0.55, 0.9)]
    for b in range(6):
        if b % 2 == 0:
            ac.add(S.kick(0.5, 1.2, 46), B(b), 1.0)
        else:
            ac.add(SNF[b % len(SNF)], B(b), 0.8)
            ac.add(S.clap(0.5), B(b), 0.7)
        ac.add(S.hat(0.03), B(b + 0.5), 0.25, 0.25)
        ac.add(S.hat(0.25, True), B(b + 0.5), 0.12, -0.2)
    for j, b in enumerate(grid(5.5, 6)):
        ac.add(SN[j % len(SN)], B(b), 0.4 + 0.1 * j)
    pulse = sweep(fit(render(pulse_p, n["pulse"], DUR)), [(0, 300), (B(-3), 300), (B(0) - 0.05, 6000), (DUR, 6000)], res=0.3)
    arpb = sweep(fit(render(arpbass_p, arpb_n, DUR)), [(0, 600), (B(0), 600), (B(4), 1800), (B(6), 3500), (DUR, 3500)], res=0.55)
    gate = fx(fit(render(pad_p, gate_n, DUR)), pb.Chorus(rate_hz=0.5, depth=0.25, mix=0.3), pb.Reverb(room_size=0.8, wet_level=0.3))
    lead = fx(fit(render(retro_lead_p, lead_n, DUR)), pb.Delay(delay_seconds=0.45, feedback=0.3, mix=0.2), pb.Reverb(room_size=0.85, wet_level=0.3))
    pad = fx(fit(render(pad_p, n["pad"], DUR)), pb.Reverb(room_size=0.9, wet_level=0.3))
    bass = fit(render(bass_p, n["bass"], DUR))
    mixdown([(pulse, 1.6, 0.0), (pad, 0.3, 0.0), (bass, 1.0, 0.0), (arpb, 1.3, 0.25), (gate, 0.45, 0.2), (lead, 0.55, 0.0)], ac, imp, sfx, "B_retro",
            side=[B(b) for b in range(0, 6, 2)])


# ================= C. emotive electronic: rolling 8ths, warm voicings, singing line =================
def sketch_C():
    n, ac, imp, sfx = common()
    roll_n, chord_n, sing_n = [], [], []
    def f(b0, nb, c, root, tones):
        for k, b in enumerate(grid(b0, b0 + nb, 0.5)):
            roll_n.append((B(b), root + 12, 0.25, 0.9 if k % 2 == 0 else 0.7))
        for b in [b0 + x for x in (0, 0.75, 1.5) if b0 + x < b0 + nb]:
            chord_n.extend((B(b), m, 0.4, 0.75) for m in tones)
        n["pad"].extend((B(b0) - 0.02, m, 0.6 * nb, 0.65) for m in tones)
        r = root + 24 if root + 24 >= 55 else root + 36
        for k, b in enumerate(grid(b0, b0 + nb)):
            n["pulse"].append((B(b), [r - 12, r - 5, r, r - 5][k % 4], 0.1, 0.55))
    chords(f)
    sing_n += [(B(0), 78, 0.85, 0.8), (B(1.5), 76, 0.25, 0.75), (B(1.75), 74, 0.25, 0.75), (B(2), 74, 0.85, 0.8), (B(3.5), 71, 0.45, 0.75),
               (B(4), 74, 0.55, 0.85), (B(5), 76, 0.3, 0.85), (B(5.5), 78, 0.45, 0.9)]
    for b in range(6):
        ac.add(S.kick(0.5, 0.9, 44), B(b), 0.75)
        if b % 2 == 1:
            ac.add(S.clap(0.35), B(b), 0.55)
            ac.add(SN[b % len(SN)], B(b), 0.35)
        for q in (0.25, 0.5, 0.75):
            ac.add(S.hat(0.02), B(b + q), 0.12 if q == 0.5 else 0.06, 0.3)
    ac.add(GIANT[0], B(0), 0.7); ac.add(GIANT[1], B(4), 0.55)
    for j, b in enumerate(grid(5.5, 6)):
        ac.add(TEN[j % len(TEN)], B(b), 0.4 + 0.08 * j)
    pulse = sweep(fit(render(pulse_p, n["pulse"], DUR)), [(0, 300), (B(-3), 300), (B(0) - 0.05, 6000), (B(0), 1800), (B(6), 3000), (DUR, 3000)], res=0.25)
    pulse = fx(pulse, pb.Delay(delay_seconds=0.45, feedback=0.25, mix=0.15), pb.Reverb(room_size=0.7, wet_level=0.2))
    roll = fx(fit(render(bass_p, roll_n, DUR)), pb.Compressor(threshold_db=-14, ratio=3))
    chordp = fx(fit(render(keys_p, chord_n, DUR)), pb.Chorus(rate_hz=0.4, depth=0.2, mix=0.25), pb.Reverb(room_size=0.85, wet_level=0.32))
    sing = fx(fit(render(sing_p, sing_n, DUR)), pb.Delay(delay_seconds=0.3, feedback=0.25, mix=0.16), pb.Reverb(room_size=0.9, wet_level=0.35, dry_level=0.85))
    pad = fx(fit(render(pad_p, n["pad"], DUR)), pb.Chorus(rate_hz=0.3, depth=0.3, mix=0.35), pb.Reverb(room_size=0.92, wet_level=0.35, dry_level=0.75))
    bass = fit(render(bass_p, n["bass"], DUR))
    mixdown([(pulse, 1.3, 0.25), (pad, 0.32, 0.5), (bass, 1.0, 0.0), (roll, 1.0, 0.6), (chordp, 0.55, 0.3), (sing, 0.55, 0.0)], ac, imp, sfx, "C_emotive",
            side=[B(b) for b in range(6)])


# ================= D. minimal tech: sparse motif, low throb, ticks, space =================
def sketch_D():
    n, ac, imp, sfx = common()
    motif_n, throb_n, drone_n = [], [], []
    def f(b0, nb, c, root, tones):
        for k, b in enumerate(grid(b0, b0 + nb, 0.5)):
            throb_n.append((B(b), root + 12, 0.28, 0.85 if k % 2 == 0 else 0.6))
        drone_n.extend((B(b0) - 0.02, m, 0.6 * nb, 0.6) for m in (root + 24, tones[2] - 12 if tones[2] - 12 > root + 24 else tones[2]))
    chords(f)
    mot = [(0, 74), (0.75, 69), (1.5, 71), (2, 74), (2.75, 67), (3.5, 71), (4, 74), (4.5, 76), (5, 73), (5.5, 76)]
    motif_n += [(B(b), m, 0.5, 0.75) for b, m in mot] + [(B(b), m + 12, 0.5, 0.4) for b, m in mot[::2]]
    for b in (0, 2, 4):
        ac.add(CBD[b % len(CBD)], B(b), 0.6)
        ac.add(S.kick(0.6, 0.8, 40), B(b), 0.5)
    for b in grid(0, 6):
        ac.add(S.blip(5200, 0.008, 0.95, 300), B(b), 0.08 if int(b * 4) % 4 else 0.14, 0.4)
    for b in (1, 3, 5):
        ac.add(S.clap(0.2), B(b), 0.25)
    ac.add(SCR[-int(1.2 * SR):], B(6) - 1.2, 0.45)
    pulse = sweep(fit(render(pulse_p, n["pulse"], DUR)), [(0, 300), (B(-3), 300), (B(0) - 0.05, 6000), (DUR, 6000)], res=0.3)
    motif = fx(fit(render(pluck_p, motif_n, DUR)), pb.Delay(delay_seconds=0.45, feedback=0.35, mix=0.25), pb.Reverb(room_size=0.9, wet_level=0.38, dry_level=0.85))
    throb = sweep(fit(render(bass_p, throb_n, DUR)), [(0, 200), (B(0), 200), (B(6), 900), (DUR, 900)], res=0.4)
    drone = fx(fit(render(pad_p, drone_n, DUR)), pb.Reverb(room_size=0.95, wet_level=0.45, dry_level=0.6))
    pad = fx(fit(render(pad_p, n["pad"], DUR)), pb.Reverb(room_size=0.9, wet_level=0.3))
    bass = fit(render(bass_p, n["bass"], DUR))
    mixdown([(pulse, 1.6, 0.0), (pad, 0.3, 0.0), (bass, 1.0, 0.0), (motif, 0.9, 0.0), (throb, 1.4, 0.0), (drone, 0.3, 0.0)], ac, imp, sfx, "D_minimal")


sub_p = make(a_osc_1_type="Sine", a_osc_2_mute=False, a_osc_2_type="Classic", a_osc_2_volume=-18, a_filter_1_type="LP 24 dB", a_filter_1_cutoff=180.0,
             a_amp_eg_attack=0.01, a_amp_eg_decay=1.0, a_amp_eg_sustain=90.0, a_amp_eg_release=0.15)
line_p = make(a_osc_1_type="Classic", a_osc_1_unison_voices=7, a_osc_1_unison_detune=14, a_filter_1_type="LP 12 dB", a_filter_1_cutoff=2200.0,
              a_amp_eg_attack=0.25, a_amp_eg_decay=1.0, a_amp_eg_sustain=100.0, a_amp_eg_release=0.4)
arpbass_p = make(a_play_mode="Mono", a_osc_1_type="Classic", a_osc_1_unison_voices=2, a_osc_1_unison_detune=8, a_filter_1_type="LP 24 dB",
                 a_filter_1_cutoff=600.0, a_filter_1_resonance=45.0, a_filter_1_feg_mod_amount=30, a_filter_eg_decay=0.1, a_filter_eg_sustain=0.0,
                 a_amp_eg_attack=0.0, a_amp_eg_decay=0.14, a_amp_eg_sustain=30.0, a_amp_eg_release=0.05)
retro_lead_p = make(a_play_mode="Mono (Fingered Portamento)", a_portamento=0.06, a_osc_1_type="Classic", a_osc_1_shape=-100.0, a_osc_1_unison_voices=2,
                    a_osc_1_unison_detune=12, a_filter_1_type="LP 24 dB", a_filter_1_cutoff=2800.0, a_filter_1_resonance=20.0,
                    a_amp_eg_attack=0.01, a_amp_eg_decay=0.3, a_amp_eg_sustain=80.0, a_amp_eg_release=0.2)
keys_p = make(a_osc_1_type="FM2", a_filter_1_type="LP 12 dB", a_filter_1_cutoff=3500.0,
              a_amp_eg_attack=0.0, a_amp_eg_decay=0.6, a_amp_eg_sustain=15.0, a_amp_eg_release=0.4)
sing_p = make(a_play_mode="Mono (Fingered Portamento)", a_portamento=0.08, a_osc_1_type="Classic", a_osc_1_shape=-30.0, a_osc_1_unison_voices=3,
              a_osc_1_unison_detune=7, a_filter_1_type="LP 24 dB", a_filter_1_cutoff=2400.0, a_filter_1_resonance=10.0,
              a_amp_eg_attack=0.04, a_amp_eg_decay=0.5, a_amp_eg_sustain=85.0, a_amp_eg_release=0.3)

for k in (sys.argv[1:] or "ABCD"):
    {"A": sketch_A, "B": sketch_B, "C": sketch_C, "D": sketch_D}[k]()
