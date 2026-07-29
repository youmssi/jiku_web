"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/** Fires a tracking event once when the surrounding section mounts (JIKU-59) — for "viewed" events with no click to hang off. */
export function ViewTracker({ eventName, eventProperties }: { eventName: string; eventProperties?: Record<string, unknown> }) {
  useEffect(() => {
    trackEvent(eventName, eventProperties);
    // Fire once per mount only — dependencies intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
