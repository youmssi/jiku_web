import "server-only";

import { localeRedirect } from "@/i18n/redirect";
import { reportApiError } from "@/lib/action-result";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import type { DayLineView, LineStatus, PendingAppointmentRequest } from "@/components/modules/dayline";
import type { EventListItem } from "@/components/modules/event";
import type { ServiceSummary } from "@/components/modules/services";

/** How many services get their line read on the Today page; the rest are one click away. */
const TODAY_SERVICE_LIMIT = 6;
const TODAY_EVENT_LIMIT = 5;

export interface LineSummary {
  /** Arrived and waiting to be called. */
  waiting: number;
  /** Called or at the counter right now. */
  serving: number;
  done: number;
  /** Appointments booked for today whose client has not arrived yet. */
  expected: number;
  /** Start of the next appointment still expected, if any. */
  nextStartsAt: string | null;
}

export interface ServiceToday {
  id: string;
  name: string;
  timezone: string;
  /** Null when the line could not be read; the card then offers to open it anyway. */
  line: LineSummary | null;
  pendingRequests: number;
}

export interface TodayEvent {
  id: string;
  name: string;
  status: string;
  startDateTime: string | null;
  endDateTime: string | null;
  timezone: string;
  location: string | null;
}

export interface TodayOverview {
  upcomingEvents: TodayEvent[];
  draftEvents: TodayEvent[];
  services: ServiceToday[];
  eventCount: number;
  serviceCount: number;
}

const SERVING: ReadonlySet<LineStatus> = new Set(["CALLED", "IN_SERVICE"]);

async function readList<T>(path: string): Promise<T[]> {
  const response = await serverFetch(path);
  if (response.status === 401) {
    return localeRedirect(ROUTES.LOGIN);
  }
  if (!response.ok) {
    reportApiError(response, "dashboard");
    return [];
  }
  return (await response.json()) as T[];
}

function summarizeLine(view: DayLineView, now: number): LineSummary {
  let waiting = 0;
  let serving = 0;
  let done = 0;
  let expected = 0;
  let nextStartsAt: string | null = null;
  for (const entry of view.entries) {
    if (entry.status === "WAITING") waiting += 1;
    else if (SERVING.has(entry.status)) serving += 1;
    else if (entry.status === "DONE") done += 1;
    else if (entry.status === "ISSUED" && entry.kind === "APPOINTMENT") {
      expected += 1;
      const startsAt = entry.startsAt;
      if (startsAt && Date.parse(startsAt) >= now && (!nextStartsAt || startsAt < nextStartsAt)) {
        nextStartsAt = startsAt;
      }
    }
  }
  return { waiting, serving, done, expected, nextStartsAt };
}

async function loadServiceToday(service: ServiceSummary, now: number): Promise<ServiceToday> {
  const base = `/services/${service.id}/day-line`;
  const [lineResponse, requestsResponse] = await Promise.all([
    serverFetch(base),
    serverFetch(`${base}/requests`),
  ]);
  if (!lineResponse.ok) reportApiError(lineResponse, "dashboard");
  const line = lineResponse.ok
    ? summarizeLine((await lineResponse.json()) as DayLineView, now)
    : null;
  const requests = requestsResponse.ok
    ? ((await requestsResponse.json()) as PendingAppointmentRequest[])
    : [];
  return {
    id: service.id,
    name: service.name,
    timezone: service.timezone,
    line,
    pendingRequests: requests.length,
  };
}

function toTodayEvent(event: EventListItem): TodayEvent {
  return {
    id: event.id ?? "",
    name: event.name ?? "",
    status: event.status ?? "",
    startDateTime: event.startDateTime ?? null,
    endDateTime: event.endDateTime ?? null,
    timezone: event.timezone ?? "",
    location: event.location ?? null,
  };
}

function isUpcoming(event: TodayEvent, now: number): boolean {
  if (event.status !== "PUBLISHED" || !event.startDateTime) return false;
  return Date.parse(event.endDateTime ?? event.startDateTime) >= now;
}

/**
 * Everything the organizer's Today page shows, read in parallel: today's line
 * for each service (with appointment requests waiting for an answer), the
 * published events still ahead, and the drafts not yet sent out. A failing
 * read degrades its own block instead of taking the page down.
 */
export async function loadTodayOverview(): Promise<TodayOverview> {
  const now = Date.now();
  const [events, services] = await Promise.all([
    readList<EventListItem>("/events").then((list) => list.map(toTodayEvent)),
    readList<ServiceSummary>("/services"),
  ]);

  const upcomingEvents = events
    .filter((event) => isUpcoming(event, now))
    .sort((a, b) => Date.parse(a.startDateTime ?? "") - Date.parse(b.startDateTime ?? ""))
    .slice(0, TODAY_EVENT_LIMIT);
  const draftEvents = events.filter((event) => event.status === "DRAFT");
  const servicesToday = await Promise.all(
    services.slice(0, TODAY_SERVICE_LIMIT).map((service) => loadServiceToday(service, now)),
  );

  return {
    upcomingEvents,
    draftEvents,
    services: servicesToday,
    eventCount: events.length,
    serviceCount: services.length,
  };
}
