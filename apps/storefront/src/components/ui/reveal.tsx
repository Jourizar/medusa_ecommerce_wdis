"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Fades + lifts its child into place the first time it scrolls into view,
 * staggered by column. Don't wrap above-the-fold content: it starts hidden
 * until hydration, which would delay the first paint.
 */
export function Reveal({
  children,
  index = 0,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  columns?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (index % columns) * 0.07 }}
    >
      {children}
    </motion.div>
  );
}
