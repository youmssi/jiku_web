"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { AuroraProps } from "./aurora";
import type { GrainientProps } from "./grainient";

const Grainient = dynamic(() => import("./grainient").then((module) => module.Grainient), { ssr: false });
const Aurora = dynamic(() => import("./aurora").then((module) => module.Aurora), { ssr: false });

type Background = ({ kind: "grainient" } & GrainientProps) | ({ kind: "aurora" } & AuroraProps);

/** Renderers that draw WebGL on the CPU (Chrome's fallback, Mesa, Windows without a driver). */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/**
 * True when the browser can draw WebGL on a GPU. Without one it renders the
 * shader on the CPU, which costs every frame of the main thread: such machines
 * keep the CSS gradient. A browser whose GPU is blocklisted falls back to a
 * software renderer, which only its name gives away.
 */
function hasHardwareWebGl(): boolean {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
  if (!gl) return false;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return !SOFTWARE_RENDERER.test(renderer);
}

/** Runs [start] once the page has settled, so the shader never competes with the first render. */
function whenIdle(start: () => void): () => void {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(start, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(start, 1200);
  return () => clearTimeout(id);
}

/**
 * A WebGL background loaded only on wide screens with a GPU, once the page is
 * idle: phones and software-rendered browsers keep the CSS gradient [fallback]
 * and download nothing more. The fallback is server rendered, so the first
 * paint never waits for the shader.
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
    let listening = false;
    const cancel = whenIdle(() => {
      if (!hasHardwareWebGl()) return;
      update();
      query.addEventListener("change", update);
      listening = true;
    });
    return () => {
      cancel();
      if (listening) query.removeEventListener("change", update);
    };
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
