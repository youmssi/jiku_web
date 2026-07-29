"use server";

import { publicFetch } from "@/lib/api-server";
import { type ActionResult, fail, fromResponse, ok, reportApiError } from "@/lib/action-result";
import type {
  BookingCreationResult,
  BookingPayeeDetails,
  BookingQuote,
  BookingStatusView,
  DeclarePaymentInput,
  PaymentDeclarationResult,
  ReservationInput,
} from "@/components/modules/booking/schema";

/** Live tier/deposit preview as the guest count changes — never writes anything. */
export async function quoteBookingAction(guestCountEstimate: number): Promise<BookingQuote | null> {
  if (!Number.isFinite(guestCountEstimate) || guestCountEstimate <= 0) {
    return null;
  }
  const params = new URLSearchParams({ guestCountEstimate: String(Math.trunc(guestCountEstimate)) });
  const response = await publicFetch(`/bookings/quote?${params.toString()}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as BookingQuote;
}

export async function createReservationAction(
  input: ReservationInput,
  acquisitionSource: string | null,
): Promise<ActionResult<BookingCreationResult>> {
  const response = await publicFetch("/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, acquisitionSource }),
  });
  return fromResponse<BookingCreationResult>(response, {
    400: "Pour une estimation au-delà de 1 000 invités, contactez directement notre équipe commerciale.",
    default: "Une erreur est survenue. Merci de réessayer.",
  });
}

export async function fetchBookingStatus(id: string, token: string): Promise<BookingStatusView | null> {
  const response = await publicFetch(`/bookings/${id}?token=${encodeURIComponent(token)}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as BookingStatusView;
}

export async function fetchBookingPayee(id: string, token: string): Promise<BookingPayeeDetails | null> {
  const response = await publicFetch(`/bookings/${id}/payee?token=${encodeURIComponent(token)}`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as BookingPayeeDetails;
}

export async function declarePaymentAction(
  id: string,
  token: string,
  input: DeclarePaymentInput,
): Promise<ActionResult<PaymentDeclarationResult>> {
  const response = await publicFetch(`/bookings/${id}/payment-declarations?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    reportApiError(response);
    if (response.status === 409) {
      return fail("Cette référence de transaction vient d'être utilisée par une autre déclaration.");
    }
    return fail("Une erreur est survenue. Merci de réessayer.");
  }
  const data = (await response.json()) as PaymentDeclarationResult;
  return ok(data);
}
