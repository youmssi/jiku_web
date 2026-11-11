import "server-only";

import { icsCalendar } from "@/components/shared";
import { siteUrl } from "@/components/modules/seo";
import { openInvitationRoute } from "@/lib/constants";
import { fetchPublicOpenInvitation } from "./open-invitation.queries";

/**
 * The card's event as an iCalendar file (JIKU-289), for agendas other than
 * Google's; null for an unknown card or one without a date.
 */
export async function cardCalendar(code: string): Promise<{ fileName: string; body: string } | null> {
  const invitation = await fetchPublicOpenInvitation(code);
  if (!invitation?.eventStart) return null;
  const url = `${siteUrl()}${openInvitationRoute(invitation.code)}`;
  return {
    fileName: `${invitation.eventName.replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, " ").trim() || "invitation"}.ics`,
    body: icsCalendar({
      uid: `card-${invitation.code}@jiku`,
      title: invitation.eventName,
      start: invitation.eventStart,
      end: invitation.eventEnd ?? null,
      location: invitation.eventLocation ?? null,
      details: `${invitation.organizerName}\n${url}`,
      url,
    }),
  };
}
