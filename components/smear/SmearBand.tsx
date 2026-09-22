"use client";

import { useEffect, useRef } from "react";
import { FadeMotion, pixelFontSpec, WORD } from "./engine";
import styles from "./smear.module.css";

export function SmearBand() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fallback = host.querySelector<HTMLElement>("[data-fallback]");

    let engine: FadeMotion | null = null;
    let raf = 0;
    let created = false;
    let onScreen = false;
    let hidden = false;

    const running = () => onScreen && !hidden;
    const sync = () => {
      if (!engine || reduced) return;
      if (running()) engine.start();
      else engine.stop();
    };

    const create = () => {
      if (created) return;
      created = true;
      raf = requestAnimationFrame(() => {
        if (!hostRef.current) return;
        engine = new FadeMotion(host);
        if (!engine.ok) {
          engine = null;
          return;
        }
        fallback?.setAttribute("hidden", "");

        if (!reduced) engine.enableHero(2);

        engine.onBg = (css) => {
          host.style.backgroundColor = css;
        };

        if (document.fonts?.load) {
          document.fonts
            .load(pixelFontSpec())
            .catch(() => {})
            .then(() => engine?.refreshFonts());
          document.fonts.ready.then(() => engine?.refreshFonts()).catch(() => {});
        }
        if (reduced) engine.renderStill();
        else sync();
      });
    };

    const io = new IntersectionObserver(
      (es) => {
        onScreen = es.some((e) => e.isIntersecting);
        if (onScreen && !created) create();
        if (created) sync();
      },
      { rootMargin: "200px" },
    );
    io.observe(host);

    const onVis = () => {
      hidden = document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);

    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      if (!engine || reduced) return;
      const r = host.getBoundingClientRect();
      engine.setPointer({
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
      });
    };
    const onLeave = () => engine?.setPointer(null);
    if (fine) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("pointercancel", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      if (fine) {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        host.removeEventListener("pointercancel", onLeave);
      }
      engine?.destroy();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={`The word ${WORD} in heavy pixel type, its ink trailing downward into the paper in hundreds of overlapping copies`}
      className={styles.host}
    >
      <span data-fallback aria-hidden="true" className={styles.fallback}>
        {WORD}
      </span>
    </div>
  );
}
