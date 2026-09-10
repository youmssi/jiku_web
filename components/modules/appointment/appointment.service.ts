"use server";

import { publicFetch } from "@/lib/api-server";
import { type ActionResult, fail, fromResponse, ok } from "@/lib/action-result";
import type {
  AppointmentBookingView,
  AppointmentServiceView,
  AppointmentStatusView,
  BookingInput,
} from "@/components/modules/appointment/schema";

/**
 * Référence du lien de réservation : soit le jeton signé historique
 * (/appointments/{token}), soit le code court partagé (/r/{code}). Le client
 * n'a pas de compte ; la référence du lien porte le tenant et le service.
 */
export type AppointmentLinkRef = { token: string } | { code: string };

function basePath(ref: AppointmentLinkRef): string {
  return "token" in ref
    ? `/appointments/${encodeURIComponent(ref.token)}`
    : `/r/${encodeURIComponent(ref.code)}`;
}

/** Service et créneaux ouverts du jour (ou du [date] ISO) — sans compte. */
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
  return fromResponse<AppointmentBookingView>(response, {
    409: "Ce créneau vient d'être pris. Choisissez-en un autre.",
    default: "La réservation a échoué. Réessayez.",
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
    if (response.status === 404) {
      return fail("Cette réservation est introuvable.");
    }
    if (response.status === 409) {
      return fail("Ce rendez-vous ne peut plus être annulé.");
    }
    return fail("L'annulation a échoué. Réessayez.");
  }
  return ok(null);
}
