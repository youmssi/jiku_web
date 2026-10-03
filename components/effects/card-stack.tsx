"use client";

import { motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

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

export function CardStack({ cards, label, autoplay = 3500 }: { cards: ReactNode[]; label: string; autoplay?: number }) {
  const [order, setOrder] = useState(() => cards.map((_, index) => index));
  const [paused, setPaused] = useState(false);

  const sendToBack = (position: number) =>
    setOrder((current) => [current[position], ...current.filter((_, index) => index !== position)]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setOrder((current) => [current[current.length - 1], ...current.slice(0, -1)]), autoplay);
    return () => clearInterval(timer);
  }, [paused, autoplay]);

  return (
    <div
      role="group"
      aria-label={label}
      className="relative size-full [perspective:700px]"
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
}
