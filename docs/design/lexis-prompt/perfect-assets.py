"""Rebuild the supplied heading masks as uniform pixel-cell SVGs.

The supplied headings are 1px-resolution thresholded rasters of a pixel display
font rendered at a fractional scale: real letterforms, but cell edges
stair-step and the grid drifts a few px across the width, so no global lattice
fits. Recovery:

1. Split the mask at every fully-empty row/column line -> cell blobs (the
   ~1px gaps between font pixels separate cells naturally).
2. Split remaining fused blobs (antialiasing bridged a gap) at the
   lowest-ink line near each expected pitch boundary.
3. Snap cell centres to a per-cluster lattice: the source render drifts
   sub-pixel amounts, so each connected letterform cluster gets its own
   lattice phase at the measured pitch. This removes jitter and restores
   uniform gaps; it cannot create or move cells by more than pitch/2.
4. Emit a uniform square (0.86 fill - the footer wordmark's recipe) at
   every snapped lattice point.

Pitches were measured from blob spacing per heading and are hardcoded below.
Also emits wordmark-mark.svg (coarse 4x4 supercell mark for the header) and
copies the pixel icon assets. Outputs land in public/lexis-prompt/.
Run: python3 perfect-assets.py
"""
from pathlib import Path
import json
import math
import re
import numpy as np

root = Path(__file__).resolve().parent
src = root / "assets"
pub = root.parents[2] / "public" / "lexis-prompt"
pub.mkdir(parents=True, exist_ok=True)

CELL_RATIO = 0.86

# (pitch_x, pitch_y) measured from blob geometry per heading.
PITCH = {
    "heading-hero": (9.5, 10.0),
    "heading-examples": (6.0, 6.0),
    "heading-review": (9.4, 8.8),
    "heading-install": (7.1, 7.5),
}


def load_mask(svg_path):
    text = svg_path.read_text()
    m = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', text)
    w, h = int(float(m.group(1))), int(float(m.group(2)))
    mask = np.zeros((h, w), np.uint8)
    for x, y, rw, rh in re.findall(
        r"M([\d.]+) ([\d.]+)h([\d.]+)v([\d.]+)h", text
    ):
        mask[int(float(y)) : int(float(y) + float(rh)),
             int(float(x)) : int(float(x) + float(rw))] = 1
    return mask, w, h


def gap_split(mask, x0, y0, out, depth=0):
    """Split at fully-empty row/column lines -> tight cell blobs."""
    if depth > 60 or not mask.any():
        return
    rows = mask.any(axis=1)
    if not rows.all():
        i = 0
        while i < len(rows):
            if rows[i]:
                j = i
                while j < len(rows) and rows[j]:
                    j += 1
                gap_split(mask[i:j], x0, y0 + i, out, depth + 1)
                i = j
            else:
                i += 1
        return
    cols = mask.any(axis=0)
    if not cols.all():
        i = 0
        while i < len(cols):
            if cols[i]:
                j = i
                while j < len(cols) and cols[j]:
                    j += 1
                gap_split(mask[:, i:j], x0 + i, y0, out, depth + 1)
                i = j
            else:
                i += 1
        return
    out.append((x0, y0, mask.shape[1], mask.shape[0]))


def minline_split(mask, x0, y0, px, py, out):
    """Split a fused blob at the lowest-ink lines near pitch boundaries."""
    h, w = mask.shape
    nc, nr = max(1, round(w / px)), max(1, round(h / py))
    if nc == 1 and nr == 1:
        out.append((x0, y0, w, h))
        return
    if nr > 1:
        rows = mask.sum(axis=1)
        bounds = []
        for k in range(1, nr):
            ideal = k * h / nr
            lo, hi = max(1, int(ideal - 2)), min(h - 1, int(ideal + 3))
            bounds.append(lo + int(np.argmin(rows[lo:hi])))
        prev = 0
        for b in bounds + [h]:
            minline_split(mask[prev:b], x0, y0 + prev, px, py, out)
            prev = b
        return
    cols = mask.sum(axis=0)
    bounds = []
    for k in range(1, nc):
        ideal = k * w / nc
        lo, hi = max(1, int(ideal - 2)), min(w - 1, int(ideal + 3))
        bounds.append(lo + int(np.argmin(cols[lo:hi])))
    prev = 0
    for b in bounds + [w]:
        minline_split(mask[:, prev:b], x0 + prev, y0, px, py, out)
        prev = b


