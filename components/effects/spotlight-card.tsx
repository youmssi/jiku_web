"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A card whose surface lights up under the pointer (adapted from React Bits'
 * SpotlightCard): CSS only, no animation library. On touch screens it simply
 * stays a card, which is what most of the audience sees.
 */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lit, setLit] = useState(false);

  return (
    <div
      ref={ref}
      onPointerMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }}
      onPointerEnter={() => setLit(true)}
      onPointerLeave={() => setLit(false)}
      className={cn("relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: lit ? 1 : 0,
          background: `radial-gradient(420px circle at ${position.x}px ${position.y}px, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
