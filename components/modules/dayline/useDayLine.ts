"use client";

import { useCallback, useEffect, useState } from "react";
import { useLiveSignal } from "@/components/shared";
import { fetchDayLineAction, fetchDayLineLiveTicketAction } from "@/components/modules/dayline/dayline.service";
import type { DayLineAuth, DayLineView } from "@/components/modules/dayline/schema";

/** Without the live stream, how often the line reloads. */
const POLL_INTERVAL_MS = 10_000;
/** With it, a safety reload for changes the stream cannot see. */
const LIVE_POLL_INTERVAL_MS = 60_000;

/** What the line is: the same service from the organizer's account or a counter link. */
export function dayLineKey(auth: DayLineAuth): string {
  return auth.kind === "organizer" ? auth.serviceId : auth.base;
}

/**
 * Cache layer of the day-line console. Seeded from the server-rendered
 * snapshot, then reloaded as soon as the live stream says the line moved
 * (JIKU-214) — several counters act on the same line — and slowly in any case;
 * without the stream it polls every 10 s. Nothing reloads while the tab is hidden.
 */
export function useDayLine(auth: DayLineAuth, initial: DayLineView) {
  const [view, setView] = useState<DayLineView>(initial);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const result = await fetchDayLineAction(auth);
    if (result.ok) {
      setView(result.data);
      setUpdatedAt(Date.now());
    }
  }, [auth]);

  const reload = useCallback(async () => {
    if (document.visibilityState === "hidden") return;
    await refresh();
  }, [refresh]);

  const live = useLiveSignal(dayLineKey(auth), () => fetchDayLineLiveTicketAction(auth), () => void reload());

  useEffect(() => {
    const timer = setInterval(() => void reload(), live ? LIVE_POLL_INTERVAL_MS : POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reload, live]);

  return { view, updatedAt, refresh, live };
}
