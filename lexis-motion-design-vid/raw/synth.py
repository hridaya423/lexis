"""Instruments for the Lexis score (numpy only, 48 kHz stereo)."""
import subprocess
import numpy as np

SR = 48000
rng = np.random.default_rng(11)


def tv(d):
    return np.arange(int(d * SR)) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def load(path, gain=1.0):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64) * gain


def st(x, pan=0.0):
    if x.ndim == 2:
        return x
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l * 1.414, x * r * 1.414], 1)


class Bus:
    def __init__(self, n):
        self.x = np.zeros((n, 2))

    def add(self, sig, t, gain=1.0, pan=0.0):
        sig = st(sig, pan)
        i = int(round(t * SR))
        if i < 0:
            sig, i = sig[-i:], 0
        n = min(len(sig), len(self.x) - i)
        if n > 0:
            self.x[i:i + n] += sig[:n] * gain


def env(d, a=0.005, r=0.05, hold=None):
    t = tv(d)
    e = np.minimum(1, t / max(a, 1e-4)) * np.minimum(1, np.maximum(0, (d - t) / max(r, 1e-4)))
    return e


def additive(f, d, bright, nh=28, phase_seed=0, saw=True):
    """bright: array or float, ~harmonic count where rolloff starts."""
    t = tv(d)
    s = np.zeros_like(t)
    b = np.broadcast_to(np.asarray(bright, dtype=float), t.shape)
    r = np.random.default_rng(phase_seed)
    for k in range(1, nh + 1):
        if f * k > 18000:
            break
        if not saw and k % 2 == 0:
            continue
        s += np.sin(2 * np.pi * f * k * t + r.uniform(0, 6.28)) / k * np.exp(-k / (b + 0.01))
    return s


def supersaw(freqs, d, bright=6.0, voices=5, detune=0.12, attack=0.02, release=0.3, seed=0):
    t = tv(d)
    out = np.zeros((len(t), 2))
    for fi, f in enumerate(freqs):
        for v in range(voices):
            dt = (v - (voices - 1) / 2) / ((voices - 1) / 2 or 1) * detune
            pan = (v - (voices - 1) / 2) / ((voices - 1) / 2 or 1) * 0.8
            s = additive(f * 2 ** (dt / 12), d, bright, 22, seed + fi * 13 + v)
            out += st(s, pan)
    return out * env(d, attack, release)[:, None] / (len(freqs) * voices) * 1.6


def pluck(f, d=0.45, bright=1.4, decay=3.0):
    t = tv(d)
    s = np.zeros_like(t)
    for k in range(1, 26):
        if f * k > 16000:
            break
        s += np.sin(2 * np.pi * f * k * t + k * 0.7) / k * np.exp(-t * (decay + 2.4 * k / bright))
    return s * np.minimum(1, t / 0.0015) * 0.5


def bell(f, d=1.6):
    t = tv(d)
    s = np.zeros_like(t)
    for ratio, amp, dec in ((1, 1, 2.2), (2.76, 0.5, 3.5), (5.4, 0.25, 5), (8.93, 0.12, 7), (2.0, 0.3, 2.8)):
        s += np.sin(2 * np.pi * f * ratio * t) * amp * np.exp(-t * dec)
    return s * np.minimum(1, t / 0.001) * 0.35


def piano(f, d=1.2):
    t = tv(d)
    s = np.zeros_like(t)
    for k in range(1, 14):
        inh = 1 + 0.0004 * k * k
        s += np.sin(2 * np.pi * f * k * inh * t) / (k ** 1.2) * np.exp(-t * (1.2 + 0.9 * k))
    return s * np.minimum(1, t / 0.002) * 0.45


def kick(d=0.5, punch=1.0, tune=50):
    t = tv(d)
    f = tune + 150 * np.exp(-t * 32) + 30 * np.exp(-t * 8)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    click = rng.standard_normal(len(t)) * np.exp(-t * 600) * 0.35
    return np.tanh((body + click) * 1.8 * punch) * 0.85


