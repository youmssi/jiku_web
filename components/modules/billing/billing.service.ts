"use server";

import { serverFetch } from "@/lib/api-server";
import type { PaymentInitiation } from "./schema";

export async function purchaseTierAction(
  eventId: string,
  tier: string,
): Promise<{ initiation?: PaymentInitiation; error?: string }> {
  const response = await serverFetch(`/events/${eventId}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier }),
  });
  if (response.status === 400) {
    return { error: "That tier isn't available. Please pick another." };
  }
  if (!response.ok) {
    return { error: "We couldn't start the payment. Please try again." };
  }
  const initiation = (await response.json()) as PaymentInitiation;
  return { initiation };
}
