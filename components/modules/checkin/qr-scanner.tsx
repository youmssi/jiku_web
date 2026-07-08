"use client";

import { useEffect, useRef, useState } from "react";

interface QrScannerProps {
  /** Called with the decoded text the first time a QR is read; paused while a result shows. */
  onDetect: (value: string) => void;
  /** When false, the camera keeps running but decoding is suspended (e.g. a result is on screen). */
  active: boolean;
}

const DECODE_INTERVAL_MS = 180;

/**
 * Camera-based QR scanner. Streams the rear camera via `getUserMedia` and decodes
 * frames with `jsQR` (dynamically imported, so it stays out of the initial bundle).
 * This is the single most network-sensitive screen in the product, so decoding is
 * fully client-side — no per-frame round trips.
 */
export function QrScanner({ onDetect, active }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastDecodeRef = useRef(0);
  const activeRef = useRef(active);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    let decode: ((data: Uint8ClampedArray, w: number, h: number) => unknown) | null = null;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This device or browser doesn't support camera access.");
        return;
      }
      try {
        const mod = await import("jsqr");
        decode = (data, w, h) => mod.default(data, w, h, { inversionAttempts: "dontInvert" });
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        loop();
      } catch {
        if (!cancelled) {
          setError("Camera unavailable. Grant camera access or use search instead.");
        }
      }
    }

    function loop() {
      rafRef.current = requestAnimationFrame(loop);
      const video = videoRef.current;
      if (!video || !decode || !activeRef.current) return;
      if (video.readyState < video.HAVE_ENOUGH_DATA) return;

      const now = performance.now();
      if (now - lastDecodeRef.current < DECODE_INTERVAL_MS) return;
      lastDecodeRef.current = now;

      const canvas = (canvasRef.current ??= document.createElement("canvas"));
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width === 0 || height === 0) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, width, height);
      const image = ctx.getImageData(0, 0, width, height);
      const result = decode(image.data, width, height) as { data: string } | null;
      if (result && result.data) {
        onDetect(result.data);
      }
    }

    start();
    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onDetect]);

  if (error) {
    return (
      <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-400">
        {error}
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-2/3 w-2/3 rounded-2xl border-2 border-white/80 shadow-[0_0_0_100vmax_rgba(0,0,0,0.35)]" />
      </div>
    </div>
  );
}
