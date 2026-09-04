"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchDayLineAction } from "@/components/modules/dayline/dayline.service";
import type { DayLineAuth, DayLineView } from "@/components/modules/dayline/schema";

const POLL_INTERVAL_MS = 10_000;

/**
 * Cache/polling layer of the day-line console. Seeded from the server-rendered
 * snapshot, then refreshed every 10 s because several counters act on the same
 * line — a colleague's action must show up without anyone reloading. Polling
 * pauses while the tab is hidden and resumes on return.
 */
export function useDayLine(auth: DayLineAuth, initial: DayLineView) {
  const [view, setView] = useState<DayLineView>(initial);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const result = await fetchDayLineAction(auth);
    if (result.ok) {
      setView(result.data);
      setUpdatedAt(Date.now());
    }
  }, [auth]);

  useEffect(() => {
    let active = true;

    async function poll() {
      if (document.visibilityState === "hidden") return;
      const result = await fetchDayLineAction(auth);
      if (active && result.ok) {
        setView(result.data);
        setUpdatedAt(Date.now());
      }
    }

    timer.current = setInterval(poll, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      if (timer.current) clearInterval(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [auth]);

  return { view, updatedAt, refresh };
}
