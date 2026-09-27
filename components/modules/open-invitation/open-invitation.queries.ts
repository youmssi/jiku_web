import "server-only";

import { publicFetch, serverFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";
import type { OpenInvitation, OrganizerOpenResponse, PublicOpenInvitation } from "./schema";

/** The page of a shared card; null for an unknown code (a 404, never a degraded page). */
export async function fetchPublicOpenInvitation(code: string): Promise<PublicOpenInvitation | null> {
  const response = await publicFetch(`/open/${encodeURIComponent(code)}`);
  if (!response.ok) {
    if (response.status >= 500) reportApiError(response, "open-invitation");
    return null;
  }
  return (await response.json()) as PublicOpenInvitation;
}

/** The event's open invitation; `opened` is false until the organizer opens it, `failed` when the read fails. */
export async function loadOpenInvitation(
  eventId: string,
): Promise<{ invitation: OpenInvitation | null; failed: boolean }> {
  const response = await serverFetch(`/events/${encodeURIComponent(eventId)}/open-invitation`);
  if (response.status === 204) return { invitation: null, failed: false };
  if (!response.ok) {
    reportApiError(response, "open-invitation");
    return { invitation: null, failed: true };
  }
  return { invitation: (await response.json()) as OpenInvitation, failed: false };
}

/** The people who answered, newest first; empty when the read fails. */
export async function loadOpenResponses(eventId: string): Promise<OrganizerOpenResponse[]> {
  const response = await serverFetch(`/events/${encodeURIComponent(eventId)}/open-invitation/responses`);
  if (!response.ok) {
    reportApiError(response, "open-invitation");
    return [];
  }
  return (await response.json()) as OrganizerOpenResponse[];
}