def clap(d=0.35):
    t = tv(d)
    n = rng.standard_normal(len(t))
    bp = n - np.convolve(n, np.ones(6) / 6, "same")
    bp = np.convolve(bp, np.ones(3) / 3, "same")
    e = np.zeros_like(t)
    for k, off in enumerate((0, 0.009, 0.019, 0.03)):
        e += (t >= off) * np.exp(-(t - off).clip(0) * (90 if k < 3 else 16))
    return bp * e * 0.55


def hat(d=0.05, open_=False):
    t = tv(0.3 if open_ else d)
    n = rng.standard_normal(len(t))
    n = np.diff(np.concatenate([[0], np.diff(np.concatenate([[0], n]))]))
    return n * np.exp(-t * (12 if open_ else 85)) * 0.08


def tom(f=90, d=0.6):
    t = tv(d)
    ff = f * (1 + 0.6 * np.exp(-t * 18))
    s = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 6)
    s += rng.standard_normal(len(t)) * np.exp(-t * 60) * 0.2
    return np.tanh(s * 1.5) * 0.7


def taiko(d=1.2):
    t = tv(d)
    ff = 62 * (1 + 0.8 * np.exp(-t * 14))
    s = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 3.2)
    n = rng.standard_normal(len(t))
    n = np.convolve(n, np.ones(30) / 30, "same") * np.exp(-t * 18) * 2.5
    return np.tanh((s + n) * 1.7) * 0.8


def crash(d=2.2):
    t = tv(d)
    n = rng.standard_normal((len(t), 2))
    n = n - np.stack([np.convolve(n[:, c], np.ones(4) / 4, "same") for c in range(2)], 1)
    return n * (np.exp(-t * 2.0) * 0.9 + np.exp(-t * 30) * 0.6)[:, None] * 0.25


def sub(f, d, decay=0.8, attack=0.004):
    t = tv(d)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * decay) * env(d, attack, 0.06)


def subdrop(d=1.2, f0=90, f1=32):
    t = tv(d)
    f = f1 + (f0 - f1) * np.exp(-t * 3.5)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6) * env(d, 0.002, 0.2)


def noise_riser(d, amp=1.0, curve=2.6, lo_cut=24, hi_end=1.0):
    t = tv(d)
    n = rng.standard_normal((len(t), 2))
    k = np.ones(lo_cut) / lo_cut
    lpn = np.stack([np.convolve(n[:, c], k, "same") for c in range(2)], 1) * 3
    u = (t / d)[:, None]
    mixd = lpn * (1 - u * hi_end) + (n - lpn / 3) * u * hi_end
    return mixd * u ** curve * amp


def reverse_swell(d):
    x = noise_riser(d, 1.0, 3.5)
    return x


def tone_riser(f0, f1, d, amp=0.2):
    t = tv(d)
    f = f0 * (f1 / f0) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * amp * (t / d) ** 2


def shepard(d, base=110, amp=0.15):
    t = tv(d)
    out = np.zeros_like(t)
    for o in range(6):
        pos = (o + t / d * 1.0) % 6
        f = base * 2 ** pos
        g = np.exp(-((pos - 3) / 1.5) ** 2)
        out += np.sin(2 * np.pi * np.cumsum(f) / SR) * g
    return out * amp * (t / d) ** 1.5


def blip(f, d=0.05, shape=0.4, decay=50):
    t = tv(d)
    s = np.sign(np.sin(2 * np.pi * f * t)) * shape + np.sin(2 * np.pi * f * t) * (1 - shape)
    return s * np.exp(-t * decay) * np.minimum(1, t / 0.001) * 0.3


def projector(d, rate=24):
    """film projector clatter: shutter clicks at `rate` Hz over a motor hum."""
    t = tv(d)
    out = np.zeros_like(t)
    for k in np.arange(0, d, 1 / rate):
        i = int(k * SR)
        c = rng.standard_normal(240) * np.exp(-np.arange(240) / 25)
        out[i:i + 240] += c[:max(0, min(240, len(out) - i))]
    hum = np.sin(2 * np.pi * 60 * t) * 0.08 + np.sin(2 * np.pi * 120 * t) * 0.05
    return (out * 0.35 + hum) * env(d, 0.03, 0.05)


