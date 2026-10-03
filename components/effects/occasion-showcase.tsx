"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * The occasion that rotates in the headline and the card that goes with it,
 * in step. The heading keeps one plain sentence for search engines and
 * screen readers; the moving words are decorative. A visitor can pick an
 * occasion, which stops the rotation.
 */
export function OccasionShowcase({
  lead,
  occasions,
  cards,
  sentence,
  interval = 3200,
  children,
}: {
  lead: string;
  occasions: string[];
  cards: ReactNode[];
  sentence: string;
  interval?: number;
  children?: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(false);

  useEffect(() => {
    if (chosen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % occasions.length), interval);
    return () => clearInterval(timer);
  }, [chosen, occasions.length, interval]);

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="text-center lg:text-left">
        <h1 className="animate-blur-in text-balance text-[clamp(2.3rem,6vw,4.4rem)] font-bold leading-[1.05] tracking-tight">
          <span className="sr-only">{sentence}</span>
          <span aria-hidden>
            {lead}{" "}
            <span className="relative inline-grid overflow-hidden align-bottom text-zinc-500">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={occasions[index]}
                  initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
                  transition={{ type: "spring", damping: 26, stiffness: 280 }}
                  className="col-start-1 row-start-1 whitespace-nowrap"
                >
                  {occasions[index]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </h1>
        {children}
        <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
          {occasions.map((occasion, position) => (
            <button
              key={occasion}
              type="button"
              aria-pressed={position === index}
              onClick={() => {
                setIndex(position);
                setChosen(true);
              }}
              className="min-h-11 rounded-full border border-border px-4 text-sm font-medium text-muted-foreground transition hover:border-foreground/40 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
            >
              {occasion}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[20rem] sm:max-w-[22rem]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, rotate: 6, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, rotate: -3, y: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -10, y: -20, scale: 0.94 }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
          >
            {cards[index]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
