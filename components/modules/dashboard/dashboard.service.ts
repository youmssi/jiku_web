"use server";

import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fromResponse } from "@/lib/action-result";
import type { AnalyticsData, DashboardData } from "@/components/modules/dashboard/schema";

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

/** Fetches an event's trend data (check-in timeline, channel breakdown, guest growth). */
export async function fetchAnalyticsAction(
  eventId: string,
): Promise<ActionResult<AnalyticsData>> {
  const response = await serverFetch(`/events/${eventId}/analytics`);
  return fromResponse<AnalyticsData>(response, {
    default: "Couldn't load this event's trend data.",
  });
}

/** Fetches one event's name for navigation chrome (breadcrumbs); null when unavailable. */
export async function getEventNameAction(eventId: string): Promise<string | null> {
  const response = await serverFetch(`/events/${eventId}`);
  if (!response.ok) {
    return null;
  }
  const event = (await response.json().catch(() => null)) as { name?: string } | null;
  return event?.name ?? null;
}
