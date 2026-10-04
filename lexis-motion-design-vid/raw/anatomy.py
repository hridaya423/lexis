"""Musical anatomy of a reference: pulse rate per section, key, per-second chroma, low-band onset grid.
usage: anatomy.py file start dur"""
import subprocess, sys
import numpy as np

SR = 22050
NAMES = "C C# D D# E F F# G G# A A# B".split()


def load(p, ss, d):
    return np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-ss", str(ss), "-t", str(d), "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]), np.float32).astype(float)


def spec(x, win=4096, hop=512):
    n = (len(x) - win) // hop
    fr = np.stack([x[i * hop:i * hop + win] * np.hanning(win) for i in range(n)])
    return np.abs(np.fft.rfft(fr, axis=1)), np.fft.rfftfreq(win, 1 / SR), hop / SR


def chroma(S, f):
    m = (f > 60) & (f < 2000)
    pc = (np.round(12 * np.log2(f[m] / 440)) + 9) % 12
    C = np.zeros((S.shape[0], 12))
    for k in range(12):
        C[:, k] = (S[:, m][:, pc == k] ** 2).sum(1)
    return C / (C.sum(1, keepdims=True) + 1e-12)


def pulse(sig, dt, lo=0.08, hi=1.5):
    s = sig - sig.mean()
    ac = np.correlate(s, s, "full")[len(s) - 1:]
    lags = np.arange(len(ac)) * dt
    m = (lags > lo) & (lags < hi)
    order = np.argsort(ac[m])[::-1]
    picks = []
    for o in order:
        L = lags[m][o]
        if all(abs(L - p) > 0.03 for p in picks):
            picks.append(L)
        if len(picks) == 4:
            break
    return [round(p, 3) for p in picks]


p, ss, d = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
x = load(p, ss, d)
S, f, dt = spec(x)
C = chroma(S, f)
key_prof = C.mean(0)
print("pitch classes (strongest first):", [NAMES[i] for i in np.argsort(key_prof)[::-1][:7]])
for name, band in (("low <150Hz", (30, 150)), ("mid 400-1200", (400, 1200)), ("high >3k", (3000, 9000))):
    m = (f >= band[0]) & (f < band[1])
    e = np.log1p(S[:, m].sum(1) * 10)
    on = np.maximum(0, np.diff(e))
    print(f"{name:13s} pulse periods (s): {pulse(on, dt)}")
print("per-second top notes:")
for s0 in range(0, int(d)):
    i0, i1 = int(s0 / dt), int((s0 + 1) / dt)
    c = C[i0:i1].mean(0)
    top = [NAMES[i] for i in np.argsort(c)[::-1][:4]]
    rms = 20 * np.log10(np.sqrt(np.mean(x[int(s0 * SR):int((s0 + 1) * SR)] ** 2)) + 1e-9)
    print(f"  {ss + s0:5.1f}s {rms:6.1f}dB  {' '.join(top)}")
