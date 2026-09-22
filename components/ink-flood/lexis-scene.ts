import { generateFlood, generateTip } from "./generate";
import type { Scene, SpineSample } from "./scene";

const FPS = 25;
const HALF = 72;

const EM = 280;
const CELL = 6;
const GAP = 0.18;
const THRESH = 0.3;
const BOLD = 0.05;

const WRITE_FROM = 4;
const WRITE_TO = 34;
const REST_AT = 40;
const FLOOD_AT = 49;
const FLOOD_END = 70;

const FIELDS: readonly [string, string] = ["#c3dfa0", "#182510"];
const DOT = "#ff735b";

const WORD = "lexis";

interface CellPt {
  x: number;
  y: number;
  gx: number;
  gy: number;
}

function seeded(seed: number, i: number): number {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function snakeOrder(cells: CellPt[], byCol: boolean): CellPt[] {
  const key = (c: CellPt) => (byCol ? c.gx : c.gy);
  const sub = (c: CellPt) => (byCol ? c.gy : c.gx);
  const lanes = new Map<number, CellPt[]>();
  for (const c of cells) {
    const lane = lanes.get(key(c));
    if (lane) lane.push(c);
    else lanes.set(key(c), [c]);
  }
  const out: CellPt[] = [];
  [...lanes.keys()].sort((a, b) => a - b).forEach((k, i) => {
    const lane = lanes.get(k)!.sort((a, b) => sub(a) - sub(b));
    if (i % 2) lane.reverse();
    out.push(...lane);
  });
  return out;
}

export function lexisScene(family: string, variant = 0): Scene | null {
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return null;
  const font = `400 ${EM}px ${family}`;
  measure.font = font;

  const advances: number[] = [];
  let total = 0;
  for (const ch of WORD) {
    advances.push(total);
    total += measure.measureText(ch).width;
  }
  const pad = Math.ceil(EM * 0.4);
  const W = Math.ceil(total + pad * 2);
  const H = Math.ceil(EM * 1.5);
  const baselineY = Math.round(EM * 1.08);

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.font = font;
  ctx.lineJoin = "round";
  ctx.lineWidth = EM * BOLD;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  const chars = [...WORD];
  for (let k = 0; k < chars.length; k++) {
    const x = pad + advances[k];
    ctx.strokeText(chars[k], x, baselineY);
    ctx.fillText(chars[k], x, baselineY);
  }
  const img = ctx.getImageData(0, 0, W, H).data;

  const gw = Math.ceil(W / CELL);
  const gh = Math.ceil(H / CELL);
  const bounds = chars.map((_, k) => pad + advances[k]);
  bounds.push(W);
  const glyphOf = (px: number) => {
    for (let k = 0; k < chars.length; k++) {
      const mid = (bounds[k] + bounds[k + 1]) / 2;
      if (px < mid) return k;
    }
    return chars.length - 1;
  };

  const perGlyph: CellPt[][] = chars.map(() => []);
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const cx = gx * CELL + CELL / 2;
      const cy = gy * CELL + CELL / 2;
      const px = Math.min(W - 1, Math.floor(cx));
      const py = Math.min(H - 1, Math.floor(cy));
      if (img[(py * W + px) * 4 + 3] / 255 < THRESH) continue;
      perGlyph[glyphOf(cx)].push({ x: cx, y: cy, gx, gy });
    }
  }
  const filled = perGlyph.reduce((n, g) => n + g.length, 0);
  if (filled < 20) return null;

  type Raw = [number, number, number];
  const raw: Raw[] = [];
  let prev: CellPt | null = null;
  const R = (CELL * (1 - GAP)) / 2;
  for (let g = 0; g < chars.length; g++) {
    const cells = snakeOrder(perGlyph[g], variant === 0);
    for (const cell of cells) {
      if (prev) {
        const d = Math.hypot(cell.gx - prev.gx, cell.gy - prev.gy);
        if (d > 1.9) {
          raw.push([prev.x, prev.y, 0]);
          raw.push([cell.x, cell.y, 0]);
        }
      }
      raw.push([cell.x, cell.y, R]);
      prev = cell;
    }
  }

  const dt = (WRITE_TO - WRITE_FROM) / raw.length;
  const seedBase = variant === 1 ? 97 : 41;
  const spine: SpineSample[] = raw.map(([x, y, r], i) => [
    Math.round(x * 10) / 10,
    Math.round(y * 10) / 10,
    Math.round(r * (0.99 + seeded(seedBase, i) * 0.02) * 10) / 10,
    Math.round((WRITE_FROM + i * dt) * 100) / 100,
  ]);

  const { tip, tipAt } = generateTip(spine, { rise: 6, radiusScale: 1.8 });
  const { scale, swell } = generateFlood(FLOOD_END - FLOOD_AT + 1, {
    scale: 5.0,
    swell: 3.0,
    holdFrac: 0.55,
  });

  return {
    id: variant === 1 ? "lexis-b" : "lexis",
    name: "lexis",
    size: { w: W, h: H },
    fps: FPS,
    half: HALF,
    restAt: REST_AT,
    palette: { fields: FIELDS, dot: DOT },
    spine,
    tip,
    tipAt,
    flood: { at: FLOOD_AT, end: FLOOD_END, scale, swell, ease: "drift" },
    sparks: {
      offset: [0.44, -0.3],
      popAt: 43,
      pop: [2.0, 9.2, 13.0, 15.1, 16.4, 17.3],
      radius: 18,
      diverge: [
        1.0, 1.06, 1.15, 1.26, 1.47, 1.73, 2.15, 2.73, 3.56, 4.64, 5.23,
        5.59, 5.79, 5.91, 6.0, 6.06, 6.09, 6.1, 6.12, 6.12, 6.12, 6.12,
      ],
      shrinkAt: 65,
      shrink: [17.2, 15.8, 13.7, 10.7, 6.4, 0],
      ease: "surge",
    },
  };
}
