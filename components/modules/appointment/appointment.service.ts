"use server";

import { getTranslations } from "next-intl/server";
import { publicFetch } from "@/lib/api-server";
import { type ActionResult, fail, fromResponse, ok, reportApiError } from "@/lib/action-result";
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
): Promise<AppointmentServiceView | null> {
  const params = date ? `?date=${encodeURIComponent(date)}` : "";
  const response = await publicFetch(`${basePath(ref)}${params}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as AppointmentServiceView;
}

export async function bookAppointment(
  ref: AppointmentLinkRef,
  input: BookingInput,
): Promise<ActionResult<AppointmentBookingView>> {
  const response = await publicFetch(basePath(ref) + "/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const t = await getTranslations("guest.appointment.errors");
  return fromResponse<AppointmentBookingView>(response, {
    409: t("taken"),
    default: t("failed"),
  });
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
    default: t("failed"),
  });
}

/** The client's place in today's line; null once the ticket is no longer in it. */
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
