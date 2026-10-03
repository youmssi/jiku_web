"use client";

import { useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

// CountUp adapted from React Bits (reactbits.dev, MIT + Commons Clause). The
// server HTML holds the final number, so it reads right without scripts; the
// count only plays once in view and never under reduced motion.

export function CountUp({ to, from = 0, duration = 1.6, className }: { to: number; from?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const value = useMotionValue(from);
  const spring = useSpring(value, { damping: 20 + 40 / duration, stiffness: 100 / duration });
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !ref.current) return;
    ref.current.textContent = String(from);
  }, [from]);

  useEffect(() => {
    if (inView) value.set(to);
  }, [inView, to, value]);

  useEffect(
    () =>
      spring.on("change", (latest) => {
        if (ref.current) ref.current.textContent = String(Math.round(latest));
      }),
    [spring],
  );

  return (
    <span ref={ref} className={className}>
      {to}
    </span>
  );
}
