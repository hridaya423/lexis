"use client";

import { useEffect, useRef } from "react";
import { InkFlood } from "./engine";
import { lexisScene } from "./lexis-scene";
import type { Scene } from "./scene";

const FONT_CSS = "var(--font-departure), monospace";

function resolveFamily(): string {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;font-family:${FONT_CSS}`;
  probe.textContent = "Ag";
  document.body.appendChild(probe);
  const fam = getComputedStyle(probe)
    .fontFamily.split(",")[0]
    .replace(/["']/g, "")
    .trim();
  probe.remove();
  return fam || "monospace";
}

function scenes(family: string): [Scene | null, Scene | null] {
  return [lexisScene(family, 0), lexisScene(family, 1)];
}

export function InkFloodBand() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let engine: InkFlood | null = null;
    let created = false;
    let onScreen = false;
    let hidden = false;

    const sync = () => {
      if (!engine || reduced) return;
      if (onScreen && !hidden) engine.start();
      else engine.stop();
    };

    const create = () => {
      if (created || !canvasRef.current) return;
      const family = resolveFamily();
      const [a, b] = scenes(family);
      if (!a) return;
      created = true;
      const col = host
        .closest("footer")
        ?.querySelector<HTMLElement>(":scope > div > div");
      const fit = () => {
        const cr = canvas.getBoundingClientRect();
        const r = col?.getBoundingClientRect();
        if (!r || !r.width) return { w: cr.width * 0.94, cx: cr.width / 2 };
        return { w: r.width, cx: r.left + r.width / 2 - cr.left };
      };
      engine = new InkFlood(canvas, a, b, fit);
      if (!engine.ok) return;
      if (reduced) engine.renderStill();
      else sync();
    };

    const raf = requestAnimationFrame(() => {
      if (document.fonts?.load) {
        const fam = resolveFamily();
        const to = window.setTimeout(create, 350);
        const go = () => {
          window.clearTimeout(to);
          create();
        };
        document.fonts.load(`400 1em "${fam}"`).then(go, go);
        document.fonts.ready
          .then(() => {
            if (!engine) return;
            const [a, b] = scenes(resolveFamily());
            if (a) engine.setScenes(a, b);
          })
          .catch(() => {});
      } else {
        create();
      }
    });

    const io = new IntersectionObserver(
      (es) => {
        onScreen = es[0]?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.2 },
    );
    io.observe(host);

    const onVis = () => {
      hidden = document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => engine?.resize(), 120);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(rt);
      engine?.destroy();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="A coral pen dot writes the word lexis out of dark LCD cells on the paper field. The cells swell until the ink floods the whole band, and the drawing starts again in the opposite colours — each pass painting the background the next one is written on."
      className="inkFloodHost"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
