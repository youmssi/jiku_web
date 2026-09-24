"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Fades and lifts its content in the first time it scrolls into view. The text
 * is in the server HTML from the start; under `MotionProvider`, a visitor who
 * prefers reduced motion gets the fade without the movement, and
 * `RevealFallback` shows everything when scripts never run.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/** Shows every `Reveal` block to visitors whose browser runs no scripts. */
export function RevealFallback() {
  return (
    <noscript>
      <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
    </noscript>
  );
}
