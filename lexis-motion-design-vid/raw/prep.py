"""Bake the Lexis two-ink look into every clip and still.

modes:
  duo   ink -> paper duotone (positive print)
  inv   night -> paper duotone (phosphor CRT)
  cells paper ground, ink squares sized by darkness (LCD halftone)
  icells night ground, paper squares sized by brightness
"""
import json, subprocess, sys
import numpy as np
from PIL import Image

PAPER = np.array([0xC3, 0xDF, 0xA0], np.float32)
INK = np.array([0x18, 0x25, 0x10], np.float32)
NIGHT = np.array([0x0E, 0x16, 0x0A], np.float32)
OUT = "../film/assets"


def curve(l, lo, hi, gamma=1.0, s=0.0):
    x = np.clip((l - lo) / max(hi - lo, 1e-3), 0, 1) ** gamma
    if s:
        x = x + s * (x - 0.5) * (1 - np.abs(2 * x - 1))
    return np.clip(x, 0, 1)


def cells(x, pitch, gap, invert, ground, fg, gamma=1.0):
    h, w = x.shape
    ch, cw = h // pitch, w // pitch
    oy, ox = (h - ch * pitch) // 2, (w - cw * pitch) // 2
    blk = x[oy:oy + ch * pitch, ox:ox + cw * pitch].reshape(ch, pitch, cw, pitch).mean((1, 3))
    amt = (blk if invert else 1 - blk) ** gamma
    side = amt * (pitch - gap)
    big = np.repeat(np.repeat(side, pitch, 0), pitch, 1)
    c = np.arange(pitch) + 0.5 - pitch / 2
    d = np.maximum(np.abs(c)[:, None], np.abs(c)[None, :])
    dt = np.tile(d, (ch, cw))
    cov = np.clip(big / 2 - dt + 0.5, 0, 1)
    full = np.zeros((h, w), np.float32)
    full[oy:oy + ch * pitch, ox:ox + cw * pitch] = cov
    return ground[None, None] * (1 - full[..., None]) + fg[None, None] * full[..., None]


def treat(x, spec):
    m = spec["mode"]
    if spec.get("neg"):
        x = 1 - x
    if m == "duo":
        return INK + (PAPER - INK) * x[..., None]
    if m == "inv":
        return NIGHT + (PAPER - NIGHT) * x[..., None]
    if m == "cells":
        return cells(x, spec.get("pitch", 8), spec.get("gap", 1), False, PAPER, INK, spec.get("cg", 1.0))
    if m == "icells":
        return cells(x, spec.get("pitch", 8), spec.get("gap", 1), True, NIGHT, PAPER, spec.get("cg", 1.0))
    raise ValueError(m)


def vf_geom(spec):
    W, H = spec["size"]
    f = []
    if "crop" in spec:
        cx, cy, cw, chh = spec["crop"]
        f.append(f"crop=iw*{cw}:ih*{chh}:iw*{cx}:ih*{cy}")
    if spec.get("fit") == "contain":
        f.append(f"scale={W}:{H}:force_original_aspect_ratio=decrease:flags=lanczos,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color={spec.get('pad', 'white')}")
    else:
        f.append(f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H}")
    if spec.get("hflip"):
        f.append("hflip")
    return ",".join(f)


def levels(frames, spec):
    sample = np.concatenate([frames[i].ravel() for i in range(0, len(frames), max(1, len(frames) // 6))])
    lo, hi = np.percentile(sample, spec.get("pct", (2, 98)))
    return lo, hi


def do_video(spec):
    W, H = spec["size"]
    vf = vf_geom(spec) + ",format=gray"
    if spec.get("speed", 1) != 1:
        vf = f"setpts=PTS/{spec['speed']}," + vf
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", str(spec["ss"]), "-i", spec["src"], "-t",
                                   str(spec["dur"] / spec.get("speed", 1)), "-an", "-vf", vf, "-r", "30",
                                   "-f", "rawvideo", "-pix_fmt", "gray", "-"])
    frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32) / 255
    lo, hi = levels(frames, spec)
    out = f"{OUT}/v/{spec['name']}.mp4"
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", "30", "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "14",
                            "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    for fr in frames:
        x = curve(fr, lo, hi, spec.get("gamma", 1.0), spec.get("s", 0.25))
        enc.stdin.write(np.clip(treat(x, spec), 0, 255).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait()
    Image.fromarray(np.clip(treat(curve(frames[-1], lo, hi, spec.get("gamma", 1.0), spec.get("s", 0.25)), spec), 0, 255)
                    .astype(np.uint8)).save(f"{OUT}/v/{spec['name']}_last.png")
    print("video", out, len(frames), "frames")


def do_image(spec):
    W, H = spec["size"]
    pre = ["-ss", str(spec["still"])] if "still" in spec else []
    raw = subprocess.check_output(["ffmpeg", "-v", "error", *pre, "-i", spec["src"], "-vf", vf_geom(spec) + ",format=gray",
                                   "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-"])
    x = np.frombuffer(raw, np.uint8).reshape(H, W).astype(np.float32) / 255
    ref = x
    if spec.get("fit") == "contain":
        raw2 = subprocess.check_output(["ffmpeg", "-v", "error", "-i", spec["src"], "-vf", (f"crop=iw*{spec['crop'][2]}:ih*{spec['crop'][3]}:iw*{spec['crop'][0]}:ih*{spec['crop'][1]}," if "crop" in spec else "") + "scale=480:-2,format=gray",
                                        "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-"])
        ref = np.frombuffer(raw2, np.uint8).astype(np.float32) / 255
    lo, hi = np.percentile(ref, spec.get("pct", (2, 98)))
    rgb = np.clip(treat(curve(x, lo, hi, spec.get("gamma", 1.0), spec.get("s", 0.25)), spec), 0, 255).astype(np.uint8)
    im = Image.fromarray(rgb)
    if spec.get("alpha"):
        a = np.asarray(Image.open(spec["src"]).convert("RGBA").getchannel("A").resize((W, H), Image.LANCZOS),
                       np.float32) / 255
        if spec["mode"] in ("cells", "icells"):
            p = spec.get("pitch", 8)
            ch, cw = H // p, W // p
            oy, ox = (H - ch * p) // 2, (W - cw * p) // 2
            q = (a[oy:oy + ch * p, ox:ox + cw * p].reshape(ch, p, cw, p).mean((1, 3)) > 0.5).astype(np.float32)
            a = np.zeros_like(a)
            a[oy:oy + ch * p, ox:ox + cw * p] = np.repeat(np.repeat(q, p, 0), p, 1)
        im.putalpha(Image.fromarray((a * 255).astype(np.uint8)))
    out = f"{OUT}/i/{spec['name']}.png"
    im.save(out, optimize=True)
    print("image", out)


if __name__ == "__main__":
    args = sys.argv[1:]
    src = args.pop(0) if args and args[0].endswith(".json") else "shots.json"
    specs = json.load(open(src))
    only = set(args)
    for s in specs:
        if only and s["name"] not in only:
            continue
        (do_video if "ss" in s else do_image)(s)
