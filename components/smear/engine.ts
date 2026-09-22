export const WORD = "404";

const FONT_CSS = "var(--font-departure), monospace";
const FONT_WEIGHT = 400;

const MASK_W = 1024;
const MASK_H = 448;
const MASK_PAD = 28;

const FIT_W = 0.68;
const FIT_H = 0.4;
const WORD_CY = 0.3;
const TRAIL_LEN = 0.78;

const STEPS = 190;
const TRAIL_INK = 2.6;
const STEP_SPREAD = 1.6;

const PAPER: [number, number, number] = [0.765, 0.875, 0.627];
const INK: [number, number, number] = [0.094, 0.145, 0.063];

const VERT = `
attribute vec2 aUV;
uniform vec4 uRect;
uniform vec2 uOff;
varying vec2 vUV;
void main() {
  vUV = aUV;
  vec2 p = mix(uRect.xy, uRect.zw, aUV);
  gl_Position = vec4(p + uOff, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uMask;
uniform vec3 uInk;
uniform float uAlpha;
varying vec2 vUV;
void main() {
  float a = texture2D(uMask, vUV).a;
  gl_FragColor = vec4(uInk, a * uAlpha);
}`;

function resolveFamily(): string {
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden";
  probe.style.fontFamily = FONT_CSS;
  probe.textContent = "Ag";
  document.body.appendChild(probe);
  const fam = getComputedStyle(probe)
    .fontFamily.split(",")[0]
    .replace(/["']/g, "")
    .trim();
  probe.remove();
  return fam ? `"${fam}"` : "monospace";
}

export function pixelFontSpec(): string {
  return `${FONT_WEIGHT} 200px ${resolveFamily()}`;
}

function css([r, g, b]: [number, number, number]): string {
  return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;
}

export class FadeMotion {
  readonly ok: boolean;

  onBg: ((css: string) => void) | null = null;

  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private prog: WebGLProgram | null = null;
  private quad: WebGLBuffer | null = null;
  private mask: WebGLTexture | null = null;
  private maskCanvas = document.createElement("canvas");
  private family: string;

  private loc: Record<string, WebGLUniformLocation | null> = {};
  private ro: ResizeObserver | null = null;
  private raf = 0;
  private disposed = false;
  private running = false;

  private rect: [number, number, number, number] = [-0.5, 0, 0.5, 0.3];
  private lenPx = 0;

  private heroT0 = -1;
  private heroDur = 0;

  private tx = 0;
  private ty = 0;
  private px = 0;
  private py = 0;
  private ptrAmt = 0;
  private ptrAmtTarget = 0;

  private lastBg = "";

  constructor(private host: HTMLElement) {
    this.family = resolveFamily();
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    host.appendChild(this.canvas);
    this.renderMask();

    const gl = this.canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
    });
    this.gl = gl;
    this.ok = !!gl && this.build();
    if (!this.ok) {
      this.canvas.remove();
      return;
    }

    this.ro = new ResizeObserver(() => {
      this.resize();
      if (!this.running) this.draw(performance.now(), true);
    });
    this.ro.observe(host);
    this.resize();
  }

  private build(): boolean {
    const gl = this.gl;
    if (!gl) return false;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    if (!prog) return false;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return false;
    }
    this.prog = prog;
    gl.useProgram(prog);
    for (const name of ["uRect", "uOff", "uMask", "uInk", "uAlpha"])
      this.loc[name] = gl.getUniformLocation(prog, name);

    this.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const aUV = gl.getAttribLocation(prog, "aUV");
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);

    this.mask = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.mask);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.uploadMask();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1i(this.loc.uMask, 0);
    gl.uniform3fv(this.loc.uInk, INK);
    return true;
  }

  private renderMask() {
    const c = this.maskCanvas;
    c.width = MASK_W;
    c.height = MASK_H;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, MASK_W, MASK_H);
    ctx.font = `${FONT_WEIGHT} 100px ${this.family}`;
    const m = ctx.measureText(WORD);
    const mh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent || 100;
    const scale = Math.min((MASK_W - MASK_PAD * 2) / m.width, (MASK_H - MASK_PAD * 2) / mh);
    const em = Math.max(8, 100 * scale);
    ctx.font = `${FONT_WEIGHT} ${em}px ${this.family}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#fff";
    const w = ctx.measureText(WORD).width;
    const asc = ctx.measureText(WORD).actualBoundingBoxAscent || em;
    ctx.fillText(WORD, (MASK_W - w) / 2, MASK_PAD + asc);
  }

  private uploadMask() {
    const gl = this.gl;
    if (!gl || !this.mask) return;
    gl.bindTexture(gl.TEXTURE_2D, this.mask);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.maskCanvas);
  }

  refreshFonts() {
    this.family = resolveFamily();
    this.renderMask();
    this.uploadMask();
    this.resize();
    if (!this.running) this.draw(performance.now(), true);
  }

  resize() {
    const gl = this.gl;
    if (!gl) return;
    const r = this.host.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    const aspect = MASK_W / MASK_H;
    const dispH = Math.min(r.height * FIT_H, (r.width * FIT_W) / aspect);
    const dispW = dispH * aspect;
    const cx = r.width / 2;
    const cy = r.height * WORD_CY;
    const x0 = ((cx - dispW / 2) / r.width) * 2 - 1;
    const x1 = ((cx + dispW / 2) / r.width) * 2 - 1;
    const y0 = 1 - ((cy + dispH / 2) / r.height) * 2;
    const y1 = 1 - ((cy - dispH / 2) / r.height) * 2;
    this.rect = [x0, y0, x1, y1];
    this.lenPx = r.height * TRAIL_LEN;
  }

  enableHero(seconds: number) {
    this.heroDur = seconds * 1000;
    this.heroT0 = -1;
  }

  setPointer(p: { x: number; y: number } | null) {
    if (p) {
      this.tx = (p.x - 0.5) * 2;
      this.ty = (p.y - 0.5) * 2;
      this.ptrAmtTarget = 1;
    } else {
      this.ptrAmtTarget = 0;
    }
  }

  start() {
    if (this.running || !this.ok) return;
    this.running = true;
    const tick = (now: number) => {
      if (!this.running) return;
      this.draw(now, false);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  renderStill() {
    if (!this.ok) return;
    this.draw(performance.now(), true);
  }

  private draw(now: number, still: boolean) {
    const gl = this.gl;
    if (!gl || this.disposed) return;

    let hero = 1;
    if (!still && this.heroDur > 0) {
      if (this.heroT0 < 0) this.heroT0 = now;
      hero = Math.min(1, (now - this.heroT0) / this.heroDur);
      hero = 1 - Math.pow(1 - hero, 3);
    }

    this.px += (this.tx * this.ptrAmtTarget - this.px) * 0.08;
    this.py += (this.ty * this.ptrAmtTarget - this.py) * 0.08;
    this.ptrAmt += (this.ptrAmtTarget - this.ptrAmt) * 0.08;

    const bg = css(PAPER);
    if (bg !== this.lastBg) {
      this.lastBg = bg;
      this.onBg?.(bg);
    }

    gl.clearColor(PAPER[0], PAPER[1], PAPER[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const len = this.lenPx * hero * (1 + this.ptrAmt * (0.5 - this.py * 0.5) * 0.6);
    const dirX = this.px * 0.85 * this.ptrAmt;
    const dirY = 1 + this.py * 0.3 * this.ptrAmt;
    const norm = Math.hypot(dirX, dirY) || 1;
    const w = this.canvas.width;
    const h = this.canvas.height;

    gl.useProgram(this.prog);
    gl.uniform4fv(this.loc.uRect, this.rect);

    for (let i = STEPS - 1; i >= 1; i--) {
      const t = i / STEPS;
      const d = len * Math.pow(t, STEP_SPREAD);
      gl.uniform2f(this.loc.uOff, (dirX * d) / norm / (w / 2), (-dirY * d) / norm / (h / 2));
      gl.uniform1f(this.loc.uAlpha, (TRAIL_INK / STEPS) * (1 - t * 0.55));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.uniform2f(this.loc.uOff, 0, 0);
    gl.uniform1f(this.loc.uAlpha, 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    this.disposed = true;
    this.stop();
    this.ro?.disconnect();
    this.ro = null;
    const gl = this.gl;
    if (gl) {
      if (this.mask) gl.deleteTexture(this.mask);
      if (this.quad) gl.deleteBuffer(this.quad);
      if (this.prog) gl.deleteProgram(this.prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    this.gl = null;
    this.canvas.remove();
  }
}
