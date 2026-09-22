import type { SpineSample, TipSample } from "./scene";

export function generateTip(
  spine: readonly SpineSample[],
  opts: { rise?: number; radiusScale?: number; fps?: number } = {},
): { tip: TipSample[]; tipAt: number } {
  const rise = opts.rise ?? 6;
  const rs = opts.radiusScale ?? 0.92;
  if (spine.length === 0) return { tip: [], tipAt: 0 };

  const first = Math.floor(spine[0][3]);
  const last = Math.ceil(spine[spine.length - 1][3]);
  const tip: TipSample[] = [];

  for (let f = first; f <= last; f++) {

    let i = 0;
    while (i < spine.length - 1 && spine[i + 1][3] < f) i++;
    const a = spine[i];
    const b = spine[Math.min(spine.length - 1, i + 1)];
    const span = b[3] - a[3];
    const t = span > 0 ? Math.min(1, Math.max(0, (f - a[3]) / span)) : 0;
    const x = a[0] + (b[0] - a[0]) * t;
    const y = a[1] + (b[1] - a[1]) * t;
    const r = (a[2] + (b[2] - a[2]) * t) * rs;
    tip.push([Math.round(x * 10) / 10, Math.round((y - rise) * 10) / 10, Math.round(r * 10) / 10]);
  }

  const head: TipSample[] = [];
  const p0 = tip[0];
  for (let i = 0; i < 3; i++) head.push([p0[0], p0[1], +(p0[2] * ((i + 1) / 4)).toFixed(1)]);
  const tail: TipSample[] = [];
  const pn = tip[tip.length - 1];
  for (let i = 0; i < 4; i++) tail.push([pn[0], pn[1], +(pn[2] * (1 - (i + 1) / 4)).toFixed(1)]);

  return { tip: [...head, ...tip, ...tail], tipAt: Math.max(0, first - 3) };
}

export function generateFlood(
  frames: number,
  opts: { scale?: number; swell?: number; holdFrac?: number } = {},
): { scale: number[]; swell: number[] } {
  const n = Math.max(2, Math.round(frames));
  const maxS = opts.scale ?? 3.94;
  const maxK = opts.swell ?? 2.4;
  const hold = opts.holdFrac ?? 0.6;

  const scale: number[] = [];
  const swell: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);

    const z = Math.pow(t, 2.6) * (1 - t) + (1 - Math.pow(1 - t, 2.2)) * t;
    scale.push(+(1 + (maxS - 1) * z).toFixed(3));

    const kt = t <= hold ? 0 : (t - hold) / (1 - hold);
    swell.push(+(1 + (maxK - 1) * Math.pow(kt, 1.7)).toFixed(3));
  }
  return { scale, swell };
}
