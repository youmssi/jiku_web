"use client";

import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Counts from zero to [value] the first time it scrolls into view (adapted from
 * React Bits' CountUp). The final number is server-rendered, so it is right
 * without JavaScript, for search engines, and when the visitor prefers reduced
 * motion; the animation only replays it.
 */
export function CountUp({
  value,
  locale,
  className,
}: {
  value: number;
  locale: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 40, stiffness: 90 });
  const format = (n: number) => Math.round(n).toLocaleString(locale);

  useEffect(() => {
    if (!inView || reduceMotion || !ref.current) return;
    ref.current.textContent = format(0);
    motionValue.set(value);
    // `format` only depends on the locale, already a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, value, motionValue, locale]);

  useEffect(
    () =>
      spring.on("change", (latest) => {
        if (ref.current) ref.current.textContent = format(latest);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spring, locale],
  );

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
