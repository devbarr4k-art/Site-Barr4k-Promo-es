"use client";

import { useEffect, useRef } from "react";

// Poeira lima flutuando (ref.: Contra Labs). Foge do mouse e pausa fora da tela.
export function Particles({ count = 700 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const mouse = { x: -9999, y: -9999 };

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; lime: boolean };
    let ps: P[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(count * Math.min(1, (w * h) / (1440 * 900)));
      ps = Array.from({ length: n }, () => {
        // mais densa à direita, atrás do celular
        const x = w * (0.35 + 0.65 * Math.pow(Math.random(), 0.7));
        return {
          x,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
          r: Math.random() < 0.08 ? 1.2 + Math.random() * 1.4 : 0.4 + Math.random() * 0.9,
          a: 0.15 + Math.random() * 0.7,
          lime: Math.random() < 0.82,
        };
      });
    };

    let t = 0;
    let raf = 0;
    let visivel = true;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.lime ? "#C6FF00" : "#EDEDE6";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      t += 0.004;
      for (const p of ps) {
        // campo de fluxo suave
        const ang = Math.sin(p.x * 0.0021 + t) * 1.6 + Math.cos(p.y * 0.0027 - t * 0.8) * 1.6;
        p.vx += Math.cos(ang) * 0.012;
        p.vy += Math.sin(ang) * 0.012 - 0.004;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140) {
          const f = (1 - Math.sqrt(d2) / 140) * 0.6;
          p.vx += (dx / (Math.sqrt(d2) + 0.01)) * f;
          p.vy += (dy / (Math.sqrt(d2) + 0.01)) * f;
        }
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
      }
      draw();
      if (visivel) raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);

    const io = new IntersectionObserver(([entry]) => {
      visivel = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visivel && !reduce) raf = requestAnimationFrame(step);
    });
    io.observe(canvas);
    if (reduce) draw();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [count]);

  return <canvas ref={ref} className="particles" aria-hidden="true" />;
}
