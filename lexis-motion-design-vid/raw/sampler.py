"""Tiny sample player over VSCO-2 CE (CC0): nearest-sample pitch shift, velocity layers, round robins, trimmed pre-roll."""
import glob, os, re, subprocess
import numpy as np

SR = 48000
NOTE = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}
_cache = {}
ONSET = {}


def wav(path):
    if path in _cache:
        return _cache[path]
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    a = np.abs(x).max(1)
    thr = a.max() * 0.02
    i = int(np.argmax(a > thr))
    x = x[max(0, i - 48):]
    env = np.convolve(np.abs(x).mean(1)[:int(0.6 * SR)], np.ones(240) / 240, "same")
    on = int(np.argmax(env >= 0.5 * env.max())) if len(env) else 0
    ONSET[id(x)] = on / SR
    _cache[path] = x
    return x


def note_of(name):
    m = re.search(r"(?<![A-Za-z])([A-G](?:#|b)?)(-?\d)(?!\d)", name)
    if not m:
        return None
    return 12 * (int(m.group(2)) + 1) + NOTE[m.group(1)]


def f0(x):
    m = x.mean(1)[int(0.05 * SR):int(0.45 * SR)]
    if len(m) < 4096:
        return None
    m = m * np.hanning(len(m))
    ac = np.fft.irfft(np.abs(np.fft.rfft(m, 4 * len(m))) ** 2)[:len(m)]
    lo, hi = int(SR / 2000), int(SR / 25)
    k = lo + np.argmax(ac[lo:hi])
    return SR / k


class Inst:
    def __init__(self, pattern, vel_re=r"_v(\d)", gain=1.0, transpose_names=0, mapping=None):
        self.files = {}
        for p in sorted(glob.glob(pattern)):
            n = mapping(p) if mapping else note_of(os.path.basename(p))
            if n is None:
                continue
            n += transpose_names
            v = re.search(vel_re, os.path.basename(p)) if vel_re else None
            v = int(v.group(1)) if v else 1
            self.files.setdefault(n, {}).setdefault(v, []).append(p)
        self.notes = np.array(sorted(self.files))
        self.gain = gain
        self.rr = 0

    def check(self, n_probe=3):
        out = []
        for n in self.notes[:: max(1, len(self.notes) // n_probe)]:
            p = next(iter(self.files[n].values()))[0]
            f = f0(wav(p))
            if f:
                out.append((int(n), round(69 + 12 * np.log2(f / 440), 1)))
        return out

    def play(self, m, dur, vel=0.7, release=0.25, attack=0.0, tail=True):
        n0 = self.notes[np.argmin(np.abs(self.notes - m))]
        layers = sorted(self.files[n0])
        li = layers[min(len(layers) - 1, int(vel * len(layers)))]
        cands = self.files[n0][li]
        self.rr += 1
        x = wav(cands[self.rr % len(cands)])
        ratio = 2 ** ((m - n0) / 12)
        self.last_onset = ONSET.get(id(x), 0.0) / ratio
        need = int((dur + release) * SR)
        if ratio != 1:
            src = np.arange(int(min(len(x) / ratio, need + 10))) * ratio
            src = src[src < len(x) - 1]
            y = np.stack([np.interp(src, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
        else:
            y = x[:need].copy()
        if not tail:
            y = y[:need]
        y = y[:need]
        n = len(y)
        e = np.ones(n)
        rs = int(dur * SR)
        if rs < n:
            e[rs:] = np.exp(-np.arange(n - rs) / (release * SR / 4.5))
        if attack > 0:
            a = int(attack * SR)
            e[:a] *= np.linspace(0, 1, a) ** 2
        e[-64:] *= np.linspace(1, 0, 64)
        return y * e[:, None] * self.gain * (0.35 + 0.65 * vel)


V = "vsco/"
def lib():
    return dict(
        vln_spic=Inst(V + "Strings/Violin Section/Spic/*.wav", gain=1.0, transpose_names=12),
        vla_spic=Inst(V + "Strings/Viola Section/spic/*.wav", gain=1.0, transpose_names=12),
        vc_spic=Inst(V + "Strings/Cello Section/spic/*.wav", gain=1.1, transpose_names=12),
        cb_spic=Inst(V + "Strings/Solo Contrabass/Spic/*.wav", gain=1.2, transpose_names=12),
        vln_sus=Inst(V + "Strings/Violin Section/susVib/*.wav", gain=0.8, transpose_names=12),
        vla_sus=Inst(V + "Strings/Viola Section/susvib/*.wav", gain=0.8, transpose_names=12),
        vc_sus=Inst(V + "Strings/Cello Section/susvib/*.wav", gain=0.9, transpose_names=12),
        horn=Inst(V + "Brass/F Horn/sus/*.wav", gain=1.0, transpose_names=12),
        horn_st=Inst(V + "Brass/F Horn/stac/*.wav", gain=1.0, transpose_names=12),
        tpt=Inst(V + "Brass/Trumpet/sus/*.wav", gain=0.8, transpose_names=12),
        tpt_st=Inst(V + "Brass/Trumpet/stac/*.wav", gain=0.8, transpose_names=12),
        tbn=Inst(V + "Brass/Tenor Trombone/sus/*.wav", gain=0.9, transpose_names=12),
        tbn_st=Inst(V + "Brass/Tenor Trombone/stac/*.wav", gain=0.9, transpose_names=12),
        tuba=Inst(V + "Brass/Tuba/sus/*.wav", gain=1.0, transpose_names=12),
        tuba_st=Inst(V + "Brass/Tuba/stac/*.wav", gain=1.0, transpose_names=12),
        glock=Inst(V + "Percussion/Glock/*.wav", vel_re=None, gain=0.6, transpose_names=12),
        harp=Inst(V + "Strings/Harp/*.wav", vel_re=None, gain=0.8),
    )


def organ():
    # Rode_Man3Open_NN: NN is the key number of the manual, starting at C2 (MIDI 36)
    return Inst(V + "Keys/Organ/Loud/*.wav", vel_re=None, gain=0.6,
                mapping=lambda p: 35 + int(re.search(r"_(\d+)\.wav", p).group(1)))


def perc(name):
    return [wav(p) for p in sorted(glob.glob(V + name))]


if __name__ == "__main__":
    L = lib()
    for k, ins in L.items():
        print(k.ljust(9), len(ins.notes), "notes", ins.notes.min() if len(ins.notes) else None, "-", ins.notes.max() if len(ins.notes) else None, ins.check())
    o = organ()
    print("organ", len(o.notes), o.check())