def crt_off(d=0.35):
    """flyback whine falling, a thunk and a crackle."""
    t = tv(d)
    f = 15200 * np.exp(-t * 6) + 400
    whine = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * 0.15
    thunk = np.sin(2 * np.pi * np.cumsum(70 + 80 * np.exp(-t * 30)) / SR) * np.exp(-t * 14) * 0.8
    crack = rng.standard_normal(len(t)) * (rng.random(len(t)) < 0.004) * np.exp(-t * 6) * 0.7
    return whine + thunk + crack


def crt_on(d=0.4):
    t = tv(d)
    f = 400 + 14800 * (1 - np.exp(-t * 12))
    whine = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - np.exp(-t * 20)) * np.exp(-t * 4) * 0.08
    thump = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 10) * 0.5
    return whine + thump


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


def shelf(x, fc, gain_db):
    nf = 1 << (len(x) - 1).bit_length()
    f = np.fft.rfftfreq(nf, 1 / SR)
    g = 1 + (10 ** (gain_db / 20) - 1) / (1 + (fc / np.maximum(f, 1e-3)) ** 2)
    return np.stack([np.fft.irfft(np.fft.rfft(x[:, c], nf) * g, nf)[:len(x)] for c in range(2)], 1)


def reverb(x, rt=1.8, wet=0.3, pre=0.015, tone=40, width=1.0):
    L = int(SR * rt)
    t = np.arange(L) / SR
    ir = rng.standard_normal((L, 2)) * np.exp(-t * 6.9 / rt)[:, None]
    k = np.ones(tone) / tone
    ir = np.stack([np.convolve(ir[:, c], k, "same") for c in range(2)], 1)
    m = ir.mean(1, keepdims=True)
    ir = m + (ir - m) * width
    ir = np.concatenate([np.zeros((int(pre * SR), 2)), ir])
    ir /= np.sqrt((ir ** 2).sum(0))
    n = len(x) + len(ir)
    nf = 1 << (n - 1).bit_length()
    y = np.stack([np.fft.irfft(np.fft.rfft(x[:, c], nf) * np.fft.rfft(ir[:, c], nf), nf)[:len(x)] for c in range(2)], 1)
    return x + y * wet


def sidechain(x, hits, depth=0.6, rel=0.22):
    """duck x after each hit time (seconds)."""
    g = np.ones(len(x))
    t = np.arange(len(x)) / SR
    for h in hits:
        i = int(h * SR)
        if i >= len(x):
            continue
        tt = t[i:i + int(rel * 2.5 * SR)] - h
        g[i:i + len(tt)] = np.minimum(g[i:i + len(tt)], 1 - depth * np.exp(-tt / rel * 2.2) * (1 - np.exp(-tt / 0.004)))
    return x * g[:, None]


def saturate(x, drive=1.4):
    return np.tanh(x * drive) / np.tanh(drive)


def slices(path, n_max=40, length=0.14):
    x = load(path)
    m = np.abs(x).mean(1)
    e = np.convolve(m, np.ones(96) / 96, "same")
    thr = np.percentile(e, 92)
    hits, i = [], 0
    while i < len(e) and len(hits) < n_max:
        if e[i] > thr:
            s = max(0, i - 120)
            seg = x[s:s + int(length * SR)].copy()
            fade = np.minimum(1, (len(seg) - np.arange(len(seg))) / (0.03 * SR))[:, None]
            hits.append(seg * fade / (np.abs(seg).max() + 1e-9))
            i += int(0.12 * SR)
        else:
            i += 1
    return hits


def jhash(a, b=0):
    def imul(x, y):
        return ((x & 0xFFFFFFFF) * (y & 0xFFFFFFFF)) & 0xFFFFFFFF
    h = (imul(a, 374761393) + imul(b, 668265263)) & 0xFFFFFFFF
    h = imul(h ^ (h >> 13), 1274126177)
    h ^= h >> 16
    return h / 4294967296