def cluster(centres, px, py):
    """Union-find on near-neighbour cells -> letterform clusters."""
    parent = list(range(len(centres)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    lim_x, lim_y = px * 1.6, py * 1.6
    for i in range(len(centres)):
        for j in range(i + 1, len(centres)):
            if (
                abs(centres[i][0] - centres[j][0]) < lim_x
                and abs(centres[i][1] - centres[j][1]) < lim_y
            ):
                parent[find(i)] = find(j)
    groups = {}
    for i, c in enumerate(centres):
        groups.setdefault(find(i), []).append(c)
    return list(groups.values())


def fit_phase(vals, pitch):
    """Best lattice offset for one axis of a cluster (min squared residual)."""
    best_off, best_err = 0.0, float("inf")
    for step in range(60):
        off = step * pitch / 60
        err = sum(
            (v - (off + round((v - off) / pitch) * pitch)) ** 2 for v in vals
        )
        if err < best_err:
            best_off, best_err = off, err
    return best_off


def snap(centres, px, py):
    """Snap centres to a per-cluster lattice; dedupe collided points."""
    out = set()
    for group in cluster(centres, px, py):
        xs = [c[0] for c in group]
        ys = [c[1] for c in group]
        x0, y0 = fit_phase(xs, px), fit_phase(ys, py)
        for cx, cy in group:
            out.add(
                (
                    x0 + round((cx - x0) / px) * px,
                    y0 + round((cy - y0) / py) * py,
                )
            )
    return sorted(out)


def find_holes(mask):
    """Empty regions enclosed by ink (glyph counters). Dilating first closes
    hairline antialias leaks that would otherwise flood the counter."""
    h, w = mask.shape
    dil = mask.copy()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        sh = np.zeros_like(mask)
        sy = slice(max(0, dy), min(h, h + dy))
        sx = slice(max(0, dx), min(w, w + dx))
        ty = slice(max(0, -dy), min(h, h - dy))
        tx = slice(max(0, -dx), min(w, w - dx))
        sh[sy, sx] = mask[ty, tx]
        dil |= sh
    seen = np.zeros_like(mask)
    stack = []
    for x in range(w):
        for y in (0, h - 1):
            if not dil[y, x] and not seen[y, x]:
                seen[y, x] = 1
                stack.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if not dil[y, x] and not seen[y, x]:
                seen[y, x] = 1
                stack.append((y, x))
    while stack:
        cy, cx = stack.pop()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not dil[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = 1
                stack.append((ny, nx))
    return (dil == 0) & (seen == 0)


def perfect(name):
    mask, W, H = load_mask(src / f"{name}.svg")
    px, py = PITCH[name]
    holes = find_holes(mask)
    blobs = []
    gap_split(mask, 0, 0, blobs)

    centres = []
    for x, y, w, h in blobs:
        if w <= px * 1.4 and h <= py * 1.4:
            centres.append((x + w / 2, y + h / 2))
            continue
        parts = []
        minline_split(mask[y : y + h, x : x + w], x, y, px, py, parts)
        for px0, py0, pw, ph in parts:
            centres.append((px0 + pw / 2, py0 + ph / 2))

    size = round(min(px, py) * CELL_RATIO, 2)
    # re-sample the source at each snapped cell rect: blob detection can emit
    # centres over empty interiors (fused strokes, enclosed counters); a cell
    # only exists if the source inks it AND it isn't mostly inside a counter
    def live(c, threshold=0.3):
        y0 = min(H - 1, max(0, int(round(c[1] - size / 2))))
        y1 = min(H, max(0, int(round(c[1] + size / 2))))
        x0 = min(W - 1, max(0, int(round(c[0] - size / 2))))
        x1 = min(W, max(0, int(round(c[0] + size / 2))))
        if mask[y0:y1, x0:x1].mean() <= threshold:
            return False
        return holes[y0:y1, x0:x1].mean() <= 0.15

    if name in ("heading-examples", "heading-install"):
        snapped = set()
        for group in cluster(centres, px, py):
            phase_x = fit_phase([c[0] for c in group], px)
            phase_y = fit_phase([c[1] for c in group], py)
            left = math.floor((min(c[0] for c in group) - px - phase_x) / px)
            right = math.ceil((max(c[0] for c in group) + px - phase_x) / px)
            top = math.floor((min(c[1] for c in group) - py - phase_y) / py)
            bottom = math.ceil((max(c[1] for c in group) + py - phase_y) / py)
            for xi in range(left, right + 1):
                for yi in range(top, bottom + 1):
                    cx, cy = phase_x + xi * px, phase_y + yi * py
                    if not (0 <= cx < W and 0 <= cy < H):
                        continue
                    if live((cx, cy), 0.2):
                        snapped.add((cx, cy))
        snapped = sorted(snapped)
    else:
        snapped = [c for c in snap(centres, px, py) if live(c)]
    path = "".join(
        f"M{cx - size / 2:.2f} {cy - size / 2:.2f}h{size}v{size}h-{size}z"
        for cx, cy in snapped
    )
    out = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
        f'fill="currentColor"><path d="{path}"/></svg>'
    )
    (pub / f"{name}.svg").write_text(out)
    print(
        f"{name}: {len(centres)} detected -> {len(snapped)} cells, cell {size}px"
    )


for heading in PITCH:
    perfect(heading)

# Coarse-grid wordmark for the header: aggregate the cell grid into 4x4
# supercells so the pixel texture survives at ~112px wide.
c = json.loads((src / "footer-wordmark-cells.json").read_text())
pitch, size = c["pitch"], c["cellSize"]
agg = 4
filled = {(round(p[0] / pitch), round(p[1] / pitch)) for p in c["cells"]}
maxc = max(x for x, _ in filled) // agg + 1
maxr = max(y for _, y in filled) // agg + 1
super_cells = [
    (col, r)
    for r in range(maxr)
    for col in range(maxc)
    if sum(
        (col * agg + dx, r * agg + dy) in filled
        for dx in range(agg)
        for dy in range(agg)
    )
    >= agg * agg * 0.45
]
sp = pitch * agg
ss = round(sp * CELL_RATIO, 2)
path = "".join(f"M{x * sp} {y * sp}h{ss}v{ss}h-{ss}z" for x, y in super_cells)
(pub / "wordmark-mark.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {maxc * sp} {maxr * sp}" '
    f'fill="currentColor"><path d="{path}"/></svg>'
)
print(f"wordmark-mark: {len(super_cells)} cells")

for icon in ["icon-folder.svg", "icon-file.svg"]:
    old = root.parents[2] / "public" / "lexis-lcd" / "sections" / icon
    if old.exists():
        (pub / icon).write_text(old.read_text())
        print(f"copied {icon}")
