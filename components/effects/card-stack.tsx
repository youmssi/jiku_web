"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Stack adapted from React Bits (reactbits.dev, MIT + Commons Clause): a pile
// of cards to drag or tap through. The cards arrive already rendered by the
// server; this only moves them.

function Draggable({ children, onSendToBack }: { children: ReactNode; onSendToBack: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  function onDragEnd(_event: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > 120 || Math.abs(info.offset.y) > 120) onSendToBack();
    else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      onDragEnd={onDragEnd}
    >
      {children}
    </motion.div>
  );
}

/**
 * [choices] adds one toggle per card above the pile: pressing one brings that
 * card to the front and stops the autoplay, so the buttons always do what they
 * look like they do. [className] sizes the pile itself.
 */
export function CardStack({
  cards,
  label,
  choices,
  className,
  autoplay = 3500,
}: {
  cards: ReactNode[];
  label: string;
  choices?: { labels: string[]; groupLabel: string };
  className?: string;
  autoplay?: number;
}) {
  const [order, setOrder] = useState(() => cards.map((_, index) => index));
  const [paused, setPaused] = useState(false);
  const [chosen, setChosen] = useState(false);
  const front = order[order.length - 1];

  const sendToBack = (position: number) =>
    setOrder((current) => [current[position], ...current.filter((_, index) => index !== position)]);

  const bringToFront = (cardIndex: number) => {
    setChosen(true);
    setOrder((current) => [...current.filter((index) => index !== cardIndex), cardIndex]);
  };

  useEffect(() => {
    if (paused || chosen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setOrder((current) => [current[current.length - 1], ...current.slice(0, -1)]), autoplay);
    return () => clearInterval(timer);
  }, [paused, chosen, autoplay]);

  const pile = (
    <div
      role="group"
      aria-label={label}
      className={cn("relative [perspective:700px]", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {order.map((cardIndex, position) => (
        <Draggable key={cardIndex} onSendToBack={() => sendToBack(position)}>
          <motion.div
            className="size-full"
            onClick={() => sendToBack(position)}
            animate={{
              rotateZ: (order.length - position - 1) * 4,
              scale: 1 + position * 0.06 - order.length * 0.06,
              transformOrigin: "90% 90%",
            }}
            initial={false}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            {cards[cardIndex]}
          </motion.div>
        </Draggable>
      ))}
    </div>
  );

  if (!choices) return pile;

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div role="group" aria-label={choices.groupLabel} className="flex flex-wrap justify-center gap-2">
        {choices.labels.map((choice, cardIndex) => (
          <button
            key={choice}
            type="button"
            aria-pressed={front === cardIndex}
            onClick={() => bringToFront(cardIndex)}
            className="min-h-10 rounded-full border border-border bg-background/80 px-4 text-sm font-semibold backdrop-blur transition hover:border-foreground/40 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {choice}
          </button>
        ))}
      </div>
      {pile}
    </div>
  );
}
