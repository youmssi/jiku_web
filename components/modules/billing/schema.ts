import type { Schema } from "@/lib/api-contract";

// CONTRACT — types mirroring the backend billing API (JIKU-32/33/35).

export interface UsageAllowance {
  invitedGuests: number;
  allowance: number;
  remaining: number;
  withinAllowance: boolean;
  tier: string;
  guestsImported: number;
  invitationsSentEmail: number;
  invitationsSentWhatsapp: number;
}

export interface PaymentHistoryItem {
  paymentId: string;
  /** Null for a prepaid subscription renewal (JIKU-90). */
  eventId: string | null;
  eventName: string;
  tier: string;
  amountMinor: number;
  currency: string;
  status: string;
  createdAt: string;
}

/** Event tiers priced in the organization's billing currency (ADR 105). */
export type TierOption = Schema<"TierOption">;
export type TierCatalog = Schema<"TierCatalog">;
/** A tier this event can still buy, priced by the server for it (tier difference + interactive surcharge). */
export type EventTierQuote = Schema<"EventTierQuote">;

export interface PaymentInstruction {
  type: string;
  value: string;
}

export interface PayeeDetails {
  payeeName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  mobileMoneyNumber: string | null;
  mobileMoneyOperator: string | null;
  bankDetails: string | null;
}

// Manual (concierge) activation request (JIKU-41/45): the client prepays the
// displayed payee quoting the reference; the team confirms and unlocks.
export interface ManualPaymentInstructions {
  paymentId: string;
  reference: string;
  tier: string;
  amountMinor: number;
  currency: string;
  status: string;
  payee: PayeeDetails;
}


// ─── Invoices (JIKU-69) ─────────────────────────────────────────────────────
// Accounting-grade documents, distinct from the plain-text payment receipt: a
// company's accounts department cannot process the latter. Aliased from the
// generated contract so a backend change is a type error, not a runtime surprise.

export type InvoiceSummary = Schema<"InvoiceSummary">;

// ─── Services subscription, priced per team (JIKU-90, ADR 105) ───────────────

export type SubscriptionStatus = "ACTIVE" | "GRACE" | "EXPIRED";
/** The Organizer Pack and its current month (ADR 105). */
export type PackView = Schema<"PackView">;
export type SubscriptionView = Schema<"SubscriptionView">;
export type SubscriptionPlanOption = Schema<"PlanOption">;
export type SubscriptionMonthOption = Schema<"MonthOption">;

export interface SubscriptionRequestInput {
  plan: string;
  months: number;
}
