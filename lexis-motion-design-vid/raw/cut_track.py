"""Cut any music track to this picture: drop on the Saturn V frame, dip under the punchline, true silence before Lexis,
the film's SFX layer on top, impacts on the three big hits.
usage: cut_track.py track.mp3 drop_seconds out.wav [--search]
--search refines the drop to the strongest low-end onset within +-0.5s.
"""
import json, re, subprocess, sys
import numpy as np
from synth import SR, load, taiko, crash, subdrop, kick, Bus

DUR = 15.0
fr = lambda f: f / 60.0
DROP, PUNCH, SLAM, OFF, ON, LEXIS, LAND = fr(159), fr(375), fr(411), fr(483), fr(507), fr(519), fr(820)


def onset_refine(x, t0):
    m = x.mean(1)
    win = int(0.5 * SR)
    seg = m[int((t0 - 0.5) * SR):int((t0 + 0.5) * SR)]
    e = np.convolve(seg ** 2, np.ones(480) / 480, "same")
    d = np.maximum(0, np.diff(np.log(e + 1e-9)))
    return t0 - 0.5 + (np.argmax(np.convolve(d, np.ones(240), "same")) / SR)


def main():
    src, drop, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    x = load(src)
    if "--search" in sys.argv:
        drop = onset_refine(x, drop)
    start = drop - DROP
    i0 = int(start * SR)
    pad = max(0, -i0)
    seg = np.concatenate([np.zeros((pad, 2)), x[max(0, i0):max(0, i0) + int(DUR * SR) - pad]])
    seg = np.pad(seg, ((0, max(0, int(DUR * SR) - len(seg))), (0, 0)))
    t = np.arange(len(seg)) / SR
    pts = [(0, -1.5), (DROP - 0.02, -1.5), (DROP, 0), (PUNCH - 0.01, 0), (PUNCH, -16), (SLAM, -16), (SLAM + 0.01, -9), (OFF - 0.1, -9),
           (OFF, -60), (ON, -60), (LEXIS, -4), (LAND - 0.01, -3.5), (LAND, 0), (DUR, 0)]
    xs, ys = zip(*pts)
    seg *= (10 ** (np.interp(t, xs, ys) / 20))[:, None]
    seg[int(OFF * SR):int(fr(497) * SR)] = 0
    sfx = np.load("stems/sfx.npy").astype(np.float64)[:len(seg)]
    hits = Bus(len(seg) + SR * 3)
    for h, g in ((DROP, 0.8), (SLAM, 0.9), (LAND, 0.8)):
        hits.add(taiko(1.2), h, g); hits.add(crash(2.0), h, 0.5); hits.add(subdrop(1.2, 100, 36), h, 0.5)
    mix = seg / (np.abs(seg).max() + 1e-9) * 0.8 + sfx * 0.9 + hits.x[:len(seg)] * 0.6
    fade = np.ones(len(mix)); fade[-int(0.5 * SR):] = np.linspace(1, 0, int(0.5 * SR)) ** 2
    mix *= fade[:, None]
    mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.2) * 0.9
    mix.astype(np.float32).tofile("/tmp/lx/cut.f32")
    pre = ["-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "/tmp/lx/cut.f32"]
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + pre + ["-af", "loudnorm=I=-14:TP=-1:LRA=14:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(re.search(r"\{[^}]+\}", meas, re.S).group(0))
    af = f"loudnorm=I=-14:TP=-1:LRA=14:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:linear=true"
    subprocess.check_call(["ffmpeg", "-v", "error", "-y"] + pre + ["-af", af, "-ar", "48000", out])
    print("wrote", out, "drop at", round(drop, 3))


if __name__ == "__main__":
    main()
