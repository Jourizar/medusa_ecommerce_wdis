import { type Variants } from "framer-motion";

/**
 * Shared Framer Motion animation variants.
 * Reusable animation configurations for consistent motion design.
 */

// Page transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export const pageSlideIn: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { type: "spring", stiffness: 200, damping: 25 },
};

// Staggered children
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

// Scale entrance
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.25, ease: "easeOut" },
};

// Slide up
export const slideUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

// Hover lift
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -6,
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

// Button press
export const buttonPress = {
  rest: { scale: 1 },
  press: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

// Fade only
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// Parallax (for hero backgrounds)
export const parallaxBackground = (offset = 100) => ({
  initial: { y: 0 },
  whileInView: { y: -offset },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" },
});
