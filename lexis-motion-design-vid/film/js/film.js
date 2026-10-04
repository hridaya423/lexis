window.LX_BUILD = new Promise((resolve) => {
  const start = () => resolve(build());
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
});

function build() {
  return document.fonts.load('110px "Departure Mono"')
    .then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))
    .then(setup);
}

function setup() {
  const { W, H, C, clamp, lerp, seg, E, tw, mix, hash, row, block, drawCells, flip, typeOn, pairUp, travel } = LX;
  const $ = (id) => document.getElementById(id);
  const under = $("under").getContext("2d");
  const over = $("over").getContext("2d");
  const bg = $("bg"), grid = $("grid"), cur = $("cur"), demo = $("demo"), key = $("key");
  const FILL = 0.92;

  // ---------- managed media ----------
  const boxes = {
    eniac: [0, 0, W, H], card: [360, 90, 1200, 900], tape: [150, 250, 720, 540], pen: [1050, 290, 720, 540],
    binary: [0, 0, W, H], hamilton: [600, 90, 720, 900], scope: [560, 140, 800, 800], bino: [0, 0, W, H],
    saturn: [0, 0, W, H], boot: [0, 0, W, H], earth: [600, 40, 720, 720], chip: [0, 0, W, H],
    brain: [540, 0, 840, 840], probe: [0, 0, W, H], fludd: [182, 0, 1555, 1080],
  };
  const OPEN = [[30, "st_typewriter", 1868], [32, "st_flyer", 1869], [34, "st_telephone", 1876], [36, "st_phono", 1878],
    [38, "st_calc", 1888], [40, "st_marconi", 1900], [42, "st_valve", 1905], [44, "st_zuse", 1941], [46, "eniac", 1946]];
  const FLASH = [[57, 60, "fl_univac", 1951], [79, 82, "fl_7090", 1959], [97, 100, "fl_ibm360", 1964],
    [113, 116, "fl_keypunch", 1966], [127, 130, "x_hu_edwhite", 1968], [139, 142, "x_hu_ibm_women", 1969],
    [151, 155, "rl_countdown", 1969], [155, 159, "rl_glenn", 1969], [178, 181, "x_hu_spectators", 1969],
    [189, 193, "x_hu_moonwalk", 1969], [193, 196, "rl_orbit", 1969], [221, 225, "x_hu_mcc_celebrate", 1969],
    [240, 242, "x_e8_pong", 1972], [247, 249, "x_e8_skylab", 1973], [254, 256, "x_e8_voyager", 1977], [260, 262, "x_e8_pet", 1977],
    [266, 268, "x_e8_columbia", 1981], [272, 274, "x_e8_ibmpc", 1981], [277, 279, "x_e8_dynatac", 1983], [282, 284, "x_e8_mac", 1984],
    [287, 289, "x_e8_hubble90", 1990], [292, 294, "x_hu_launchcrowd", 1990], [297, 299, "fl_terminal", 1990], [301, 303, "rl_capsule", 1991],
    [309, 311, "fl_bigboard", 1991], [314, 316, "rl_countdown", 1991]];
  const FB = [[334, "fb_server", 1991], [338, "fb_mosaic", 1993], [342, "fb_iss", 1998], [345, "fb_pleiades", 2008],
    [348, "fb_mars", 2012], [351, "fb_falcon", 2015], [354, "fb_datacenter", 2017], [356, "fb_die", 2019],
    [358, "fb_gpu", 2020], [360, "fb_hubble", 2021], [362, "fb_frontier", 2022], [364, "fb_wafer", 2024]];
  for (const [, id] of [...OPEN, ...FB]) if (!boxes[id]) boxes[id] = [0, 0, W, H];
  for (const [, , id] of FLASH) boxes[id] = [0, 0, W, H];
  const media = {};
  for (const [k, b] of Object.entries(boxes)) {
    const el = $("w-" + k);
    Object.assign(el.style, { left: b[0] + "px", top: b[1] + "px", width: b[2] + "px", height: b[3] + "px" });
    media[k] = { el, z: el.firstElementChild, b };
  }
  const thumbs = [...Array(16)].map((_, i) => $("t" + i));

  function show(k, { o = 1, s = 1, x = 0, y = 0, clip = "none", zs = 1, zx = 0, zy = 0 } = {}) {
    const m = media[k];
    m.el.style.display = o > 0 ? "block" : "none";
    m.el.style.opacity = o;
    m.el.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    m.el.style.clipPath = clip;
    m.z.style.transform = `translate(${zx}px,${zy}px) scale(${zs})`;
  }
  const hideAll = () => {
    for (const k in media) media[k].el.style.display = "none";
    for (const t of thumbs) t.style.display = "none";
    demo.style.display = "none";
    key.style.display = "none";
  };
  const inset = (x, y, w, h, b) => `inset(${y - b[1]}px ${b[0] + b[2] - x - w}px ${b[1] + b[3] - y - h}px ${x - b[0]}px)`;

  // ---------- cursor ----------
  // holds [from, to, x, y, w, h]; between holds the cursor glides on an expo in-out
  const CS = 28, HOME = { x: 938, y: 500, w: 44, h: 80 };
  const CUR = [
    [44, 58, 1316, 404, CS, CS],
    [63, 80, 1052, 455, CS, CS],
    [85, 98, 1286, 520, CS, CS],
    [103, 114, 750, 466, CS, CS],
    [119, 128, 1040, 140, CS, CS],
    [133, 140, 1116, 520, CS, CS],
    [145, 157, 1188, 406, CS, CS],
  ];
  const blinkOff = [[10, 17], [490, 497], [850, 865], [880, 895]];
  function holdPath(keys, f) {
    for (let i = 0; i < keys.length; i++) {
      const [a, b, x, y, w, h] = keys[i];
      if (f >= a && f <= b) return { x, y, w, h };
      const n = keys[i + 1];
      if (n && f > b && f < n[0]) {
        const u = E.eio(seg(f, b, n[0]));
        return { x: lerp(x, n[2], u), y: lerp(y, n[3], u) - Math.sin(Math.PI * u) * 40, w: lerp(w, n[4], u), h: lerp(h, n[5], u) };
      }
    }
    return null;
  }
  const glide = (A, B, u, lift = 0) => ({ x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u) - Math.sin(Math.PI * u) * lift, w: lerp(A.w, B.w, u), h: lerp(A.h, B.h, u) });
  function drawCursor(r, col, alpha) {
    if (!r || alpha <= 0) { cur.style.visibility = "hidden"; return; }
    Object.assign(cur.style, {
      visibility: "visible", opacity: alpha, background: col,
      width: r.w + "px", height: r.h + "px", transform: `translate(${r.x}px,${r.y}px)`,
    });
  }
  const blinking = (f) => blinkOff.some(([a, b]) => f >= a && f < b);

  // ---------- readout plate (bottom-left LCD) ----------
  const PP = 16, PX = 96, PBOT = 984, PAD = 34, TX = PX + PAD + 4;
  const plate = (lines) => block(lines, { p: PP, x: TX, gx: TX, cy: PBOT - PAD - 3.5 * PP, anchor: "bottom" });
  const R = {
    reached: plate(["We reached"]), moon: plate(["the moon."]), wired: plate(["We wired"]), world: plate(["the world."]),
    taught: plate(["We taught sand"]), think: plate(["to think."]), still: plate(["We still", "memorize"]),
  };
  const plateRect = (B) => [PX, B.top - PAD, B.width + 2 * PAD + 8 * PP, PBOT - (B.top - PAD)];
  const SEQ = [
    [159, "reached"], [196, "moon"], [232, "wired"], [268, "world"], [304, "taught"], [340, "think"], [377, "still"],
  ];
  function plateState(f) {
    let i = 0;
    while (i + 1 < SEQ.length && f >= SEQ[i + 1][0]) i++;
    const [f0, name] = SEQ[i], B = R[name], A = i > 0 ? R[SEQ[i - 1][1]] : null;
    const ra = A ? plateRect(A) : plateRect(B), rb = plateRect(B), u = A ? E.eio(seg(f, f0, f0 + 9)) : 1;
    const rect = ra.map((v, k) => lerp(v, rb[k], u));
    const pcA = A ? plateCursor(A) : plateCursor(B), pcB = plateCursor(B);
    return { f0, A, B, rect, first: i === 0, cur: glide(pcA, pcB, u) };
  }
  function plateCursor(B, p = PP) { return { x: B.endX + p, y: B.endCy - 3.5 * p, w: 5 * p, h: 7 * p }; }

  // ---------- year readout (top-right) ----------
  const YP = 10, YW = 26 * YP + 56, YXR = W - 96 - YW, YY = 84, YH = 7 * YP + 48;
  const yearRow = (y) => row(String(y), { p: YP, x: YXR + 28, gx: YXR + 28, cy: YY + YH / 2 });
  function yearAt(f) {
    const shots = [...OPEN.map(([a, , y]) => [a, y]), [57, 1951], [60, 1956], [79, 1959], [82, 1962], [97, 1964], [100, 1965],
      [113, 1966], [116, 1967], [127, 1968], [139, 1969]];
    if (f < 232) { let y = 1868; for (const [a, v] of shots) if (f >= a) y = v; return y; }
    if (f < 304) return Math.round(lerp(1969, 1991, E.co(seg(f, 232, 300))));
    if (f < 334) return 1991;
    if (f >= 366) return 2026;
    let y = 1991; for (const [a, , v] of FB) if (f >= a) y = v; return y;
  }
  function drawYear(ctx, f, alpha) {
    if (alpha <= 0) return;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = C.ink;
    ctx.fillRect(YXR, YY, YW, YH);
    ctx.globalAlpha = 1;
    const y = yearAt(f), prev = yearAt(f - 3);
    const cells = y === prev || Math.abs(y - prev) > 1 || f < 60 || (f >= 330 && f < 370)
      ? yearRow(y).cells.map((q) => ({ ...q, col: C.paper }))
      : flip(yearRow(prev), yearRow(y), f, f - 3, { spread: 2, jitter: 1, pop: 3, col: "paper", flash: "coral", flashLen: 2 });
    drawCells(ctx, cells.map((q) => ({ ...q, a: alpha })), YP, FILL);
  }

  // ---------- paint ----------
  function arc(ctx, cx, cy, rx, ry, rot, p, col, lw, start = -Math.PI / 2, sweep = Math.PI * 2.08) {
    if (p <= 0) return;
    ctx.save();
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, rot, start, start + sweep * p);
    ctx.stroke();
    ctx.restore();
  }
  function line(ctx, x1, y1, x2, y2, p, col, lw) {
    if (p <= 0) return;
    ctx.save();
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); ctx.stroke();
    ctx.restore();
  }
  function brackets(ctx, x, y, w, h, p, col, len = 30, lw = 3) {
    if (p <= 0) return;
    const l = len * p;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = "square";
    ctx.beginPath();
    ctx.moveTo(x, y + l); ctx.lineTo(x, y); ctx.lineTo(x + l, y);
    ctx.moveTo(x + w - l, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + l);
    ctx.moveTo(x + w, y + h - l); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - l, y + h);
    ctx.moveTo(x + l, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - l);
    ctx.stroke(); ctx.restore();
  }

  // ---------- orbits ----------
  const EC = [960, 400];
  const ORB = [
    { rx: 640, ry: 150, rot: -0.2, w: 0.022, ph: 0.3, th: [0, 1, 2, 3, 4] },
    { rx: 820, ry: 240, rot: 0.14, w: -0.017, ph: 2.1, th: [5, 6, 7, 8, 9] },
    { rx: 520, ry: 310, rot: 0.55, w: 0.028, ph: 4.0, th: [10, 11, 12, 13, 14, 15] },
  ];
  const thumbSize = [[210, 186], [200, 133], [180, 140], [230, 170], [200, 170], [170, 147], [140, 187], [170, 170],
    [220, 165], [230, 119], [200, 150], [170, 200], [150, 200], [180, 180], [200, 150], [170, 134]];
  const orbitPt = (o, th) => {
    const ox = Math.cos(th) * o.rx, oy = Math.sin(th) * o.ry;
    return [EC[0] + ox * Math.cos(o.rot) - oy * Math.sin(o.rot), EC[1] + ox * Math.sin(o.rot) + oy * Math.cos(o.rot)];
  };
  function drawOrbits(f, zoom) {
    const local = f - 231;
    const z = (x, y) => [EC[0] + (x - EC[0]) * zoom, EC[1] + (y - EC[1]) * zoom];
    ORB.forEach((o, k) => {
      const p = E.eio(seg(f, 233 + k * 3, 252 + k * 3));
      under.save(); over.save();
      for (const ctx of [under, over]) { ctx.translate(EC[0], EC[1]); ctx.scale(zoom, zoom); ctx.translate(-EC[0], -EC[1]); }
      arc(under, EC[0], EC[1], o.rx, o.ry, o.rot, p, C.ink, 2 / zoom, Math.PI, Math.PI * 1.04);
      arc(over, EC[0], EC[1], o.rx, o.ry, o.rot, p, C.ink, 2 / zoom, 0, Math.PI * 1.04);
      under.restore(); over.restore();
      o.th.forEach((ti, n) => {
        const th = o.ph + (n * Math.PI * 2) / o.th.length + o.w * local * 2;
        const [x, y] = z(...orbitPt(o, th));
        const depth = Math.sin(th);
        const s = lerp(0.55, 1.0, (depth + 1) / 2) * zoom * E.bo(seg(f, 236 + k * 3 + n * 2, 244 + k * 3 + n * 2));
        const el = thumbs[ti], [w, h] = thumbSize[ti];
        Object.assign(el.style, {
          display: s > 0 ? "block" : "none", width: w + "px", height: h + "px", zIndex: depth > 0 ? 3 : 1,
          transform: `translate(${x - w / 2}px,${y - h / 2}px) scale(${s})`,
        });
      });
    });
    media.earth.el.style.zIndex = 2;
  }

  // ---------- memory theatre (Fludd) ----------
  const FK = 1.08, FX = 182;
  const fl = (x, y, w, h) => [FX + x * FK, y * FK, w * FK, h * FK];
  const PANELS = [
    { r: fl(648, 160, 250, 196), t: "tar -xzvf", f0: 381 },
    { r: fl(648, 362, 250, 210), t: "chmod 755", f0: 386 },
    { r: fl(905, 160, 246, 412), t: "2>&1", f0: 391 },
    { r: fl(1156, 152, 244, 198), t: "rebase -i", f0: 396 },
    { r: fl(1156, 356, 244, 210), t: "kill -9", f0: 401 },
  ];
  const EYE = [FX + 166 * FK, 232 * FK];

  // ---------- slam + swarm ----------
  const TP = 24, TAR = row("tar -xzvf", { p: TP, cx: 840, cy: 520 });
  const FLAGS = ["-xzvf", "chmod 755", "2>&1", "--force", "awk '{print $2}'", "sed -i ''", "xargs -0", "kill -9",
    "| grep -v", "ssh -L 8080:localhost:80", "find . -name", "-rf", "lsof -i", "ps aux", "--no-preserve-root",
    "du -sh *", ":wq!", "git rebase -i HEAD~3", "ln -s", "tar -cvzf", "| sort | uniq -c", "chown -R", "nohup &",
    "ffmpeg -ss", "-exec {} \\;", "curl -fsSL", "dd if=/dev/zero", "rsync -avz", "iptables -A", "--depth 1",
    "export PATH=", "2>/dev/null", "crontab -e", "git stash pop", "netstat -tulpn", "sudo !!", "-maxdepth 2",
    "grep -rn", "head -n 20", "wc -l", "tail -f", "umask 022", "scp -r", "systemctl", "jq '.[]'", "tr -d"];
  const WALL = [];
  {
    const rowsN = 23, step = 46, y0 = 540 - ((rowsN - 1) * step) / 2;
    for (let r = 0; r < rowsN; r++) {
      let text = "", k = r * 7;
      while (text.length < 140) text += FLAGS[k++ % FLAGS.length] + "   ";
      const y = y0 + r * step, d = Math.abs(y - 520) / 540;
      WALL.push({ text, y, x: -40 - Math.floor(hash(r, 2) * 12) * 18, f0: 415 + 46 * Math.pow(d, 0.8) + hash(r, 8) * 3, hi: hash(r, 4) < 0.3 });
    }
  }

  // ---------- asks ----------
  // English is typed big at the prompt; on Return its letters fall into the command line below.
  const EF = 116, CF = 104, EA = (EF * 7) / 11, CA = (CF * 7) / 11, DX = 96, TXE = DX + 2 * EA, TXC = TXE;
  const E_TOP = 300, C_TOP = 560, HIST = 124, ES = EF / CF;
  const ASKS = [
    { a: 520, q: "unpack this archive", cmd: "tar -xzvf archive.tar.gz", type: 1.3, press: 551, morph: 556, mdur: 24 },
    { a: 598, q: "what's on port 3000", cmd: "lsof -i :3000", type: 0.9, press: 622, morph: 627, mdur: 16 },
    { a: 650, q: "undo my last commit", cmd: "git reset --soft HEAD~1", type: 1.0, press: 675, morph: 681, mdur: 14 },
  ];
  function lcs(a, b) {
    const n = a.length, m = b.length, d = [...Array(n + 1)].map(() => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
      d[i][j] = a[i] === b[j] && a[i] !== " " ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
    const pairs = [];
    for (let i = 0, j = 0; i < n && j < m;) {
      if (a[i] === b[j] && a[i] !== " ") { pairs.push([i, j]); i++; j++; }
      else if (d[i + 1][j] >= d[i][j + 1]) i++; else j++;
    }
    return pairs;
  }
  const mkSpan = (c) => { const s = document.createElement("span"); s.className = "ch"; s.textContent = c; demo.appendChild(s); return s; };
  const promptEl = mkSpan(">");
  const lines = ASKS.map((ask, n) => {
    const pairs = lcs(ask.q, ask.cmd);
    const srcTo = new Map(pairs), dstFrom = new Map(pairs.map(([i, j]) => [j, i]));
    return {
      ask, n,
      src: [...ask.q].map((c, i) => ({ c, i, el: mkSpan(c), to: srcTo.get(i) })),
      dst: [...ask.cmd].map((c, j) => ({ c, j, el: dstFrom.has(j) ? null : mkSpan(c) })),
    };
  });
  const GLY = "abcdefghijklmnopqrstuvwxyz-./:~*|01";
  const cmdY = (n, f) => {
    let y = C_TOP;
    for (let m = n + 1; m < ASKS.length; m++) y += HIST * E.eio(seg(f, ASKS[m].morph - 2, ASKS[m].morph + 9));
    return y;
  };
  const DOM_CY = 0.6705 * CF;
  const put = (el, x, y, sc, o = 1) => { el.style.visibility = o > 0 ? "visible" : "hidden"; el.style.opacity = o; el.style.transform = `translate(${x}px,${y}px) scale(${sc})`; };
  const curBox = (x, top, F) => ({ x, y: top + 0.27 * F * 1.25 / 1.25, w: 0.7 * (F * 7) / 11, h: 0.72 * F });

  // ---------- headline + logo ----------
  const HL = block(["In your", "own words."], { p: 20, x: 960 - 34 * 20, gx: 960 - 34 * 20, cy: 540 });
  const LOGO_SCALE = 1240 / LOGO.w, LOGO_P = LOGO.pitch * LOGO_SCALE;
  const LX0 = 960 - (LOGO.w * LOGO_SCALE) / 2 - 36, LY0 = 540 - (LOGO.h * LOGO_SCALE) / 2;
  const logoCells = LOGO.cells.map(([x, y]) => ({ x: LX0 + (x + LOGO.cell / 2) * LOGO_SCALE, y: LY0 + (y + LOGO.cell / 2) * LOGO_SCALE }));
  const LOGO_CUR = { x: LX0 + 792 * LOGO_SCALE, y: LY0 + 65 * LOGO_SCALE, w: 50 * LOGO_SCALE, h: 199 * LOGO_SCALE };
  let pairsHL = null, pairsLogo = null;

  // ---------- render ----------
  function render(f) {
    hideAll();
    under.clearRect(0, 0, W, H);
    over.clearRect(0, 0, W, H);
    let ground = C.night, gridA = 0, curR = null, curCol = C.coral, curA = 1;

    if (f < 60) {
      // cold open: cursor blinks, stretches to a slit, opens into the first frame
      if (f < 22) curR = HOME;
      else if (f < 30) {
        const u = E.ei(seg(f, 22, 30)), w = lerp(HOME.w, 1200, u), h = lerp(HOME.h, 6, u);
        curR = { x: 960 - w / 2, y: 540 - h / 2, w, h };
      }
      if (f >= 30) {
        const u1 = E.eo(seg(f, 30, 40)), u2 = E.eio(seg(f, 40, 52));
        const w = lerp(1200, W, u2), h = lerp(lerp(6, 675, u1), H, u2), r = [960 - w / 2, 540 - h / 2, w, h];
        let id = "eniac";
        for (const [a, k] of OPEN) if (f >= a) id = k;
        const fl0 = FLASH.find(([a, b]) => f >= a && f < b);
        if (fl0) id = fl0[2];
        show(id, { clip: inset(...r, boxes[id]), zs: id === "eniac" ? tw(f, 46, 60, 1.12, 1.04, E.eo) : id.startsWith("st_") ? 1.35 : 1.06 });
        const fl = 1 - seg(f, 30, 40);
        if (fl > 0) { over.strokeStyle = C.coral; over.lineWidth = 10 * fl; over.strokeRect(r[0] + 5 * fl, r[1] + 5 * fl, r[2] - 10 * fl, r[3] - 10 * fl); }
        if (f >= 44) curR = holdPath(CUR, f);
        else if (f >= 37) curR = glide(HOME, { x: 1316, y: 404, w: CS, h: CS }, E.eio(seg(f, 37, 44)), 60);
      }
    } else if (f < 159 && FLASH.some(([a, b]) => f >= a && f < b)) {
      const [a, , id] = FLASH.find(([a, b]) => f >= a && f < b);
      show(id, { zs: tw(f, a, a + 3, 1.1, 1.04, E.lin) });
      curR = holdPath(CUR, f);
    } else if (f < 159) {
      // acceleration montage
      if (f < 82) {
        ground = C.paper; gridA = 1;
        show("card", { zs: tw(f, 60, 74, 1.24, 1.0, E.eo) });
        brackets(over, 360 - 18, 90 - 18, 1236, 936, E.eo(seg(f, 61, 70)), C.ink);
      } else if (f < 100) {
        ground = C.ink;
        const a = lerp(0.3, 1, E.eo(seg(f, 82, 88))), b = lerp(0.3, 1, E.eo(seg(f, 86, 92))), T = boxes.tape, Pn = boxes.pen;
        show("tape", { clip: inset(T[0], T[1], T[2] * a, T[3], T), zs: tw(f, 82, 100, 1.1, 1.0, E.lin) });
        if (f >= 86) show("pen", { clip: inset(Pn[0] + Pn[2] * (1 - b), Pn[1], Pn[2] * b, Pn[3], Pn), zs: tw(f, 86, 100, 1.12, 1.0, E.lin) });
      } else if (f < 116) {
        show("binary", { zs: tw(f, 100, 116, 1.16, 1.0, E.eo) });
        brackets(over, 700, 418, 128, 124, E.eo(seg(f, 102, 109)), C.coral, 22, 3);
      }
      else if (f < 130) {
        ground = C.paper; gridA = 1;
        const Hb = boxes.hamilton, a = lerp(0.3, 1, E.eo(seg(f, 116, 122)));
        show("hamilton", { clip: inset(Hb[0], Hb[1] + Hb[3] * (1 - a), Hb[2], Hb[3] * a, Hb), zs: tw(f, 116, 130, 1.14, 1.02, E.eo) });
        brackets(over, 600 - 18, 90 - 18, 756, 936, E.eo(seg(f, 118, 126)), C.ink);
      } else if (f < 142) {
        const r = 400 * lerp(0.3, 1, E.eo(seg(f, 130, 137)));
        show("scope", { clip: `circle(${r}px at 50% 50%)`, zs: tw(f, 130, 142, 1.22, 1.05, E.eo) });
        arc(over, 960, 540, 430, 430, 0, E.eio(seg(f, 131, 141)), C.paper, 2.5);
      } else {
        show("bino", { zs: tw(f, 142, 159, 1.0, 1.08, E.lin) });
        over.save(); over.setLineDash([2, 14]);
        over.setLineDash([14, 12]);
        line(over, 1214, 420, 1700, 40, E.eio(seg(f, 143, 150)), C.coral, 4);
        over.restore();
      }
      curR = holdPath(CUR, f);
    } else if (f < 375) {
      // history, told on the readout plate
      let zoomEarth = 1;
      const fl1 = FLASH.find(([a, b]) => f >= a && f < b);
      if (fl1) show(fl1[2], { zs: tw(f, fl1[0], fl1[0] + 3, 1.1, 1.04, E.lin) });
      else if (f < 196) {
        show("saturn", { zs: tw(f, 159, 196, 1.08, 1.0, E.co) });
        const u = E.eio(seg(f, 163, 190));
        over.save(); over.setLineDash([3, 16]);
        line(over, 1330, 720, 1330, 300, u, C.paper, 4);
        over.restore();
        arc(over, 1330, 262, 36, 36, 0, E.eo(seg(f, 184, 194)), C.paper, 3);
      }
      else if (f < 231) {
        show("boot", { zs: tw(f, 196, 231, 1.0, 1.1, E.lin) });
        const k = tw(f, 196, 231, 1.0, 1.1, E.lin);
        arc(over, 960 + (990 - 960) * k, 540 + (400 - 540) * k, 330 * k, 440 * k, 0.5, E.eio(seg(f, 200, 216)), C.ink, 4, -2.4);
      } else if (f < 304) {
        ground = C.paper; gridA = 1;
        zoomEarth = f < 268 ? 1 : tw(f, 268, 304, 1.0, 1.18, E.cio);
        show("earth", { s: tw(f, 231, 262, 0.92, 1.0, E.co) * zoomEarth, y: (1 - zoomEarth) * 0 });
        drawOrbits(f, zoomEarth);
      } else {
        ground = C.paper; gridA = 1;
        if (f < 326) show("brain", { s: f < 318 ? tw(f, 304, 318, 0.98, 1.04, E.lin) : tw(f, 318, 326, 1.04, 6, E.ei), o: f < 322 ? 1 : 1 - seg(f, 322, 326) });
        if (f >= 318 && f < 334) show("chip", { zs: tw(f, 318, 334, 0.24, 1.06, E.eo), o: seg(f, 318, 321) });
        if (f >= 334 && f < 366) {
          let id = FB[0][1], a0 = 334;
          for (const [a, k] of FB) if (f >= a) { id = k; a0 = a; }
          show(id, { zs: tw(f, a0, a0 + 4, 1.12, 1.04, E.lin) });
          ground = C.night; gridA = 0;
        }
        if (f >= 366) show("probe", { zs: tw(f, 366, 375, 1.06, 1.0, E.eo) });
      }
      const st = plateState(f);
      const wipe = st.first ? E.eio(seg(f, 159, 168)) : 1;
      const [rx, ry, rw, rh] = st.rect;
      over.fillStyle = C.ink;
      over.fillRect(rx, ry, rw * wipe, rh);
      const cells = st.first ? typeOn(st.B, f, 165, 2.0, { col: "paper", lead: 0 }) : flip(st.A, st.B, f, st.f0, { spread: 7, jitter: 3, col: "paper" });
      drawCells(over, cells, PP, FILL);

      const pc = plateCursor(st.B);
      if (f < 196) {
        const n = clamp(Math.floor((f - 165) / 2) + 1, 0, 10);
        curR = f < 165 ? { ...pc, x: lerp(PX, TX, E.eo(seg(f, 159, 165))) } : { ...pc, x: TX + n * 7 * PP + PP };
      } else if (f < 231) {
        const boot = { x: 1010, y: 360, w: CS, h: CS };
        curR = f < 201 ? plateCursor(R.moon) : glide(plateCursor(R.moon), boot, E.eio(seg(f, 201, 211)), 120);
      } else if (f < 304) {
        const o = ORB[0], th = o.ph + o.w * (f - 231) * 2 + 2.2;
        const [ox, oy] = orbitPt(o, th);
        const sat = { x: EC[0] + (ox - EC[0]) * zoomEarth - CS / 2, y: EC[1] + (oy - EC[1]) * zoomEarth - CS / 2, w: CS, h: CS };
        curR = f < 240 ? glide({ x: 1010, y: 360, w: CS, h: CS }, sat, E.eio(seg(f, 231, 240)), 80) : sat;
      } else {
        curR = st.cur;
      }
    } else if (f < 483) {
      // punchline: the memory theatre, then the slam, then the noise collapses into the cursor
      // CRT power-off: the picture squashes to a beam, the beam to a dot, the dot is the cursor
      const imp = 0, ICX = 960, ICY = 540;
      const sy = f < 465 ? 1 : lerp(1, 0.004, E.ei(seg(f, 465, 474))), sx = f < 474 ? 1 : lerp(1, 0.012, E.ei(seg(f, 474, 481)));
      const toC = (x, y) => [x, y];
      if (f < 411) {
        show("fludd", { zs: tw(f, 375, 411, 1.0, 1.06, E.lin) });
        const zk = tw(f, 375, 411, 1.0, 1.06, E.lin);
        const zf = (x, y) => [960 + (x - 960) * zk, 540 + (y - 540) * zk];
        for (const P of PANELS) {
          const u = E.eo(seg(f, P.f0, P.f0 + 5));
          if (u <= 0) continue;
          const [x, y] = zf(P.r[0], P.r[1]), w = P.r[2] * zk, h = P.r[3] * zk;
          over.fillStyle = C.night;
          over.fillRect(x + 4, y + 4 + (h - 8) * (1 - u), w - 8, (h - 8) * u);
          over.font = `${Math.round(40 * zk)}px "Departure Mono"`;
          over.textAlign = "center"; over.textBaseline = "middle";
          over.fillStyle = f < P.f0 + 3 ? C.coral : C.paper;
          if (u > 0.6) over.fillText(P.t, x + w / 2, y + h / 2);
          const [ex, ey] = zf(...EYE);
          line(over, ex + 30, ey, x, y + h / 2, E.eio(seg(f, P.f0 - 3, P.f0 + 2)), C.coral, 2);
        }
        const st = plateState(f), [rx, ry, rw, rh] = st.rect;
        over.fillStyle = C.ink;
        over.fillRect(rx, ry, rw, rh);
        drawCells(over, flip(st.A, st.B, f, st.f0, { spread: 8, jitter: 3, col: "paper" }), PP, FILL);
        const [ex, ey] = zf(...EYE);
        const eye = { x: ex - CS / 2 - 4, y: ey - CS / 2, w: CS, h: CS };
        curR = f < 380 ? plateCursor(R.think) : glide(plateCursor(R.think), eye, E.eio(seg(f, 380, 389)), 100);
        if (f >= 389) curR = eye;
      } else {
        // the wall: every flag you were ever told to remember, flooding outward from the slam
        over.save();
        over.translate(960, 540); over.scale(sx, sy); over.translate(-960, -540);
        over.font = '33px "Departure Mono"'; over.textBaseline = "middle"; over.textAlign = "left";
        for (const w of WALL) {
          if (f < w.f0) continue;
          const n = Math.floor(w.text.length * E.co(seg(f, w.f0, w.f0 + 5)));
          over.fillStyle = f < w.f0 + 2 ? C.coral : w.hi ? C.paper : C.ink2;
          over.fillText(w.text.slice(0, n), w.x, w.y);
        }
        const u = E.eo(seg(f, 411, 418)), sc = lerp(1.22, 1, u);
        const [tx, ty, tw2, th2] = [TAR.x0 - 40, 520 - 3.5 * TP - 34, TAR.width + 80 + 6 * TP, 7 * TP + 68];
        over.fillStyle = C.night;
        const sc0 = lerp(1.22, 1, u), TCX = TAR.x0 + TAR.width / 2 + 3 * TP;
        const P2 = (x, y) => { const [a2, b2] = [TCX + (x - TCX) * sc0, 520 + (y - 520) * sc0]; return [lerp(a2, ICX, imp), lerp(b2, ICY, imp)]; };
        const [r1x, r1y] = P2(tx, ty);
        over.fillRect(r1x, r1y, tw2 * sc, th2 * sc);
        drawCells(over, TAR.cells.map((q) => { const [x, y] = P2(q.x, q.y); return { x, y, col: C.paper, s: sc }; }), TP, FILL);
        if (f < 413) {
          over.fillStyle = C.paper; over.fillRect(0, 0, W, H);
          drawCells(over, TAR.cells.map((q) => { const [x, y] = P2(q.x, q.y); return { x, y, col: C.night, s: sc }; }), TP, FILL);
        }
        const tc = { x: TAR.charX(9) + TP, y: 520 - 3.5 * TP, w: 5 * TP, h: 7 * TP };
        const tc0 = { x: TCX + (tc.x - TCX) * sc0, y: 520 + (tc.y - 520) * sc0, w: tc.w * sc0, h: tc.h * sc0 };
        if (f < 465) { over.restore(); curR = tc0; }
        else {
          // the collapsing picture brightens into a beam
          const glow = seg(f, 466, 474);
          over.globalAlpha = 0.85 * glow; over.fillStyle = C.paper; over.fillRect(0, 0, W, H); over.globalAlpha = 1;
          over.restore();
          if (f >= 481) {
            const u2 = E.eo(seg(f, 481, 483));
            curR = { x: lerp(960 - 12, HOME.x, u2), y: lerp(540 - 6, HOME.y, u2), w: lerp(24, HOME.w, u2), h: lerp(12, HOME.h, u2) };
            curCol = mix("paper", "coral", u2);
          }
        }
      }
    } else if (f < 519) {
      // breath, then Lexis paper floods out of the cursor
      curR = HOME;
      if (f >= 507) {
        const u = E.eio(seg(f, 507, 519)), w = lerp(HOME.w, W * 1.25, u), h = lerp(HOME.h, H * 1.45, u);
        over.fillStyle = C.paper;
        over.fillRect(960 - w / 2, 540 - h / 2, w, h);
        curR = { ...HOME, w: HOME.w * (1 - u), h: HOME.h * (1 - u), x: 960 - (HOME.w * (1 - u)) / 2, y: 540 - (HOME.h * (1 - u)) / 2 };
      }
    } else if (f < 699) {
      ground = C.paper; gridA = 1;
      curR = renderDemo(f);
    } else {
      ground = C.paper; gridA = 1;
      if (!pairsHL) {
        const src = [];
        lines.forEach((L, n) => src.push(...row(L.ask.cmd, { p: CF / 11, x: TXC, gx: TXC, cy: cmdY(n, 698) + DOM_CY }).cells));
        src.push(...row(">", { p: EF / 11, x: DX, gx: DX, cy: E_TOP + 0.6705 * EF }).cells);
        pairsHL = pairUp(src, HL.cells);
        pairsLogo = pairUp(HL.cells, logoCells, (q) => q.x);
      }
      const hlCur = plateCursor(HL, 20);
      if (f < 776) {
        drawCells(over, travel(pairsHL, f, 699, 28, { stagger: 18, arc: 90, pA: CF / 11, pB: 20 }), 20, FILL);
        curR = f < 738 ? null : hlCur;
      } else {
        // the cursor backspaces the headline, then types the wordmark
        const R2 = HL.rows, n1 = R2[0].text.length, n2 = R2[1].text.length;
        const left2 = Math.max(0, Math.round(lerp(n2, 0, seg(f, 776, 785)))), left1 = Math.max(0, Math.round(lerp(n1, 0, seg(f, 786, 792))));
        const rowCur = (li, n) => ({ x: R2[li].charX(n) + (n > 0 ? 20 : 0), y: HL.top + li * 13 * 20, w: 100, h: 140 });
        if (f < 793) {
          const keep = HL.cells.filter((q) => (q.r < 100 ? q.i < left1 : q.i < left2));
          drawCells(over, keep, 20, FILL);
        }
        const eraseCur = f < 786 ? rowCur(1, left2) : rowCur(0, left1);
        const startC = { x: LX0 - LOGO_CUR.w - 14, y: LOGO_CUR.y, w: LOGO_CUR.w, h: LOGO_CUR.h };
        const sx = lerp(startC.x, LOGO_CUR.x, E.cio(seg(f, 801, 820)));
        if (f >= 801) {
          const cellW = LOGO.cell * LOGO_SCALE;
          drawCells(over, logoCells.map((q) => {
            const u = seg(sx + LOGO_CUR.w * 0.2 - q.x, 0, 70);
            return { x: q.x, y: q.y - (1 - E.eo(u)) * 14, px: cellW * E.bo(u), col: C.ink };
          }), LOGO_P);
        }
        curR = f < 793 ? eraseCur : f < 801 ? glide(rowCur(0, 0), startC, E.eio(seg(f, 793, 801)), 30) : { ...startC, x: sx };
      }
    }

    if (f >= 30 && f < 375) {
      const big = Math.min(E.eio(seg(f, 330, 337)), 1 - E.eio(seg(f, 362, 369)));
      const pcx = YXR + YW / 2, pcy = YY + YH / 2, S = lerp(1, 3.4, big);
      over.save();
      over.translate(lerp(pcx, 960, big), lerp(pcy, 500, big)); over.scale(S, S); over.translate(-pcx, -pcy);
      drawYear(over, f, E.eo(seg(f, 30, 34)));
      over.restore();
    }

    bg.style.background = ground;
    grid.style.opacity = gridA;
    if (blinking(f)) curA = 0;
    drawCursor(curR, curCol, curA);
  }

  function renderDemo(f) {
    demo.style.display = "block";
    for (const L of lines) { for (const q of L.src) q.el.style.visibility = "hidden"; for (const q of L.dst) if (q.el) q.el.style.visibility = "hidden"; }
    put(promptEl, DX, E_TOP, ES);
    promptEl.style.color = C.ink2;
    let curR = null;
    for (const L of lines) {
      const { ask, n } = L;
      if (f < ask.a) continue;
      const active = !(n < ASKS.length - 1 && f >= ASKS[n + 1].a);
      const cy = cmdY(n, f), fade = n < ASKS.length - 1 ? lerp(lerp(1, 0.45, E.eio(seg(f, ASKS[n + 1].morph - 2, ASKS[n + 1].morph + 9))), 1, E.eio(seg(f, 688, 697))) : 1;
      const typedAt = (i) => Math.round(ask.a + 2 + i * ask.type + (hash(i, n) - 0.5) * ask.type * 0.7);
      let typed = 0;
      for (const s of L.src) {
        if (f < typedAt(s.i)) continue;
        typed = s.i + 1;
        s.el.textContent = s.c;
        if (s.to !== undefined) {
          const d = ask.morph + s.to * 0.35, u = E.eio(seg(f, d, d + ask.mdur * 0.72));
          const x = lerp(TXE + s.i * EA, TXC + s.to * CA, u), y = lerp(E_TOP, cy, u) - Math.sin(Math.PI * u) * 40;
          put(s.el, x, y, lerp(ES, 1, u), u >= 1 ? fade : 1);
        } else {
          const u = seg(f, ask.morph + s.i * 0.22, ask.morph + s.i * 0.22 + 7);
          if (u >= 1) continue;
          if (u > 0 && s.c !== " ") s.el.textContent = GLY[Math.floor(hash(s.i, Math.floor(f / 2)) * GLY.length)];
          put(s.el, TXE + s.i * EA, E_TOP + E.ei(u) * 60, ES * (1 - 0.4 * E.ei(u)), 1 - E.ei(u));
        }
      }
      const tLock = ask.morph + ask.mdur - 2;
      const wipe = n < 2 ? E.eo(seg(f, tLock, tLock + 5)) : 0, hold = 1 - seg(f, tLock + 9, tLock + 15);
      const inv = wipe > 0 && hold > 0.5;
      if (wipe > 0 && hold > 0) {
        over.globalAlpha = hold;
        over.fillStyle = C.ink;
        over.fillRect(TXC - 18, cy + 12, (ask.cmd.length * CA + 36) * wipe, 106);
        over.globalAlpha = 1;
      }
      for (const s of L.src) s.el.style.color = inv ? C.paper : C.ink;
      for (const d of L.dst) if (d.el) d.el.style.color = inv ? C.paper : C.ink;
      for (const d of L.dst) {
        if (!d.el) continue;
        const st = ask.morph + d.j * 0.35 + 4;
        if (f < st) continue;
        const u = seg(f, st, st + 6);
        d.el.textContent = u < 1 && d.c !== " " ? GLY[Math.floor(hash(d.j + 50, Math.floor(f / 2)) * GLY.length)] : d.c;
        put(d.el, TXC + d.j * CA, cy - (1 - E.eo(u)) * 30, 1, E.eo(u) * fade);
      }
      if (active) {
        const mu = E.eio(seg(f, ask.morph + 2, ask.morph + ask.mdur));
        const typing = curBox(TXE + typed * EA + 10, E_TOP, EF), landed = curBox(TXC + ask.cmd.length * CA + 8, cy, CF);
        curR = glide(typing, landed, mu, 30);
        if (n > 0 && f < ask.a + 8) {
          const prev = lines[n - 1].ask;
          curR = glide(curBox(TXC + prev.cmd.length * CA + 8, cmdY(n - 1, f), CF), curBox(TXE + 10, E_TOP, EF), E.eio(seg(f, ask.a - 2, ask.a + 6)), 40);
        }
        if (f >= ask.press - 6 && f < ask.morph + 4) { drawKey(f, ask, typing.x, typing.y); curR = null; }
      }
    }
    return curR;
  }

  function drawKey(f, ask, cx, cyTop) {
    // the cursor block extrudes into the coral Return key, gets pressed, folds back into the cursor
    const a = ask.press - 6, b = ask.morph + 4;
    const k = Math.min(E.bo(seg(f, a, a + 6)), 1 - E.eio(seg(f, b - 6, b)));
    const press = Math.sin(Math.PI * seg(f, ask.press, ask.press + 6));
    const c0 = curBox(cx, E_TOP, EF);
    const w = lerp(c0.w, 200, k), h = lerp(c0.h, 98, k);
    Object.assign(key.style, { display: "block", width: w + "px", height: h + "px", transform: `translate(${cx + 10 * k}px, ${cyTop + (c0.h - h) / 2}px)` });
    key.firstElementChild.style.transform = `rotateX(${lerp(0, 46, k)}deg) rotateY(${lerp(0, -22, k)}deg) rotateZ(${lerp(0, 4, k)}deg) translateZ(${-press * 24}px)`;
    $("k-top").style.transform = `translateZ(${28 * k}px)`;
    $("k-top").style.fontSize = 58 * k + "px";
    $("k-side").style.opacity = k;
  }

  const tl = gsap.timeline({ paused: true });
  let last = -1;
  const clock = { get f() { return last; }, set f(v) { last = Math.round(v * 1e5) / 1e5; render(last); } };
  tl.fromTo(clock, { f: 0 }, { f: 900, duration: 15, ease: "none" }, 0);
  render(0);
  return { tl };
}
