"""Score + sound design for the Lexis ad, synthesised to the film's frame grid.

Grid: 100 BPM, beat = 36 frames @60fps, beat 0 = frame 159 (Saturn V).
Real recordings (CC0 / public domain) are layered for keys, relays, typewriter, teletype and the Saturn V roar.
"""
import subprocess
import numpy as np

SR = 48000
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(7)


def fr(f):
    return f / 60.0


def beat(b):
    return fr(159) + 0.6 * b


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def load(path, gain=1.0):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64) * gain


class Bus:
    def __init__(self):
        self.x = np.zeros((N + SR * 4, 2))

    def add(self, sig, t, gain=1.0, pan=0.0):
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
        i = int(round(t * SR))
        if i < 0:
            sig, i = sig[-i:], 0
        n = min(len(sig), len(self.x) - i)
        if n > 0:
            self.x[i:i + n] += sig[:n] * gain


def tvec(d):
    return np.arange(int(d * SR)) / SR


# ---------- instruments ----------
def pluck(f, d=0.5, bright=1.0):
    t = tvec(d)
    s = np.zeros_like(t)
    for k in range(1, 24):
        if f * k > 16000:
            break
        s += np.sin(2 * np.pi * f * k * t + k * 0.7) / k * np.exp(-t * (3.0 + 2.2 * k / bright))
    a = np.minimum(1, t / 0.002)
    return s * a * 0.5


def pad(freqs, d, attack=0.3, release=0.8, bright=0.5, open_t=None):
    t = tvec(d)
    out = np.zeros((len(t), 2))
    for fi, f in enumerate(freqs):
        for det, pan in ((-0.07, -0.6), (0.0, 0.0), (0.07, 0.6)):
            ff = f * 2 ** (det / 12)
            s = np.zeros_like(t)
            for k in range(1, 18):
                if ff * k > 12000:
                    break
                cut = bright if open_t is None else bright * (0.35 + 0.65 * np.minimum(1, t / open_t))
                s += np.sin(2 * np.pi * ff * k * t + rng.uniform(0, 6.28)) / k * np.exp(-k / (6 * cut + 0.01))
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            out[:, 0] += s * l
            out[:, 1] += s * r
    env = np.minimum(1, t / attack) * np.minimum(1, np.maximum(0, (d - t) / release))
    return out * env[:, None] / (len(freqs) * 3)


def kick(d=0.45, punch=1.0):
    t = tvec(d)
    f = 54 + 120 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 9) * punch
    s += rng.standard_normal(len(t)) * np.exp(-t * 400) * 0.25
    return np.tanh(s * 1.6) * 0.8


def hat(d=0.06, open_=False):
    t = tvec(0.25 if open_ else d)
    n = rng.standard_normal(len(t))
    n = np.diff(np.concatenate([[0], n]))
    n = np.diff(np.concatenate([[0], n]))
    return n * np.exp(-t * (14 if open_ else 90)) * 0.12


def snare(d=0.3):
    t = tvec(d)
    n = rng.standard_normal(len(t))
    n = n - np.convolve(n, np.ones(9) / 9, "same")
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return (n * np.exp(-t * 18) * 0.5 + tone * 0.5) * 0.6


def sub(f, d, decay=1.5):
    t = tvec(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * decay) * np.minimum(1, t / 0.005) * np.minimum(1, (d - t) / 0.05)


def blip(f, d=0.05, shape=0.4):
    t = tvec(d)
    s = np.sign(np.sin(2 * np.pi * f * t)) * shape + np.sin(2 * np.pi * f * t) * (1 - shape)
    return s * np.exp(-t * 50) * np.minimum(1, t / 0.001) * 0.3


def chirp(d=0.09, f0=1800, steps=7):
    seg = d / steps
    return np.concatenate([blip(f0 * 2 ** (k * 3 / 12), seg, 0.7) * (0.6 + 0.4 * k / steps) for k in range(steps)])


def noise_swell(d, lo=0.0, hi=1.0, bright_end=1.0, curve=3.0):
    t = tvec(d)
    n = rng.standard_normal((len(t), 2))
    k = np.ones(18) / 18
    lp = np.stack([np.convolve(n[:, c], k, "same") for c in range(2)], 1) * 3.0
    hp = n - lp / 3.0
    u = (t / d)[:, None]
    mixed = lp * (1 - u * bright_end) + hp * u * bright_end
    return mixed * (lo + (hi - lo) * u ** curve)


