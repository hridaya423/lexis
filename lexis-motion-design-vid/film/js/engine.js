(() => {
  const W = 1920, H = 1080;
  const C = { paper: "#c3dfa0", ink: "#182510", ink2: "#41582d", coral: "#ff735b", night: "#0e160a" };
  const RGB = Object.fromEntries(Object.entries(C).map(([k, v]) => [k, [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16))]));
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (f, a, b) => clamp((f - a) / (b - a));
  const E = {
    lin: (x) => x,
    qo: (x) => 1 - (1 - x) * (1 - x),
    co: (x) => 1 - Math.pow(1 - x, 3),
    ci: (x) => x * x * x,
    cio: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    qio: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
    eo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    ei: (x) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
    eio: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
    bo: (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2),
  };
  const tw = (f, a, b, from, to, ease = E.eio) => lerp(from, to, ease(seg(f, a, b)));
  const mix = (a, b, t) => {
    const A = RGB[a] || a, B = RGB[b] || b;
    return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`;
  };
  function hash(a, b = 0) {
    let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  // Departure Mono sits on an 11-unit em with a 7-unit advance: rasterise once, sample cell centres.
  const U = 10, ADV = 7;
  const raster = document.createElement("canvas");
  const rctx = raster.getContext("2d", { willReadFrequently: true });
  const cache = new Map();
  function glyphs(text) {
    if (cache.has(text)) return cache.get(text);
    raster.width = (text.length * ADV + 2) * U;
    raster.height = 15 * U;
    rctx.clearRect(0, 0, raster.width, raster.height);
    rctx.font = `${11 * U}px "Departure Mono"`;
    rctx.textBaseline = "alphabetic";
    rctx.fillStyle = "#000";
    rctx.fillText(text, 0, 11 * U);
    const d = rctx.getImageData(0, 0, raster.width, raster.height).data;
    const out = [];
    for (let r = 0; r < 15; r++)
      for (let c = 0; c < text.length * ADV; c++)
        if (d[((r * U + 5) * raster.width + c * U + 5) * 4 + 3] > 127) out.push({ c, r, i: Math.floor(c / ADV) });
    cache.set(text, out);
    return out;
  }

  // A text row on a global grid (pitch p, origin gx/gy). Cap band = rows 4..10, centred on cy.
  function row(text, { p, cx = W / 2, cy, x, gx = 0 }) {
    const width = (text.length * ADV - 2) * p;
    let x0 = x !== undefined ? x : cx - width / 2;
    x0 = gx + Math.round((x0 - gx) / p) * p;
    const y0 = cy - 7.5 * p;
    const c0 = Math.round((x0 - gx) / p);
    return {
      text, p, x0, y0, width,
      cells: glyphs(text).map((k) => ({ x: x0 + k.c * p + p / 2, y: y0 + k.r * p + p / 2, c: c0 + k.c, r: k.r, i: k.i })),
      charX: (i) => x0 + i * ADV * p,
    };
  }

  // Left-aligned multi-line block, vertically centred on cy. Cell rows are offset per line so flip keys stay unique.
  function block(lines, { p, x, cy, lead = 13, gx = 0, anchor = "center" }) {
    const span = (lines.length - 1) * lead * p;
    const top = anchor === "bottom" ? cy - span : cy - span / 2;
    let gi = 0;
    const rows = lines.map((t, li) => row(t, { p, x, cy: top + li * lead * p, gx }));
    const cells = rows.flatMap((R, li) => {
      const base = gi;
      gi += R.text.length;
      return R.cells.map((q) => ({ ...q, r: q.r + li * 100, gi: base + q.i }));
    });
    const last = rows[rows.length - 1];
    return {
      rows, cells, p, n: gi, x0: rows[0].x0,
      width: Math.max(...rows.map((R) => R.width)),
      top: top - 3.5 * p, bottom: top + (lines.length - 1) * lead * p + 3.5 * p,
      endX: last.charX(last.text.length), endCy: top + (lines.length - 1) * lead * p,
    };
  }

  function drawCells(ctx, list, p, fill = 0.84) {
    for (const q of list) {
      const s = q.px !== undefined ? q.px : p * fill * (q.s === undefined ? 1 : q.s) * (q.sz || 1);
      if (s <= 0.05 || q.a === 0) continue;
      ctx.globalAlpha = q.a === undefined ? 1 : q.a;
      ctx.fillStyle = q.col;
      ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  // Cells of B appear / cells of A vanish with a left-to-right refresh, like an LCD rewriting itself.
  function flip(A, B, f, f0, { spread = 12, jitter = 4, pop = 4, col = "ink", flash = "coral", flashLen = 3 } = {}) {
    const p = B.p || A.p, k = (q) => Math.round(q.x / p) + "," + Math.round(q.y / p);
    const keyA = new Map(A.cells.map((q) => [k(q), q]));
    const keyB = new Map(B.cells.map((q) => [k(q), q]));
    let xmin = Infinity, xmax = -Infinity;
    for (const q of [...A.cells, ...B.cells]) { xmin = Math.min(xmin, q.x); xmax = Math.max(xmax, q.x); }
    const out = [];
    const delay = (q) => f0 + (spread * (q.x - xmin)) / Math.max(1, xmax - xmin) + jitter * hash(Math.round(q.x), Math.round(q.y));
    for (const [key, q] of keyA) {
      if (keyB.has(key)) { out.push({ x: q.x, y: q.y, col: C[col] }); continue; }
      const d = delay(q), s = 1 - seg(f, d, d + pop);
      if (s > 0) out.push({ x: q.x, y: q.y, s: E.qo(s), col: C[col] });
    }
    for (const [key, q] of keyB) {
      if (keyA.has(key)) continue;
      const d = delay(q) + 1, u = seg(f, d, d + pop);
      if (u > 0) out.push({ x: q.x, y: q.y, s: E.bo(u), col: flash && f < d + flashLen ? C[flash] : C[col] });
    }
    return out;
  }

  // Type-on with a ghost head running two characters ahead (a16z-style), solid behind it.
  function typeOn(R, f, f0, perChar, { col = "ink", ghost = "ink2", ghostA = 0.45, lead = 2 } = {}) {
    const out = [];
    for (const q of R.cells) {
      const ti = f0 + (q.gi ?? q.i) * perChar;
      if (f >= ti) out.push({ x: q.x, y: q.y, col: C[col], s: E.bo(seg(f, ti, ti + 3)) });
      else if (f >= ti - lead * perChar) out.push({ x: q.x, y: q.y, col: C[ghost], a: ghostA });
    }
    return out;
  }

  // Pair source and target cells in reading order; the longer list sets the count so nothing pops in or out.
  function pairUp(S, T, key = (q) => q.x + q.y * 0.15) {
    const s = [...S].sort((a, b) => key(a) - key(b));
    const t = [...T].sort((a, b) => key(a) - key(b));
    const n = Math.max(s.length, t.length), res = [];
    for (let k = 0; k < n; k++) {
      res.push({ from: s[Math.min(s.length - 1, Math.floor((k * s.length) / n))], to: t[Math.min(t.length - 1, Math.floor((k * t.length) / n))], k: k / n });
    }
    return res;
  }

  function travel(pairs, f, f0, dur, { stagger = 14, arc = 60, ease = E.eio, pA, pB, fillA = 1.02, fillB = 0.92, colA = "ink", colB = "ink", seed = 1 } = {}) {
    const out = [];
    for (let n = 0; n < pairs.length; n++) {
      const { from, to, k } = pairs[n];
      const d = f0 + stagger * k + 3 * hash(n, seed);
      const u = ease(seg(f, d, d + dur));
      const bend = Math.sin(Math.PI * u) * arc * (hash(n, seed + 7) - 0.5);
      out.push({
        x: lerp(from.x, to.x, u) + bend, y: lerp(from.y, to.y, u) - Math.abs(bend) * 0.3,
        px: lerp(pA * fillA, pB * fillB, u), col: u < 1 ? mix(colA, colB, u) : C[colB],
      });
    }
    return out;
  }

  window.LX = { W, H, C, RGB, clamp, lerp, seg, E, tw, mix, hash, glyphs, row, block, drawCells, flip, typeOn, pairUp, travel, ADV };
})();
