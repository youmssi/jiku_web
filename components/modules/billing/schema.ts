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
  eventId: string;
  eventName: string;
  tier: string;
  amountMinor: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface TierOption {
  name: string;
  maxGuests: number;
  priceMinor: number;
}

export interface TierCatalog {
  currency: string;
  freeTierGuests: number;
  tiers: TierOption[];
}

export interface PaymentInstruction {
  type: string;
  value: string;
}

export interface PayeeDetails {
  payeeName: string | null;
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

export interface PaymentInitiation {
  paymentId: string;
  status: string;
  amountMinor: number;
  currency: string;
  instruction: PaymentInstruction;
}

// ─── Invoices (JIKU-69) ─────────────────────────────────────────────────────
// Accounting-grade documents, distinct from the plain-text payment receipt: a
// company's accounts department cannot process the latter.

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  /** INVOICE or CREDIT_NOTE. */
  documentType: string;
  currency: string;
  totalMinor: number;
  issueDate: string;
  issuedAt: string;
}
