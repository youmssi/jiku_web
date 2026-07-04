"use client";

import { useEffect, useRef, useState } from "react";
import { fetchDashboardAction } from "@/components/modules/dashboard/dashboard.service";
import type { DashboardData } from "@/components/modules/dashboard/schema";

const POLL_INTERVAL_MS = 7000;

/**
 * Cache/polling layer for the event dashboard. Seeds from the server-rendered
 * snapshot and refreshes on an interval so the organizer sees RSVPs and check-ins
 * land without refreshing. Polling pauses while the tab is hidden to avoid wasted
 * requests, and resumes on return.
 */
export function useDashboard(eventId: string, initial: DashboardData) {
  const [data, setData] = useState<DashboardData>(initial);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      if (document.visibilityState === "hidden") return;
      const result = await fetchDashboardAction(eventId);
      if (active && result.ok) {
        setData(result.data);
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
  }, [eventId]);

  return { data, updatedAt };
}
