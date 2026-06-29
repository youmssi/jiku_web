"use server";

import { serverFetch } from "@/lib/api-server";
import type { DashboardData } from "@/components/modules/organizer/dashboard-types";

/**
 * Fetches an event's live dashboard metrics. Called once server-side for the
 * initial render and then polled from the client for near-real-time updates.
 */
export async function fetchDashboardAction(
  eventId: string,
): Promise<{ data?: DashboardData; error?: string }> {
  const response = await serverFetch(`/events/${eventId}/dashboard`);
  if (!response.ok) {
    return { error: "Couldn't load the latest metrics." };
  }
  return { data: (await response.json()) as DashboardData };
}
