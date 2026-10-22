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
  /** Guests the event bought (JIKU-268); buying more charges only those above it. */
  paidGuests: number;
  /** Free guests a first purchase leaves out of the price (JIKU-270); 0 once the event bought guests. */
  freeGuests: number;
}

export interface PaymentHistoryItem {
  paymentId: string;
  /** Null for a prepaid subscription renewal (JIKU-90). */
  eventId: string | null;
  eventName: string;
  tier: string;
  /** GUESTS, SUBSCRIPTION, PACK, PACK_EXTRA or COMMISSION. */
  kind: string;
  /** Guests the payment bought or settled; null when it bought none. */
  guests: number | null;
  amountMinor: number;
  currency: string;
  status: string;
  createdAt: string;
}

/** The per-guest price of an event in the organization's billing currency (ADR 109). */
export type EventPricing = Schema<"EventPricingView">;

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
  /** Paid guests the event is raised to; null for any other purchase. */
  guests: number | null;
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
/** Everything the organization pays for, in one read (JIKU-254). */
export type BillingStatus = Schema<"BillingStatusView">;

/** The services subscription, its plans and prepaid periods. */
export type SubscriptionView = Schema<"SubscriptionView">;
export type SubscriptionPlanOption = Schema<"PlanOption">;
export type SubscriptionMonthOption = Schema<"MonthOption">;

export interface SubscriptionRequestInput {
  plan: string;
  months: number;
}

// ─── Online checkout (JIKU-165) ──────────────────────────────────────────────

/** A started online payment: the provider page to send the payer to. */
export type PaymentInitiationResult = Schema<"PaymentInitiationResult">;
/** Where a payment stands, read by the page the payer returns to. */
export type PaymentStatusView = Schema<"PaymentStatusView">;

/** Everything that can be paid online, and what the backend needs to price it. */
export type CheckoutTarget =
  | { kind: "guests"; eventId: string; guests: number }
  | { kind: "subscription"; plan: string; months: number }
  | { kind: "pack"; months: number }
  | { kind: "packExtra"; blocks: number };
