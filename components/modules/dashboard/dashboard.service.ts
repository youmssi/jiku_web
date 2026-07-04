"use server";

import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fromResponse } from "@/lib/action-result";
import type { DashboardData } from "@/components/modules/dashboard/schema";

/**
 * Fetches an event's live dashboard metrics. Called once server-side for the
 * initial render and then polled from the client for near-real-time updates.
 */
export async function fetchDashboardAction(
  eventId: string,
): Promise<ActionResult<DashboardData>> {
  const response = await serverFetch(`/events/${eventId}/dashboard`);
  return fromResponse<DashboardData>(response, {
    default: "Couldn't load the latest metrics.",
  });
}
