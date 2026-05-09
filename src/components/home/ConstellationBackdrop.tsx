"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Star = {
  x: number;
  y: number;
  r: number;
  twinkleSpeed: number;
  phase: number;
  /** Dark-mode palette only: blue vs warm yellow star */
  isYellow: boolean;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function prefersDarkScheme() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function ConstellationBackdrop({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const animRef = useRef<number | undefined>(undefined);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const drawCtx = ctx;

    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const MOUSE_RADIUS = 155;
    const STAR_PAIR_DIST = 92;
    const MAX_NEAR = 14;
    const MAX_SPOKES = 6;

    function buildStars(width: number, height: number) {
      const rnd = mulberry32(0x74656b); // "tek"
      const count = Math.min(
        200,
        Math.max(55, Math.floor((width * height) / 9500))
      );
      starsRef.current = Array.from({ length: count }, () => ({
        x: rnd() * width,
        y: rnd() * height,
        r: 0.45 + rnd() * 1.35,
        twinkleSpeed: 1.2 + rnd() * 2.2,
        phase: rnd() * Math.PI * 2,
        isYellow: rnd() > 0.48,
      }));
    }

    function resize() {
      const cont = containerRef.current;
      const cv = canvasRef.current;
      if (!cont || !cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cont.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars(w, h);
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    resize();

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const onLeave = () => {
      mouseRef.current = { ...mouseRef.current, active: false };
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    let t = 0;
    const frame = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const dark = prefersDarkScheme();

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseOn = mouseRef.current.active;

      const near =
        mouseOn && mx >= 0 && mx <= w && my >= 0 && my <= h
          ? starsRef.current
              .map((s) => ({ s, d: Math.hypot(s.x - mx, s.y - my) }))
              .filter((x) => x.d < MOUSE_RADIUS)
              .sort((a, b) => a.d - b.d)
              .slice(0, MAX_NEAR)
          : [];

      // Constellation edges between nearby stars (polygon-like clusters)
      for (let i = 0; i < near.length; i++) {
        for (let j = i + 1; j < near.length; j++) {
          const a = near[i].s;
          const b = near[j].s;
          const edge = Math.hypot(a.x - b.x, a.y - b.y);
          if (edge < STAR_PAIR_DIST) {
            const fi = 1 - near[i].d / MOUSE_RADIUS;
            const fj = 1 - near[j].d / MOUSE_RADIUS;
            const alpha = 0.08 + fi * fj * 0.42;
            ctx.strokeStyle = dark
              ? `hsla(218, 92%, 72%, ${alpha * 0.95})`
              : `hsla(356, 73%, 41%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Spokes from cursor to closest stars
      if (mouseOn && near.length > 0) {
        near.slice(0, MAX_SPOKES).forEach(({ s, d }) => {
          const fade = 1 - d / MOUSE_RADIUS;
          ctx.strokeStyle = dark
            ? `hsla(48, 96%, 68%, ${0.14 + fade * 0.42})`
            : `hsla(356, 73%, 41%, ${0.12 + fade * 0.38})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        });
      }

      const rm = reducedMotionRef.current;
      t += rm ? 0 : 0.018;

      starsRef.current.forEach((s) => {
        const tw = rm
          ? 0.82
          : 0.38 + 0.62 * (Math.sin(t * s.twinkleSpeed + s.phase) * 0.5 + 0.5);
        if (dark) {
          if (s.isYellow) {
            ctx.fillStyle = `rgba(255, 198, 72, ${tw * 0.55})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255, 248, 210, ${Math.min(1, tw * 1.05)})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 1.05, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(96, 165, 255, ${tw * 0.55})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(210, 232, 255, ${Math.min(1, tw * 1.05)})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 1.05, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = `rgba(160, 42, 56, ${tw * 0.18})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(62, 14, 22, ${tw * 0.55})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);

    return () => {
      ro.disconnect();
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center">
        {children}
      </div>
    </div>
  );
}
