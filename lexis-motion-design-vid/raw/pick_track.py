"""Rank the music pool for this cut: find a drop we can sit on the Saturn V frame (2.65s) and score the window.

A good window: quiet-ish, rising 2.6s before the drop; a big onset at the drop; sustained energy for the next 3.6s;
warm spectrum (a16z-like); and enough energy again 6.0-12.4s after the drop for the Lexis act.
"""
import json, os, subprocess, sys
import numpy as np

SR = 11025
HOP = 256


def load(p):
    try:
        raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    except subprocess.CalledProcessError:
        return None
    return np.frombuffer(raw, np.float32).astype(np.float64)


def feats(x):
    n = (len(x) - 1024) // HOP
    fr = np.stack([x[i * HOP:i * HOP + 1024] * np.hanning(1024) for i in range(n)])
    S = np.abs(np.fft.rfft(fr, axis=1))
    f = np.fft.rfftfreq(1024, 1 / SR)
    rms = np.sqrt((fr ** 2).mean(1))
    flux = np.maximum(0, np.diff(np.log1p(S * 30), axis=0)).sum(1)
    flux = np.concatenate([[0], flux])
    low = (S[:, f < 150] ** 2).sum(1)
    cent = (S * f).sum(1) / (S.sum(1) + 1e-9)
    return rms, flux, low, cent


def rank(path):
    x = load(path)
    if x is None or len(x) < SR * 40:
        return None
    rms, flux, low, cent = feats(x)
    fps = SR / HOP
    db = 20 * np.log10(rms + 1e-6)
    db -= np.percentile(db, 95)
    lowdb = 10 * np.log10(low + 1e-9)
    lowdb -= np.percentile(lowdb, 95)
    fl = flux / (np.percentile(flux, 95) + 1e-9)
    best = None
    for T in np.arange(4.0, len(x) / SR - 14, 0.25):
        i = int(T * fps)
        w = lambda a, b, arr=db: arr[int((T + a) * fps):int((T + b) * fps)].mean()
        pre, post, lexis = w(-2.6, -0.4), w(0.05, 3.6), w(6.0, 12.4)
        rise = w(-0.8, -0.1) - w(-2.6, -1.8)
        onset = fl[i - 3:i + 4].max()
        lowhit = lowdb[i:i + int(0.4 * fps)].mean() - lowdb[i - int(0.6 * fps):i].mean()
        c = np.median(cent[int((T) * fps):int((T + 3.6) * fps)])
        score = (post - pre) * 1.0 + min(rise, 6) * 0.4 + onset * 2.0 + min(lowhit, 12) * 0.35 + min(0, lexis + 6) * 0.8 - max(0, c - 1600) / 400
        if post < -6 or pre < -30 or lexis < -12:
            score -= 5
        if best is None or score > best[0]:
            best = (round(score, 2), round(float(T), 2), dict(pre=round(pre, 1), post=round(post, 1), lexis=round(lexis, 1), rise=round(rise, 1), onset=round(float(onset), 2), lowhit=round(float(lowhit), 1), cent=int(c)))
    return best


if __name__ == "__main__":
    pool = json.load(open("music/pool.json"))
    out = []
    for k, v in pool.items():
        p = f"music/{k}.mp3"
        if not os.path.exists(p) or os.path.getsize(p) < 200000:
            continue
        r = rank(p)
        if r:
            out.append((r[0], r[1], k, v["title"][:38], v["creator"], v["license"], r[2]))
    out.sort(reverse=True)
    json.dump(out, open("music/ranked.json", "w"), indent=1)
    for o in out[:15]:
        print(o)
