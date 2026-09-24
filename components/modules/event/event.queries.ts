import "server-only";

import { cache } from "react";
import { localeRedirect } from "@/i18n/redirect";
import { reportApiError } from "@/lib/action-result";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import { utcToLocalInput } from "@/lib/datetime";
import type { EventFormValues, EventResponse, TicketTypeResponse } from "./schema";

export type EventLoad =
  | { kind: "ok"; event: EventResponse }
  | { kind: "not-found" }
  | { kind: "error" };

/**
 * Reads one event for its workspace. Memoized per request: the workspace layout,
 * the tab it wraps and the publish checklist all read the same event, once.
 * A 404 also covers an event of another organization, which the tenant filter
 * hides.
 */
export const loadEvent = cache(async function loadEvent(id: string): Promise<EventLoad> {
  const response = await serverFetch(`/events/${id}`);
  if (response.status === 401) {
    return localeRedirect(ROUTES.LOGIN);
  }
  if (response.status === 404 || response.status === 400) {
    return { kind: "not-found" };
  }
  if (!response.ok) {
    reportApiError(response, "event");
    return { kind: "error" };
  }
  return { kind: "ok", event: (await response.json()) as EventResponse };
});

/** The event's ticket categories; empty when they cannot load, so the page still opens. */
export const loadTicketTypes = cache(async function loadTicketTypes(id: string): Promise<TicketTypeResponse[]> {
  const response = await serverFetch(`/events/${id}/ticket-types`);
  if (!response.ok) {
    reportApiError(response, "event");
    return [];
  }
  return (await response.json()) as TicketTypeResponse[];
});

/** The organization's currency, which every ticket price is stated in. */
export async function loadOrganizationCurrency(): Promise<string | null> {
  const response = await serverFetch("/orgs/profile");
  if (!response.ok) {
    reportApiError(response, "event");
    return null;
  }
  const profile = (await response.json()) as { currency?: string | null };
  return profile.currency ?? null;
}

async function loadGuestCount(id: string): Promise<number | null> {
  const response = await serverFetch(`/events/${id}/dashboard`);
  if (!response.ok) return null;
  const dashboard = (await response.json()) as { totalGuests?: number };
  return dashboard.totalGuests ?? null;
}

export type PublishCheckKey = "details" | "channels" | "guests" | "tickets";

export interface PublishCheck {
  key: PublishCheckKey;
  done: boolean;
  /** Required checks block publishing; the others are advice. */
  required: boolean;
}

export interface PublishChecklist {
  checks: PublishCheck[];
  ready: boolean;
}

/**
 * What a draft still needs before it goes live. The required checks mirror the
 * backend's own publish rule (a name, a start time, an invitation channel), so
 * the button is never enabled for a publish the API would refuse.
 */
export const loadPublishChecklist = cache(async function loadPublishChecklist(
  event: EventResponse,
): Promise<PublishChecklist> {
  const [guestCount, ticketTypes] = await Promise.all([
    loadGuestCount(event.id),
    loadTicketTypes(event.id),
  ]);
  const checks: PublishCheck[] = [
    { key: "details", done: Boolean(event.name?.trim() && event.startDateTime), required: true },
    { key: "channels", done: event.invitationChannels.length > 0, required: true },
    { key: "guests", done: (guestCount ?? 0) > 0, required: false },
    { key: "tickets", done: ticketTypes.length > 0, required: false },
  ];
  return { checks, ready: checks.every((check) => check.done || !check.required) };
});

/** The settings form's values for an event, its instants shown in the event's own timezone. */
export function toEventFormValues(event: EventResponse): EventFormValues {
  return {
    name: event.name,
    description: event.description ?? "",
    timezone: event.timezone,
    startLocal: utcToLocalInput(event.startDateTime, event.timezone),
    endLocal: utcToLocalInput(event.endDateTime, event.timezone),
    location: event.location ?? "",
    transferAllowed: event.settings.transferAllowed,
    transferDeadlineLocal: utcToLocalInput(event.settings.transferDeadline, event.timezone),
    overbookingAllowed: event.settings.overbookingAllowed,
    maxOverbookingCount: event.settings.maxOverbookingCount,
    invitationChannels: event.invitationChannels,
  };
}
