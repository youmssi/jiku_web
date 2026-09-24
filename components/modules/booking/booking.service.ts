"use server";

import { publicFetch } from "@/lib/api-server";
import { type ActionResult, fail, ok, reportApiError } from "@/lib/action-result";
import type {
  BookingPayeeDetails,
  BookingStatusView,
  DeclarePaymentInput,
  PaymentDeclarationResult,
} from "@/components/modules/booking/schema";

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
