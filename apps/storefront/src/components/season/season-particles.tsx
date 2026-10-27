"use client";

import { useEffect, useRef } from "react";
import type { ParticleKind } from "./themes";

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
  spin: number;
  angle: number;
  color: string;
};

const COUNT = { light: 35, medium: 80, heavy: 150 } as const;

/**
 * Full-screen particle layer (snow, leaves, hearts, confetti, petals) on one
 * canvas. Scales particle count to viewport width, caps DPR at 2, and stops
 * drawing while the tab is hidden.
 */
export function SeasonParticles({
  kind,
  colors,
  intensity,
}: {
  kind: ParticleKind;
  colors: string[];
  intensity: keyof typeof COUNT;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const rising = kind === "heart";

    const spawn = (anywhere: boolean): Particle => {
      const size =
        kind === "snow" ? 1.5 + Math.random() * 3.5 :
        kind === "confetti" ? 4 + Math.random() * 5 :
        kind === "heart" ? 6 + Math.random() * 8 :
        5 + Math.random() * 7;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : rising ? h + 20 : -20,
        size,
        speed: (kind === "snow" ? 0.4 : 0.7) + Math.random() * (kind === "confetti" ? 1.6 : 1),
        drift: 0.3 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.06,
        angle: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(COUNT[intensity] * Math.min(1.4, Math.max(0.45, w / 1440)));
      while (particles.length < target) particles.push(spawn(true));
      particles.length = target;
    };

    const heart = (s: number) => {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.5, -s, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.4, 0, s * 0.3);
      ctx.fill();
    };

    const draw = (p: Particle, t: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = p.color;
      switch (kind) {
        case "snow":
          // Thin dark rim so white flakes still read on the cream background.
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.globalAlpha = 0.9;
          ctx.fill();
          ctx.lineWidth = 0.75;
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.stroke();
          break;
        case "confetti":
          ctx.rotate(p.angle);
          // Flip around the long axis for a fluttering look
          ctx.scale(Math.cos(t * 0.004 + p.phase), 1);
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          if (p.color === "#ffffff") {
            ctx.lineWidth = 0.75;
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.strokeRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          }
          break;
        case "heart":
          ctx.rotate(Math.sin(t * 0.002 + p.phase) * 0.3);
          ctx.globalAlpha = 0.85;
          heart(p.size);
          break;
        case "leaf":
          ctx.rotate(p.angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.stroke();
          break;
        case "petal":
          ctx.rotate(p.angle);
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.6, p.size * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.12)";
          ctx.stroke();
          break;
      }
      ctx.restore();
    };

    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      // Normalize to 60fps steps; clamp after tab switches or jank.
      const dt = Math.min((t - last) / 16.67, 3);
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += (rising ? -p.speed : p.speed) * dt;
        p.x += Math.sin(t * 0.001 * p.drift + p.phase) * p.drift * 0.6 * dt;
        p.angle += p.spin * dt;
        if (rising ? p.y < -30 : p.y > h + 30) particles[i] = spawn(false);
        else draw(p, t);
      }
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kind, colors, intensity]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-[45] w-screen h-screen pointer-events-none"
    />
  );
}
