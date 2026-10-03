"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { AuroraProps } from "./aurora";
import type { GrainientProps } from "./grainient";

const Grainient = dynamic(() => import("./grainient").then((module) => module.Grainient), { ssr: false });
const Aurora = dynamic(() => import("./aurora").then((module) => module.Aurora), { ssr: false });

type Background = ({ kind: "grainient" } & GrainientProps) | ({ kind: "aurora" } & AuroraProps);

/**
 * A WebGL background loaded only on wide screens that can show it: phones
 * keep the CSS gradient [fallback] and download nothing more. The fallback is
 * server rendered, so the first paint never waits for the shader.
 */
export function LazyBackground({
  fallback,
  minWidth = 768,
  ...background
}: Background & { fallback: string; minWidth?: number }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [minWidth]);

  const fade = "absolute inset-0 animate-in fade-in duration-1000";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={{ background: fallback }} />
      {enabled && background.kind === "grainient" ? <Grainient {...background} className={fade} /> : null}
      {enabled && background.kind === "aurora" ? <Aurora {...background} className={fade} /> : null}
    </div>
  );
}
