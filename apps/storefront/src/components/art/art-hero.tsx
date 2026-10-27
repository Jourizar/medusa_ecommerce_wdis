"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

const LAYERS = 10;
// Pre-rendered from svgs/cloud_wall.svg (embedded PNGs, 1.4MB) — same look, ~7x smaller.
const CLOUD_SRC = "/assets/art_page_decoration/cloud_wall.webp";

/**
 * Pinned intro for the gallery. While the hero is scrolled through, the
 * WDIS echo stack fans apart and recedes, two cloud walls rise at different
 * speeds and swallow it, and the panel fades to black into the first piece.
 * Pinned below the navbar + art subnav (84px + 60px).
 */
export function ArtHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  // WDIS echo stack: layers spread, then the whole mark shrinks back and fades.
  const spread = useTransform(p, [0, 0.35], [4, 26]);
  const logoScale = useTransform(p, [0, 0.35, 0.75], [1, 1.04, 0.7]);
  const logoY = useTransform(p, [0, 0.75], [0, -140]);
  const logoOpacity = useTransform(p, [0.5, 0.78], [1, 0]);

  // Clouds start low and grow upward from a bottom anchor (never lifting
  // off the bottom edge). The front wall swallows the logo; the back lags.
  const frontY = useTransform(p, [0, 0.6], ["24vw", "0vw"]);
  const frontScale = useTransform(p, [0, 0.85], [1, 1.9]);
  const backY = useTransform(p, [0, 0.6], ["14vw", "0vw"]);
  const backScale = useTransform(p, [0, 0.85], [1.05, 1.4]);

  const hintOpacity = useTransform(p, [0, 0.12], [1, 0]);
  const blackout = useTransform(p, [0.72, 1], [0, 1]);

  return (
    <section ref={ref} className={reduce ? "relative" : "relative h-[200vh] md:h-[240vh]"}>
      <div
        className={
          reduce
            ? "relative h-[calc(100svh-144px)] overflow-hidden"
            : "sticky top-[144px] h-[calc(100svh-144px)] overflow-hidden"
        }
      >
        {/* Back cloud wall — mirrored, faint, slow */}
        <motion.div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none origin-bottom"
          style={reduce ? { opacity: 0.35 } : { y: backY, scale: backScale, opacity: 0.35 }}
        >
          <CloudWall mirrored />
        </motion.div>

        {/* WDIS echo stack */}
        <motion.div
          className="relative z-[1] h-full flex items-center justify-center px-4"
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <motion.div
            className="relative w-[min(42rem,92vw)]"
            style={reduce ? undefined : { scale: logoScale, y: logoY, opacity: logoOpacity }}
          >
            {Array.from({ length: LAYERS }).map((_, i) => (
              <EchoLayer key={i} index={i} spread={spread} reduce={Boolean(reduce)} />
            ))}
          </motion.div>
        </motion.div>

        {/* Front cloud wall — rises over the logo */}
        <motion.div
          aria-hidden
          className="absolute inset-0 z-[2] pointer-events-none origin-bottom"
          style={reduce ? undefined : { y: frontY, scale: frontScale }}
        >
          <CloudWall />
        </motion.div>

        <motion.p
          className="absolute bottom-6 inset-x-0 z-[3] text-center text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-black animate-bounce motion-reduce:animate-none"
          style={reduce ? undefined : { opacity: hintOpacity }}
        >
          Scroll to enter ↓
        </motion.p>

        {/* Fade to the gallery's black */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="absolute inset-0 z-[4] bg-black pointer-events-none"
            style={{ opacity: blackout }}
          />
        )}
      </div>
    </section>
  );
}

function EchoLayer({
  index,
  spread,
  reduce,
}: {
  index: number;
  spread: MotionValue<number>;
  reduce: boolean;
}) {
  const isFirst = index === 0;
  const isLast = index === LAYERS - 1;
  const y = useTransform(spread, (s) => index * s);

  return (
    <motion.div
      className={isFirst ? "" : "absolute inset-0 pointer-events-none"}
      style={reduce ? { y: index * 4 } : { y }}
    >
      <Image
        src="/assets/art_page_decoration/svgs/fontype.svg"
        alt={isLast ? "WDIS" : ""}
        aria-hidden={!isLast || undefined}
        width={1296}
        height={1728}
        priority={isLast}
        className="block w-full h-auto pointer-events-none"
        style={{ opacity: isLast ? 1 : index / (LAYERS - 1) }}
      />
    </motion.div>
  );
}

/** The portrait cloud SVG rotated into a horizontal wall along the bottom. */
function CloudWall({ mirrored = false }: { mirrored?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={CLOUD_SRC}
      alt=""
      className={`absolute bottom-[-16.67vw] left-1/2 -translate-x-1/2 w-[100vw] h-auto max-w-none select-none ${
        mirrored ? "rotate-90 -scale-y-100" : "rotate-90"
      }`}
    />
  );
}