def glide(f0, f1, d, amp=0.2):
    t = tvec(d)
    f = f0 * (f1 / f0) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.3 * np.sin(2 * ph)) * amp * (t / d) ** 2


def boomx(*a, **k):
    return boom(*a, **k) * 0.45


def boom(d=1.2):
    t = tvec(d)
    f = 34 + 70 * np.exp(-t * 7)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    n = rng.standard_normal(len(t)) * np.exp(-t * 9) * 0.3
    return np.tanh((s + n) * 2.0) * 0.7


def hp(x, fc, order=4):
    nf = 1 << (len(x) - 1).bit_length()
    f = np.fft.rfftfreq(nf, 1 / SR)
    g = 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * order))
    return np.stack([np.fft.irfft(np.fft.rfft(x[:, c], nf) * g, nf)[:len(x)] for c in range(2)], 1)


def lp(x, fc, order=2):
    nf = 1 << (len(x) - 1).bit_length()
    f = np.fft.rfftfreq(nf, 1 / SR)
    g = 1 / np.sqrt(1 + (f / fc) ** (2 * order))
    return np.stack([np.fft.irfft(np.fft.rfft(x[:, c], nf) * g, nf)[:len(x)] for c in range(2)], 1)


def reverb(x, rt=1.6, wet=0.3, pre=0.012, tone=60):
    L = int(SR * rt)
    t = np.arange(L) / SR
    ir = rng.standard_normal((L, 2)) * np.exp(-t * 6.9 / rt)[:, None]
    k = np.ones(tone) / tone
    ir = np.stack([np.convolve(ir[:, c], k, "same") for c in range(2)], 1)
    ir = np.concatenate([np.zeros((int(pre * SR), 2)), ir])
    ir /= np.sqrt((ir ** 2).sum(0))
    n = len(x) + len(ir)
    nf = 1 << (n - 1).bit_length()
    y = np.stack([np.fft.irfft(np.fft.rfft(x[:, c], nf) * np.fft.rfft(ir[:, c], nf), nf)[:len(x)] for c in range(2)], 1)
    return x + y * wet


def slices(path, n_max=40, gain=1.0, length=0.14):
    """cut individual keystrokes out of a recording by onset."""
    x = load(path)
    m = np.abs(x).mean(1)
    env = np.convolve(m, np.ones(96) / 96, "same")
    thr = np.percentile(env, 92)
    hits, i = [], 0
    while i < len(env) and len(hits) < n_max:
        if env[i] > thr:
            s = max(0, i - 120)
            seg = x[s:s + int(length * SR)].copy()
            fade = np.minimum(1, (len(seg) - np.arange(len(seg))) / (0.03 * SR))[:, None]
            hits.append(seg * fade * gain / (np.abs(seg).max() + 1e-9))
            i += int(0.12 * SR)
        else:
            i += 1
    return hits


# ---------- JS-compatible hash (film timing) ----------
def jhash(a, b=0):
    def imul(x, y):
        return ((x & 0xFFFFFFFF) * (y & 0xFFFFFFFF)) & 0xFFFFFFFF
    h = (imul(a, 374761393) + imul(b, 668265263)) & 0xFFFFFFFF
    h = imul(h ^ (h >> 13), 1274126177)
    h ^= h >> 16
    return h / 4294967296


ASKS = [
    dict(a=520, q="unpack this archive", type=1.3, press=551, morph=556),
    dict(a=598, q="what's on port 3000", type=0.9, press=622, morph=627),
    dict(a=650, q="undo my last commit", type=1.0, press=675, morph=681),
]

# ---------- build ----------
music, drums, fx, keys, low = Bus(), Bus(), Bus(), Bus(), Bus()

# 0. power-on
low.add(sub(55, 0.6, 5) * 0.35, 0.0)
relay = load("sfx/relay.mp3")
rot = load("sfx/rotary_relay.mp3")
for f in (0, 17):
    fx.add(relay, fr(f), 0.5)
