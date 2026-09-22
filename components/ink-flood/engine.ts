import { easeFn, sampleTable } from "./ease";
import {
  HALFTONE_DEFAULTS,
  drawHalftone,
  makeHalftoneTile,
} from "./halftone";
import type { Scene } from "./scene";

export class InkFlood {
  private ctx: CanvasRenderingContext2D | null;
  private raf = 0;
  private t0 = 0;
  private running = false;
  private dpr = 1;
  private scene: Scene;
  private sceneB: Scene | null;

  private tile: HTMLCanvasElement | null = null;
  private fit: (() => { w: number; cx: number }) | null = null;
  private fitW = 0;
  private fitCX = 0;

  readonly ok: boolean;

  constructor(
    private canvas: HTMLCanvasElement,
    scene: Scene,
    sceneB: Scene | null = null,
    fit: (() => { w: number; cx: number }) | null = null,
  ) {
    this.scene = scene;
    this.sceneB = sceneB;
    this.fit = fit;
    this.ctx = canvas.getContext("2d");
    this.ok = !!this.ctx;
    if (this.ok) this.resize();
  }

  setScenes(scene: Scene, sceneB: Scene | null) {
    this.scene = scene;
    this.sceneB = sceneB;
    this.t0 = performance.now();
    if (!this.running) this.renderStill();
  }

  resize() {
    const c = this.canvas;
    const r = c.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(r.width * this.dpr);
    c.height = Math.round(r.height * this.dpr);
    const f = this.fit?.();
    this.fitW = f?.w ?? r.width * 0.94;
    this.fitCX = f?.cx ?? r.width / 2;
    this.tile = null;
    if (!this.running) this.renderStill();
  }

  start() {
    if (this.running || !this.ok) return;
    this.running = true;
    this.t0 = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      this.draw((now - this.t0) / 1000);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  renderStill() {
    if (this.ok) this.draw(this.scene.restAt / this.scene.fps);
  }

  destroy() {
    this.stop();
    this.ctx = null;
    this.tile = null;
  }

  private capsule(
    ctx: CanvasRenderingContext2D,
    x0: number, y0: number, x1: number, y1: number, r: number,
  ) {
    if (r <= 0) return;
    ctx.beginPath();
    if (Math.hypot(x1 - x0, y1 - y0) < 0.5) {
      ctx.arc(x1, y1, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.lineWidth = r * 2;
      ctx.lineCap = "round";
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }

  private toScene(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    s: Scene,
  ) {
    ctx.translate(this.fitCX || W / 2, H / 2);
    const k = Math.min((H * 0.9) / s.size.h, (this.fitW || W * 0.94) / s.size.w);
    ctx.scale(k, k);
    ctx.translate(-s.size.w / 2, -s.size.h / 2);
  }

  private screen(ctx: CanvasRenderingContext2D, W: number, H: number) {
    const o = HALFTONE_DEFAULTS;
    if (!this.tile) this.tile = makeHalftoneTile(o.pitch, o.radius, this.dpr);
    drawHalftone(ctx, this.tile, W, H, this.dpr, o.alpha);
  }

  private draw(time: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const { dpr } = this;
    const W = this.canvas.width / dpr;
    const H = this.canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const halfSecs = this.scene.half / this.scene.fps;
    const total = time % (halfSecs * 2);
    const second = total >= halfSecs;
    const s = second && this.sceneB ? this.sceneB : this.scene;
    const u = (total - (second ? halfSecs : 0)) * s.fps;
    const [fieldA, fieldB] = s.palette.fields;
    const bg = second ? fieldB : fieldA;
    const ink = second ? fieldA : fieldB;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    if (u >= s.flood.end) {
      ctx.fillStyle = ink;
      ctx.fillRect(0, 0, W, H);
      this.screen(ctx, W, H);
      return;
    }

    const flooding = u >= s.flood.at;
    const fe = easeFn(s.flood.ease);
    const zoom = flooding ? sampleTable(s.flood.scale, s.flood.at, u, fe) : 1;
    const k = flooding ? sampleTable(s.flood.swell, s.flood.at, u, fe) : 1;

    ctx.save();
    this.toScene(ctx, W, H, s);
    ctx.translate(s.size.w / 2, s.size.h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-s.size.w / 2, -s.size.h / 2);
    ctx.fillStyle = ink;
    ctx.beginPath();
    for (let i = 0; i < s.spine.length; i++) {
      const [x, y, r, f] = s.spine[i];
      if (f > u) break;
      if (r <= 0.01) continue;
      const rad = r * k * Math.min(1, (u - f) / 1.5);
      if (rad <= 0.01) continue;
      ctx.roundRect(x - rad, y - rad, rad * 2, rad * 2, rad * 0.4);
    }
    ctx.fill();
    ctx.restore();

    ctx.save();
    this.toScene(ctx, W, H, s);
    ctx.fillStyle = s.palette.dot;
    ctx.strokeStyle = s.palette.dot;

    const sp = s.sparks;
    if (sp && u >= sp.popAt) {
      const se = easeFn(sp.ease);
      const rNow =
        u < s.flood.at
          ? sampleTable(sp.pop, sp.popAt, u, se)
          : u < sp.shrinkAt
            ? sp.radius
            : sampleTable(sp.shrink, sp.shrinkAt, u, se);

      const div = (v: number) =>
        v < s.flood.at ? 1 : sampleTable(sp.diverge, s.flood.at, v, se);
      const now = div(u + 0.5);
      const was = div(Math.max(u - 0.5, sp.popAt));
      const cx = s.size.w / 2;
      const cy = s.size.h / 2;
      for (const sign of [1, -1]) {
        this.capsule(
          ctx,
          cx + sign * sp.offset[0] * s.size.w * was,
          cy + sign * sp.offset[1] * s.size.h * was,
          cx + sign * sp.offset[0] * s.size.w * now,
          cy + sign * sp.offset[1] * s.size.h * now,
          rNow,
        );
      }
    }

    if (s.tip && u >= s.tipAt && u < s.tipAt + s.tip.length) {
      const [x, y, r] = this.tipAt(s, u);
      if (r > 0) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    this.screen(ctx, W, H);
  }

  private tipAt(s: Scene, u: number): [number, number, number] {
    const tip = s.tip!;
    const k = Math.min(Math.max(u - s.tipAt, 0), tip.length - 1);
    const i = Math.min(Math.floor(k), tip.length - 2);
    const t = k - i;
    const a = tip[i];
    const b = tip[i + 1];
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ];
  }
}
