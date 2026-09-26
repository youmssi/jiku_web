import { eventGuestsRoute, eventSettingsRoute, eventTicketsRoute } from "@/lib/constants";
import type { PublishCheckKey } from "./event.queries";

/** The tab (and section) where each publish requirement is fixed. */
export function publishCheckHref(key: PublishCheckKey, eventId: string): string {
  switch (key) {
    case "details":
      return `${eventSettingsRoute(eventId)}#details`;
    case "channels":
      return `${eventSettingsRoute(eventId)}#invitations`;
    case "guests":
      return eventGuestsRoute(eventId);
    case "tickets":
      return eventTicketsRoute(eventId);
  }
}
