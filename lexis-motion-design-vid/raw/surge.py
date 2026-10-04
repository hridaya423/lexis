"""Surge XT (GPL, open source) as the synth engine, driven through Spotify's pedalboard. Patches are programmed here."""
import numpy as np
import pedalboard

SR = 48000
PLUG = "plugins/Surge XT.vst3"


def _num(v):
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return float(v)
    t = str(v).split()
    try:
        x = float(t[0])
    except (ValueError, IndexError):
        return None
    return x / 1000 if len(t) > 1 and t[1] == "ms" else x


def setp(p, **kw):
    for k, v in kw.items():
        vals = p.parameters[k].valid_values
        if isinstance(v, (int, float)) and not isinstance(v, bool) and vals:
            nums = [(_num(x), x) for x in vals]
            nums = [(n, x) for n, x in nums if n is not None]
            if nums:
                v = min(nums, key=lambda nx: abs(nx[0] - v))[1]
        setattr(p, k, v)


def make(**patch):
    p = pedalboard.load_plugin(PLUG)
    base = dict(a_osc_2_mute=True, a_osc_3_mute=True)
    base.update(patch)
    for k in base:
        if k not in p.parameters:
            raise KeyError(k)
    setp(p, **base)
    return p


def render(p, notes, dur, gain=1.0):
    """notes: [(t, midi, length, vel 0-1)]"""
    msgs = []
    for t, m, l, v in notes:
        msgs.append((bytes([0x90, int(m), max(1, min(127, int(v * 127)))]), float(t)))
        msgs.append((bytes([0x80, int(m), 0]), float(t + l)))
    msgs.sort(key=lambda x: x[1])
    out = p(msgs, duration=dur, sample_rate=SR, num_channels=2, buffer_size=256, reset=True)
    return out.T.astype(np.float64) * gain


if __name__ == "__main__":
    pulse = make(a_osc_1_type="Classic", a_osc_1_unison_voices=5, a_osc_1_unison_detune=18,
                 a_filter_1_type="LP 24 dB", a_filter_1_cutoff=900.0, a_filter_1_resonance=25.0, a_filter_1_feg_mod_amount=36,
                 a_filter_eg_attack=0.0, a_filter_eg_decay=0.18, a_filter_eg_sustain=10.0, a_filter_eg_release=0.1,
                 a_amp_eg_attack=0.0, a_amp_eg_decay=0.3, a_amp_eg_sustain=40.0, a_amp_eg_release=0.12)
    notes = [(0.15 * i, [50, 50, 57, 62][i % 4], 0.13, 0.9) for i in range(16)]
    y = render(pulse, notes, 3.0)
    print("rms dB", 20 * np.log10(np.sqrt((y ** 2).mean()) + 1e-12), "peak", np.abs(y).max(), y.shape)
    import subprocess
    (y / np.abs(y).max() * 0.8).astype(np.float32).tofile("/tmp/lx/pulse.f32")
    subprocess.call(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "/tmp/lx/pulse.f32", "/tmp/lx/pulse.wav"])
