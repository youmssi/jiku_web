"use server";

import { serverFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";
import type {
  InvoiceSummary,
  ManualPaymentInstructions,
  PaymentInitiation,
  SubscriptionRequestInput,
  SubscriptionView,
} from "./schema";

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

export async function requestActivationAction(
  eventId: string,
  tier: string,
): Promise<{ instructions?: ManualPaymentInstructions; error?: string }> {
  const response = await serverFetch(`/events/${eventId}/payments/manual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier }),
  });
  if (response.status === 400) {
    return { error: "That tier isn't available. Please pick another." };
  }
  if (!response.ok) {
    return { error: "We couldn't record your request. Please try again." };
  }
  const instructions = (await response.json()) as ManualPaymentInstructions;
  return { instructions };
}

// ─── Subscription (JIKU-90) ──────────────────────────────────────────────────

/**
 * The tenant's subscription, or null when the tenant has none yet (e.g. no
 * active resource has ever opened one). A 404 simply means "nothing to show".
 */
export async function fetchSubscriptionAction(): Promise<SubscriptionView | null> {
  const response = await serverFetch("/billing/subscription");
  if (!response.ok) return null;
  return (await response.json()) as SubscriptionView;
}

export async function requestSubscriptionAction(
  input: SubscriptionRequestInput,
): Promise<{ ok: true; instructions: ManualPaymentInstructions } | { ok: false; error: string }> {
  const response = await serverFetch("/billing/subscription/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (response.status === 400) {
    return { ok: false, error: "That subscription isn't available. Please pick another." };
  }
  if (!response.ok) {
    reportApiError(response);
    return { ok: false, error: "We couldn't record your request. Please try again." };
  }
  return { ok: true, instructions: (await response.json()) as ManualPaymentInstructions };
}

// ─── Invoices (JIKU-69) ─────────────────────────────────────────────────────

export async function fetchInvoicesAction(): Promise<InvoiceSummary[]> {
  const response = await serverFetch("/billing/invoices");
  if (!response.ok) return [];
  return (await response.json()) as InvoiceSummary[];
}

/**
 * Issues the invoice for a settled payment. The backend refuses until the
 * organization's legal details are complete, so that refusal is surfaced as its
 * own message pointing at Settings rather than a generic failure.
 */
export async function issueInvoiceAction(
  paymentId: string,
): Promise<{ ok: true; invoice: InvoiceSummary } | { ok: false; error: string }> {
  const response = await serverFetch(`/billing/invoices/payments/${paymentId}`, { method: "POST" });
  if (response.status === 409) {
    return {
      ok: false,
      error: "Add your organization's legal details in Settings before issuing an invoice.",
    };
  }
  if (!response.ok) {
    reportApiError(response);
    return { ok: false, error: "We couldn't issue the invoice. Please try again." };
  }
  return { ok: true, invoice: (await response.json()) as InvoiceSummary };
}
