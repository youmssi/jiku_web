"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * The occasion that rotates at the end of the headline and the card that goes
 * with it, in step. The heading keeps one plain sentence for search engines
 * and screen readers; the moving words are decorative. A visitor can pick an
 * occasion under the card, which stops the rotation. The cards arrive
 * rendered by the server; [overlay] stays put while they change.
 */
export function OccasionShowcase({
  lead,
  sentence,
  occasions,
  cards,
  pickLabel,
  overlay,
  children,
  interval = 3200,
}: {
  lead: string;
  sentence: string;
  occasions: string[];
  cards: ReactNode[];
  pickLabel: string;
  overlay?: ReactNode;
  children?: ReactNode;
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(false);

  useEffect(() => {
    if (chosen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % occasions.length), interval);
    return () => clearInterval(timer);
  }, [chosen, occasions.length, interval]);

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="text-center lg:text-left">
        <h1 className="animate-blur-in text-balance text-[clamp(2.3rem,6vw,4.4rem)] font-bold leading-[1.05] tracking-tight">
          <span className="sr-only">{sentence}</span>
          <span aria-hidden>
            {lead}{" "}
            <span className="relative inline-grid overflow-hidden align-bottom text-muted-foreground">
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
      </div>

      <div className="mx-auto w-full max-w-[17rem] sm:max-w-[21rem]">
        <div className="relative aspect-[4/5]">
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
          {overlay}
        </div>
        <div role="group" aria-label={pickLabel} className="mt-8 flex flex-wrap justify-center gap-1.5">
          {occasions.map((occasion, position) => (
            <button
              key={occasion}
              type="button"
              aria-pressed={position === index}
              onClick={() => {
                setIndex(position);
                setChosen(true);
              }}
              className="min-h-9 rounded-full border border-border bg-background/70 px-3 text-xs font-medium text-muted-foreground backdrop-blur transition hover:border-foreground/40 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
            >
              {occasion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
