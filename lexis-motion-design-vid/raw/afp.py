"""Audio fingerprint: tempo, loudness, spectral balance, brightness, punch. Usage: afp.py file [start dur] ..."""
import subprocess, sys
import numpy as np

SR = 22050
BANDS = [(20, 60), (60, 250), (250, 2000), (2000, 6000), (6000, 11000)]


def load(path, ss=0, dur=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(ss)] + (["-t", str(dur)] if dur else []) + ["-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.check_output(cmd), np.float32).astype(np.float64)


def fp(x):
    hop, win = 512, 2048
    n = (len(x) - win) // hop
    fr = np.stack([x[i * hop:i * hop + win] * np.hanning(win) for i in range(n)])
    S = np.abs(np.fft.rfft(fr, axis=1)) ** 2
    f = np.fft.rfftfreq(win, 1 / SR)
    tot = S.sum(1) + 1e-12
    bands = [10 * np.log10(S[:, (f >= a) & (f < b)].sum(1).mean() / tot.mean()) for a, b in BANDS]
    cent = (S * f).sum(1) / tot
    flux = np.maximum(0, np.diff(np.log1p(np.sqrt(S) * 50), axis=0)).sum(1)
    fl = flux - flux.mean()
    ac = np.correlate(fl, fl, "full")[len(fl) - 1:]
    lags = np.arange(len(ac)) * hop / SR
    m = (lags > 0.33) & (lags < 1.0)
    bpm = 60 / lags[m][np.argmax(ac[m])]
    rms = np.sqrt(np.convolve(x ** 2, np.ones(SR // 10) / (SR // 10), "same"))
    crest = 20 * np.log10(np.percentile(np.abs(x), 99.9) / (np.sqrt(np.mean(x ** 2)) + 1e-9))
    lufs_ish = 10 * np.log10(np.mean(x ** 2) + 1e-12)
    dyn = 20 * np.log10(np.percentile(rms, 95) / (np.percentile(rms, 20) + 1e-9))
    return dict(bpm=round(bpm, 1), rms_db=round(lufs_ish, 1), crest=round(crest, 1), dyn=round(dyn, 1),
                cent=int(np.median(cent)), onset=round(float(np.percentile(flux, 90) / (np.median(flux) + 1e-9)), 2),
                bands=[round(b, 1) for b in bands])


if __name__ == "__main__":
    a = sys.argv[1:]
    path = a[0]
    ss = float(a[1]) if len(a) > 1 else 0
    dur = float(a[2]) if len(a) > 2 else None
    print(path.split("/")[-1][:40].ljust(40), fp(load(path, ss, dur)))
