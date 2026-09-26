"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Cycles through [texts], one word at a time, each letter sliding in (adapted
 * from React Bits' RotatingText). The server renders the first word, so the
 * headline reads fully without JavaScript; assistive technology gets the whole
 * list once instead of a word that keeps changing; and nothing moves when the
 * visitor prefers reduced motion.
 */
export function RotatingText({
  texts,
  interval = 2600,
  className,
}: {
  texts: string[];
  interval?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || texts.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % texts.length), interval);
    return () => clearInterval(timer);
  }, [reduceMotion, texts.length, interval]);

  const word = texts[index] ?? "";

  return (
    <span className={cn("relative inline-flex overflow-hidden align-bottom", className)}>
      <span className="sr-only">{texts.join(", ")}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={word} aria-hidden className="inline-flex" initial="hidden" animate="visible" exit="exit">
          {Array.from(word).map((letter, position) => (
            <motion.span
              key={position}
              className="inline-block whitespace-pre"
              variants={{
                hidden: { y: "100%", opacity: 0 },
                visible: { y: 0, opacity: 1 },
                exit: { y: "-110%", opacity: 0 },
              }}
              transition={{ type: "spring", damping: 26, stiffness: 320, delay: position * 0.025 }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
