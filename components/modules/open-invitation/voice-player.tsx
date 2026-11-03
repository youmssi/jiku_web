"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Pause, Play } from "lucide-react";
import type { CardStyle } from "@/lib/card-style";
import { CARD_STYLE_TOKENS } from "@/lib/card-style";
import type { CardVoice } from "./schema";

/**
 * The host's voice message on the card page (JIKU-284). Nothing downloads
 * until the guest taps play, so the page stays light on a metered phone; it
 * never plays by itself. The host's words, when given, show under it for
 * guests who cannot listen.
 */
export function VoicePlayer({ voice, organizer, style }: { voice: CardVoice; organizer: string; style: CardStyle }) {
  const t = useTranslations("guest.openInvitation.voice");
  const tokens = CARD_STYLE_TOKENS[style];
  const audio = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused" | "failed">("idle");
  const [progress, setProgress] = useState(0);

  function toggle() {
    if (!audio.current) {
      const element = new Audio(voice.url);
      element.preload = "auto";
      element.onplaying = () => setState("playing");
      element.onpause = () => setState((current) => (current === "failed" ? current : "paused"));
      element.onended = () => {
        setState("idle");
        setProgress(0);
      };
      element.onerror = () => setState("failed");
      element.ontimeupdate = () => setProgress(element.duration ? element.currentTime / element.duration : 0);
      audio.current = element;
    }
    if (state === "playing") {
      audio.current.pause();
      return;
    }
    setState("loading");
    void audio.current.play().catch(() => setState("failed"));
  }

  const Icon = state === "playing" ? Pause : state === "loading" ? Loader2 : Play;
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={state === "playing" ? t("pause") : t("play", { organizer, seconds: voice.durationSeconds })}
        className="relative flex min-h-14 items-center gap-3 overflow-hidden border bg-white px-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ borderRadius: Math.min(tokens.radius, 18), borderColor: `color-mix(in srgb, ${tokens.panelInk} 14%, transparent)` }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 transition-[width] duration-200 motion-reduce:transition-none"
          style={{ width: `${progress * 100}%`, background: tokens.soft }}
        />
        <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full" style={{ background: tokens.panelInk, color: tokens.panel }}>
          <Icon aria-hidden className={state === "loading" ? "size-4 animate-spin motion-reduce:animate-none" : "size-4"} />
        </span>
        <span className="relative flex flex-col">
          <span className="text-sm font-semibold">{t("title", { organizer })}</span>
          <span className="text-xs" style={{ color: tokens.panelMuted }}>
            {state === "failed" ? t("failed") : t("length", { seconds: voice.durationSeconds })}
          </span>
        </span>
      </button>
      {voice.transcript ? (
        <p className="text-sm italic" style={{ color: tokens.panelMuted }}>
          « {voice.transcript} »
        </p>
      ) : null}
    </div>
  );
}