fx.add(noise_swell(fr(30) - fr(20), 0.0, 0.5, 1.0, 2.5), fr(20), 0.5)
fx.add(boomx(1.4), fr(30), 0.55)
fx.add(rot[int(0.1 * SR):int(0.35 * SR)], fr(30), 0.5)

# 1. acceleration: cut hits climb the scale, a ticker speeds up, a riser lands on the Saturn downbeat
cuts = [30, 60, 82, 100, 116, 130, 142]
ladder = [74, 76, 78, 81, 83, 86, 88]
for f, m in zip(cuts, ladder):
    fx.add(blip(midi(m), 0.09, 0.3) * 1.2, fr(f), 0.6, pan=0.25 * ((f // 10) % 3 - 1))
    fx.add(relay, fr(f), 0.55)
    drums.add(kick(0.2, 0.6), fr(f), 0.45)
t, k = 0.55, 0
while t < beat(0) - 0.03:
    gap = 0.22 * (1 - (t - 0.55) / (beat(0) - 0.55)) ** 1.6 + 0.035
    drums.add(hat(0.03), t, 0.9 if k % 2 == 0 else 0.55, pan=0.3 if k % 2 else -0.3)
    t += gap
    k += 1
fx.add(noise_swell(beat(0) - 0.5, 0.0, 0.55, 1.0, 3.2), 0.5, 0.6)
fx.add(glide(midi(38), midi(62), beat(0) - 0.7, 0.18), 0.7, 0.7)
music.add(pad([midi(50), midi(57), midi(62)], beat(0) - 0.45, attack=1.4, release=0.05, bright=0.25, open_t=2.0), 0.45, 0.55)

# 2. main groove: beats 0..6
CH = {
    "D": [50, 57, 61, 64, 66], "Bm": [47, 54, 57, 62, 64], "G": [43, 50, 54, 59, 61],
    "A": [45, 52, 54, 59, 61], "Em": [40, 47, 50, 54, 55], "D/F#": [42, 50, 57, 61, 64],
}
prog = [(0, "D"), (2, "Bm"), (4, "G")]
roar = load("sfx/saturn_roar.wav")
fx.add(roar[:int(2.2 * SR)] * np.linspace(1, 0, int(2.2 * SR))[:, None] ** 1.5, beat(0), 0.75)
fx.add(boomx(2.0), beat(0), 0.8)
fx.add(noise_swell(0.9, 0.5, 0.0, 1.0, 0.4)[::-1] * 0 + 0, beat(0))
for b0, ch in prog:
    notes = CH[ch]
    music.add(pad([midi(m) for m in notes[1:]], 1.25, attack=0.04, release=0.3, bright=0.6), beat(b0), 0.5)
    low.add(sub(midi(notes[0] - 12), 1.2, 0.6) * 0.5, beat(b0), 0.8)
    arp = [notes[1], notes[2], notes[3], notes[4], notes[3] + 12, notes[4] + 12, notes[2] + 12, notes[3] + 12]
    for s in range(8):
        tt = beat(b0) + s * 0.15
        music.add(pluck(midi(arp[s] + 12), 0.4, 1.3), tt, 0.32 if s % 2 == 0 else 0.22, pan=(-0.35, 0.35)[s % 2])
for b in range(0, 6):
    drums.add(kick(0.45), beat(b), 0.95)
    drums.add(hat(0.05), beat(b) + 0.3, 0.8, pan=0.2)
    drums.add(hat(0.03), beat(b) + 0.15, 0.35, pan=-0.3)
    drums.add(hat(0.03), beat(b) + 0.45, 0.35, pan=-0.3)
    if b % 2 == 1:
        drums.add(snare(), beat(b), 0.55)
for f in (196, 232, 268, 304, 340):
    fx.add(chirp(0.08, 1500), fr(f), 0.35, pan=-0.5)
for f in range(233, 300, 3):
    fx.add(blip(3200, 0.012, 0.9), fr(f), 0.12, pan=0.6)
for f in range(305, 362, 2):
    fx.add(blip(3600, 0.01, 0.9), fr(f), 0.1, pan=0.6)
fx.add(noise_swell(0.55, 0.0, 0.45, 1.0, 2.2), fr(327) - 0.45, 0.6)
fx.add(noise_swell(0.5, 0.0, 0.5, 1.0, 2.0), beat(6) - 0.5, 0.5)

# 3. punchline: the music drops out
drone = pad([midi(38), midi(45), midi(51)], fr(483) - beat(6), attack=0.02, release=0.08, bright=0.15)
music.add(drone, beat(6), 0.55)
low.add(sub(midi(26), fr(483) - beat(6), 0.3) * 0.5, beat(6))
tw_hits = slices("sfx/typewriter.mp3", 12, 0.9, 0.18)
for n, f in enumerate((381, 386, 391, 396, 401)):
    keys.add(tw_hits[n % len(tw_hits)], fr(f), 0.7, )
    fx.add(blip(midi(81 + n), 0.05, 0.6), fr(f), 0.25, pan=0.4)
fx.add(boomx(1.2), fr(411), 1.0)
fx.add(kick(0.5, 1.4), fr(411), 1.0)
crack = rng.standard_normal(int(0.35 * SR)) * np.exp(-tvec(0.35) * 14)
fx.add(crack, fr(411), 0.35)
for k, m in enumerate((86, 87, 92)):
    fx.add(np.sign(np.sin(2 * np.pi * midi(m) * tvec(0.12))) * 0.12 * np.exp(-tvec(0.12) * 8), fr(411) + 0.02 * k, 0.5)
tele = load("sfx/teletype.mp3")
seg_ = tele[int(2 * SR):int(2 * SR) + int((fr(465) - fr(413)) * SR)]
fx.add(seg_ * np.linspace(0.5, 1.0, len(seg_))[:, None], fr(413), 2.2)
kb = load("sfx/kb_blue.mp3")
seg_ = kb[int(5 * SR):int(5 * SR) + int((fr(465) - fr(415)) * SR)]
keys.add(seg_ * np.linspace(0.4, 1.0, len(seg_))[:, None] ** 0.5, fr(415), 2.4)
cl = [midi(m) for m in (62, 63, 68, 69, 74, 75)]
music.add(pad(cl, fr(470) - fr(413), attack=0.6, release=0.02, bright=0.8), fr(413), 0.35)
suck = noise_swell(fr(483) - fr(462), 0.0, 1.0, 1.0, 2.6)
fx.add(suck, fr(462), 0.55)
fx.add(glide(midi(40), midi(76), fr(483) - fr(462), 0.25), fr(462), 0.8)

# 4. silence, one blip, then the flood and the Lexis world
fx.add(blip(midi(86), 0.08, 0.2), fr(497), 0.35)
fx.add(noise_swell(fr(519) - fr(505), 0.0, 0.35, 0.6, 2.0), fr(505), 0.6)
LX = [(10, "G", 2), (12, "D/F#", 2), (14, "Em", 1.5), (15.5, "A", 2.95)]
for b0, ch, nb in LX:
    notes = CH[ch]
    music.add(pad([midi(m) for m in notes[1:]] + [midi(notes[2] + 12)], 0.6 * nb + 0.4, attack=0.06 if b0 > 10 else 0.02, release=0.45, bright=0.7), beat(b0), 0.5)
    low.add(sub(midi(notes[0] - 12), 0.6 * nb, 0.5) * 0.5, beat(b0), 0.85)
for b in range(10, 18):
    drums.add(kick(0.4, 0.8), beat(b), 0.7)
    drums.add(hat(0.04), beat(b) + 0.3, 0.6, pan=0.2)
    if b % 2 == 1:
        drums.add(snare(0.25), beat(b), 0.35)
fx.add(boomx(1.5), beat(10), 0.45)

# typing, Return, morph sparkle
key_hits = slices("sfx/kb_slow.mp3", 30, 1.0, 0.12)
enter = load("sfx/enter.mp3")
for n, ask in enumerate(ASKS):
    for i, c in enumerate(ask["q"]):
        tt = round(ask["a"] + 2 + i * ask["type"] + (jhash(i, n) - 0.5) * ask["type"] * 0.7)
        h = key_hits[(i * 7 + n * 3) % len(key_hits)]
        keys.add(h, fr(tt), 0.55 if c != " " else 0.75, pan=0.1)
    keys.add(enter / (np.abs(enter).max() + 1e-9), fr(ask["press"]), 0.9)
    drums.add(kick(0.25, 0.5), fr(ask["press"]), 0.35)
    chord = CH[["G", "D/F#", "A"][n]]
    for s, m in enumerate([chord[1], chord[2], chord[3], chord[4], chord[2] + 12, chord[3] + 12]):
        music.add(pluck(midi(m + 12), 0.5, 1.6), fr(ask["morph"]) + s * 0.035, 0.26, pan=-0.5 + s * 0.2)
    fx.add(noise_swell(0.25, 0.3, 0.0, 1.0, 1.0), fr(ask["morph"]), 0.18)

# headline: cells rearranging (pixel rain), then the logo lands
for k in range(70):
    tt = fr(699) + (k / 70) ** 0.8 * 0.75 + rng.uniform(0, 0.02)
    fx.add(blip(2400 + 1800 * rng.random(), 0.01, 0.9), tt, 0.09, pan=rng.uniform(-0.8, 0.8))
for k in range(10):
    keys.add(key_hits[(k * 5) % len(key_hits)], fr(776 + k * 0.9), 0.32, pan=0.3 - k * 0.04)
for k in range(7):
    keys.add(key_hits[(k * 3 + 1) % len(key_hits)], fr(786 + k * 0.85), 0.32, pan=0.1 - k * 0.04)
fx.add(glide(midi(76), midi(64), fr(793) - fr(776), 0.06), fr(776), 0.5)
fx.add(noise_swell(fr(820) - fr(790), 0.0, 0.4, 1.0, 2.4), fr(790), 0.5)
for k in range(26):
    tt = fr(801) + (k / 26) * (fr(820) - fr(801))
    fx.add(blip(1400 + 90 * k, 0.014, 0.8), tt, 0.16, pan=-0.6 + 1.2 * k / 26)
    keys.add(key_hits[k % len(key_hits)], tt, 0.18, pan=-0.6 + 1.2 * k / 26)
LAND = fr(820)
final = [midi(m) for m in (50, 57, 61, 64, 66, 69, 73)]
music.add(pad(final, DUR - LAND + 0.2, attack=0.01, release=1.0, bright=0.75), LAND, 0.8)
low.add(sub(midi(38), DUR - LAND, 0.9) * 0.6, LAND, 1.0)
drums.add(kick(0.6, 1.2), LAND, 1.0)
fx.add(boomx(1.8), LAND, 0.5)
for s, m in enumerate((74, 78, 81, 85, 86)):
    music.add(pluck(midi(m + 12), 1.4, 2.0), LAND + s * 0.05, 0.3, pan=-0.4 + s * 0.2)
fx.add(blip(midi(98), 0.2, 0.0) * 0.8, LAND, 0.4)

# ---------- mix ----------

mus = reverb(hp(music.x, 140), 2.2, 0.35)
dr = reverb(drums.x, 0.9, 0.12, tone=30)
fxb = reverb(fx.x, 1.4, 0.22)
ky = reverb(keys.x, 0.5, 0.1, tone=20)
# duck the music under the slam and the silence
duck = np.ones(len(mus))
def zone(a, b, v, ramp=0.02):
    i, j, r = int(a * SR), int(b * SR), int(ramp * SR)
    duck[i:j] = np.minimum(duck[i:j], v)
    duck[max(0, i - r):i] = np.minimum(duck[max(0, i - r):i], np.linspace(1, v, len(duck[max(0, i - r):i])))
zone(fr(483), fr(507), 0.0, 0.005)
mixd = mus * 1.25 + dr * 0.8 + fxb * 0.9 + ky * 1.4 + low.x * 0.28
mixd = hp(mixd, 28, 6)
mixd *= duck[:, None]
mixd = mixd[:N]
fade = np.ones(N)
fade[-int(0.35 * SR):] = np.linspace(1, 0, int(0.35 * SR)) ** 2
mixd *= fade[:, None]
mixd /= np.abs(mixd).max() + 1e-9
mixd *= 0.9
mixd.astype(np.float32).tofile("/tmp/lx/mix.f32")
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "/tmp/lx/mix.f32",
                       "-af", "acompressor=threshold=-14dB:ratio=3:attack=5:release=120:makeup=2,alimiter=limit=0.89:attack=2:release=40,loudnorm=I=-14:TP=-1.0:LRA=9",
                       "-ar", "48000", "../film/assets/score.wav"])
print("wrote score.wav")
