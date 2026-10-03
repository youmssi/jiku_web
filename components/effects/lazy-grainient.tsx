"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { GrainientProps } from "./grainient";

const Grainient = dynamic(() => import("./grainient").then((module) => module.Grainient), { ssr: false });

/**
 * Loads the WebGL background only on wide screens that can show it: phones
 * keep the CSS gradient [fallback] and download nothing more. The fallback is
 * server rendered, so the first paint never waits for the shader.
 */
export function LazyGrainient({
  fallback,
  minWidth = 768,
  ...props
}: GrainientProps & { fallback: string; minWidth?: number }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [minWidth]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={{ background: fallback }} />
      {enabled ? <Grainient {...props} className="absolute inset-0 animate-in fade-in duration-1000" /> : null}
    </div>
  );
}
