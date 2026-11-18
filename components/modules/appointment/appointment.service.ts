"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { serviceCardSource, type ServiceCardSource } from "./service-card-link";
import { publicFetch } from "@/lib/api-server";
import { type ActionResult, fail, fromResponse, ok, reportApiError } from "@/lib/action-result";
import type { LiveTicket } from "@/components/shared";
import type {
  AppointmentBookingView,
  AppointmentServiceView,
  AppointmentStatusView,
  BookingInput,
  ClientLineTicketView,
  TakeLineTicketInput,
} from "@/components/modules/appointment/schema";

/**
 * The booking link a client holds: the historical signed token
 * (/appointments/{token}) or the shared short code (/r/{code}). The client has
 * no account; the link carries the organization and the service.
 */
export type AppointmentLinkRef = { token: string } | { code: string };

function basePath(ref: AppointmentLinkRef): string {
  return "token" in ref
    ? `/appointments/${encodeURIComponent(ref.token)}`
    : `/r/${encodeURIComponent(ref.code)}`;
}

/** The service and its open times for today, or for the ISO [date]; no account needed. */
export async function loadAppointment(
  ref: AppointmentLinkRef,
  date?: string,
  upcoming = false,
): Promise<AppointmentServiceView | null> {
  const query = new URLSearchParams();
  if (date) query.set("date", date);
  // The next free times exist on a service's short link only (JIKU-190).
  if (upcoming && "code" in ref) query.set("upcoming", "true");
  const params = query.size > 0 ? `?${query}` : "";
  const response = await publicFetch(`${basePath(ref)}${params}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as AppointmentServiceView;
}

export async function bookAppointment(
  ref: AppointmentLinkRef,
  input: BookingInput,
  source?: ServiceCardSource | null,
): Promise<ActionResult<AppointmentBookingView>> {
  const response = await publicFetch(basePath(ref) + "/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, source: serviceCardSource(source) }),
  });
  const t = await getTranslations("guest.appointment.errors");
  return fromResponse<AppointmentBookingView>(response, {
    409: t("taken"),
    423: t("paused"),
    default: t("failed"),
  });
}

/**
 * Counts an open of a service's shared link or card (JIKU-189). The page sends
 * it once loaded in a browser; the API counts each visitor once a day from
 * their address and browser, which this relays.
 */
export async function recordServiceOpenAction(code: string, source: string): Promise<void> {
  const tag = serviceCardSource(source);
  if (!tag || !/^[A-Za-z0-9]{4,16}$/.test(code)) return;
  const agent = ((await headers()).get("user-agent") ?? "").slice(0, 500);
  const response = await publicFetch(`/r/${encodeURIComponent(code)}/open`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: tag, agent }),
  }).catch(() => null);
  if (response && !response.ok && response.status !== 429) reportApiError(response, "service-card");
}

export async function loadBookingStatus(
  ref: AppointmentLinkRef,
  bookingToken: string,
): Promise<AppointmentStatusView | null> {
  const response = await publicFetch(
    `${basePath(ref)}/booking/${encodeURIComponent(bookingToken)}`,
  );
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as AppointmentStatusView;
}

export async function cancelAppointment(
  ref: AppointmentLinkRef,
  bookingToken: string,
): Promise<ActionResult<null>> {
  const response = await publicFetch(
    `${basePath(ref)}/booking/${encodeURIComponent(bookingToken)}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    const t = await getTranslations("guest.appointment.errors");
    if (response.status === 404) return fail(t("notFound"));
    if (response.status === 409) return fail(t("notCancellable"));
    reportApiError(response);
    return fail(t("cancelFailed"));
  }
  return ok(null);
}

/** A client takes a ticket for today's line from the QR shown at the entrance (JIKU-113). */
export async function takeLineTicket(
  ref: AppointmentLinkRef,
  input: TakeLineTicketInput,
): Promise<ActionResult<ClientLineTicketView>> {
  const response = await publicFetch(`${basePath(ref)}/line`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const t = await getTranslations("guest.line.errors");
  return fromResponse<ClientLineTicketView>(response, {
    400: t("invalid"),
    404: t("closed"),
    409: t("closed"),
    423: t("paused"),
    default: t("failed"),
  });
}

/** The client's place in today's line; null once the ticket is no longer in it. */
/** A ticket to follow one's place in the line live (JIKU-214); null once the ticket left today's line. */
export async function loadLineLiveTicket(ref: AppointmentLinkRef, ticketCode: string): Promise<LiveTicket | null> {
  const response = await publicFetch(`${basePath(ref)}/line/${encodeURIComponent(ticketCode)}/live`, { method: "POST" });
  return response.ok ? ((await response.json()) as LiveTicket) : null;
}

export async function loadLineTicket(
  ref: AppointmentLinkRef,
  ticketCode: string,
): Promise<ClientLineTicketView | null> {
  const response = await publicFetch(`${basePath(ref)}/line/${encodeURIComponent(ticketCode)}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as ClientLineTicketView;
}
