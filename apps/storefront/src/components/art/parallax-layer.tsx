"use client";

import { useEffect, useRef, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /**
   * Parallax speed. 0 = locked to viewport, 1 = scrolls with page.
   * Try 0.2 for far backgrounds, 0.5 for mid layers, 0.8 for near.
   */
  speed?: number;
  className?: string;
  ariaHidden?: boolean;
}

/**
 * Vanilla scroll-driven parallax wrapper.
 * Translates its child based on window.scrollY * (1 - speed).
 * Cheap, no deps, respects prefers-reduced-motion.
 */
export function ParallaxLayer({
  children,
  speed = 0.5,
  className = "",
  ariaHidden = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const offset = window.scrollY * (1 - speed);
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      aria-hidden={ariaHidden}
      className={className}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
