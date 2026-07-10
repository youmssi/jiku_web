"use server";

import { serverFetch } from "@/lib/api-server";
import { type ActionResult, fromResponse } from "@/lib/action-result";
import type { AnalyticsData } from "@/components/modules/analytics/schema";

/** Fetches an event's trend data (check-in timeline, channel breakdown, guest growth). */
export async function fetchAnalyticsAction(
  eventId: string,
): Promise<ActionResult<AnalyticsData>> {
  const response = await serverFetch(`/events/${eventId}/analytics`);
  return fromResponse<AnalyticsData>(response, {
    default: "Couldn't load this event's analytics.",
  });
}
