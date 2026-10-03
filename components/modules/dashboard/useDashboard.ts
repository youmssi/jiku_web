"use client";

import { useCallback, useEffect, useState } from "react";
import { useLiveSignal } from "@/components/shared";
import { fetchDashboardAction, fetchDashboardLiveTicketAction } from "@/components/modules/dashboard/dashboard.service";
import type { DashboardData } from "@/components/modules/dashboard/schema";

/** Without the live stream, how often the dashboard reloads. */
const POLL_INTERVAL_MS = 7000;
/** With it, a safety reload for changes the stream cannot see. */
const LIVE_POLL_INTERVAL_MS = 60_000;

/**
 * Cache layer for the event dashboard. Seeds from the server-rendered snapshot,
 * then reloads as soon as the live stream says an answer, a ticket or a
 * check-in landed (JIKU-214), and slowly in any case; without the stream it
 * polls every 7 s. Nothing reloads while the tab is hidden.
 */
export function useDashboard(eventId: string, initial: DashboardData) {
  const [data, setData] = useState<DashboardData>(initial);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const reload = useCallback(async () => {
    if (document.visibilityState === "hidden") return;
    const result = await fetchDashboardAction(eventId);
    if (result.ok) {
      setData(result.data);
      setUpdatedAt(Date.now());
    }
  }, [eventId]);

  const live = useLiveSignal(eventId, () => fetchDashboardLiveTicketAction(eventId), () => void reload());

  useEffect(() => {
    const timer = setInterval(() => void reload(), live ? LIVE_POLL_INTERVAL_MS : POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reload, live]);

  return { data, updatedAt, live };
}
