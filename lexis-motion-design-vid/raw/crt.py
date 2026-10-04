"""CRT phosphor pass for the history half of the film.

Curvature + bezel, beam scanlines, phosphor halation, radial colour fringe, flicker, grain and a slow hum bar.
Strength comes from a per-frame curve so the screen can flatten into the LCD world.
usage: crt.py in.mp4 out.mp4 [--frames a,b,c --png dir]
"""
import subprocess, sys
import numpy as np

W, H, FPS = 1920, 1080, 60
LIME = np.array([0xC3, 0xDF, 0xA0], np.float32) / 255


def strength(f):
    if f < 507:
        return 1.0
    if f < 519:
        u = (f - 507) / 12
        return float(1 - u * u * (3 - 2 * u))
    return 0.0


yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
nx, ny = (xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2)
r2 = nx * nx * (W / H) ** 0 + ny * ny


def warp_maps(k):
    s = 1 + k * (nx * nx + ny * ny)
    sx = (nx * s * (1 - k * 0.5)) * (W / 2) + W / 2
    sy = (ny * s * (1 - k * 0.5)) * (H / 2) + H / 2
    return sx, sy


def bilinear(img, sx, sy):
    x0 = np.clip(np.floor(sx).astype(np.int32), 0, W - 2)
    y0 = np.clip(np.floor(sy).astype(np.int32), 0, H - 2)
    fx = np.clip(sx - x0, 0, 1)[..., None]
    fy = np.clip(sy - y0, 0, 1)[..., None]
    a = img[y0, x0]; b = img[y0, x0 + 1]; c = img[y0 + 1, x0]; d = img[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def box(img, r, axis):
    c = np.cumsum(img, axis=axis, dtype=np.float32)
    pad = [(0, 0)] * img.ndim
    pad[axis] = (r + 1, r)
    c = np.pad(c, pad, mode="edge")
    sl_hi = [slice(None)] * img.ndim; sl_lo = [slice(None)] * img.ndim
    n = img.shape[axis]
    sl_hi[axis] = slice(2 * r + 1, 2 * r + 1 + n); sl_lo[axis] = slice(0, n)
    return (c[tuple(sl_hi)] - c[tuple(sl_lo)]) / (2 * r + 1)


def blur(img, r, passes=2):
    for _ in range(passes):
        img = box(box(img, r, 0), r, 1)
    return img


def halation(img):
    small = img[::4, ::4]
    luma = small.mean(2, keepdims=True)
    bright = np.clip((luma - 0.45) / 0.55, 0, 1) ** 1.5 * small
    g1 = blur(bright, 3)
    g2 = blur(bright, 12)
    g = g1 * 0.6 + g2 * 0.55
    return np.repeat(np.repeat(g, 4, 0), 4, 1)[:H, :W]


def hash01(n):
    n = (n * 374761393 + 668265263) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFFFFFF) / 4294967296


rng = np.random.default_rng(3)
GRAIN = rng.standard_normal((8, H // 2, W // 2)).astype(np.float32)
scan = (0.80 + 0.20 * np.cos(2 * np.pi * (yy + 0.5) / 3.0))[..., None]
grille = np.ones((H, W, 3), np.float32)
for ch in range(3):
    grille[:, ch::3, ch] = 1.06
grille[:, :, :] *= 0.98
vig = np.clip(1 - 0.32 * (nx * nx * 0.8 + ny * ny * 1.1) ** 1.4, 0, 1)[..., None]
K = 0.055
SX, SY = warp_maps(K)
# bezel: rounded-rect in source space, soft edge
bx = np.abs((SX - W / 2) / (W / 2)); by = np.abs((SY - H / 2) / (H / 2))
rr = 0.06
qx = np.clip(bx - (1 - rr * H / W), 0, None) / (rr * H / W); qy = np.clip(by - (1 - rr), 0, None) / rr
edge = np.sqrt(qx * qx + qy * qy)
inside = np.clip((1.0 - np.maximum(edge, np.maximum(bx, by) ** 40)) * 18, 0, 1)
bezel = inside[..., None].astype(np.float32)
# radial fringe offsets (in px)
FR = 1.6 * np.sqrt(nx * nx + ny * ny)


def crt(img, f, s):
    if s <= 0:
        return img
    k = K * s
    if s < 1:
        sx, sy = warp_maps(k)
    else:
        sx, sy = SX, SY
    dxr = FR * s * nx / (np.sqrt(nx * nx + ny * ny) + 1e-6)
    dyr = FR * s * ny / (np.sqrt(nx * nx + ny * ny) + 1e-6)
    out = np.empty_like(img)
    out[..., 1] = bilinear(img, sx, sy)[..., 1]
    out[..., 0] = bilinear(img, sx + dxr, sy + dyr)[..., 0]
    out[..., 2] = bilinear(img, sx - dxr, sy - dyr)[..., 2]
    luma = out.mean(2, keepdims=True)
    beam = scan + (1 - scan) * np.clip(luma * 1.3, 0, 1) ** 0.8
    o = out * (1 + (beam - 1) * s)
    o = o * (1 + (grille - 1) * s * 0.7)
    m = float(out.mean())
    o = o + halation(out) * (1.35 * (1 - m) ** 1.3 * s) * (0.5 + 0.5 * LIME)
    o = o * (1 + 0.08 * s * (1 - m))
    hum = 1 + 0.035 * s * np.exp(-(((yy / H - ((f / FPS) * 0.33) % 1.3 + 0.15)) / 0.08) ** 2)[..., None]
    flick = 1 + s * (0.012 * np.sin(f * 1.9) + 0.018 * (hash01(f) - 0.5))
    o = o * hum * flick
    g = np.repeat(np.repeat(GRAIN[f % 8], 2, 0), 2, 1)[:H, :W, None]
    o = o + g * 0.022 * s
    o = o * (1 + (vig - 1) * s)
    if s < 1:
        b = 1 + (bezel - 1) * s
    else:
        b = bezel
    o = o * b
    return np.clip(o, 0, 1)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    only = None
    png = None
    if "--frames" in sys.argv:
        only = [int(v) for v in sys.argv[sys.argv.index("--frames") + 1].split(",")]
        png = sys.argv[sys.argv.index("--png") + 1]
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    enc = None
    if only is None:
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                                "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", dst], stdin=subprocess.PIPE)
    f = 0
    while True:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        if only is not None and f not in only:
            f += 1
            if f > max(only):
                break
            continue
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32) / 255
        s = strength(f)
        out = (crt(img, f, s) * 255 + 0.5).astype(np.uint8) if s > 0 else (img * 255 + 0.5).astype(np.uint8)
        if enc:
            enc.stdin.write(out.tobytes())
        else:
            from PIL import Image
            Image.fromarray(out).save(f"{png}/crt_{f:04d}.png")
        if f % 60 == 0:
            print("frame", f, flush=True)
        f += 1
    if enc:
        enc.stdin.close(); enc.wait()
    dec.stdout.close(); dec.wait()


if __name__ == "__main__":
    main()
