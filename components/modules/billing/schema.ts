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

export interface PaymentInitiation {
  paymentId: string;
  status: string;
  amountMinor: number;
  currency: string;
  instruction: PaymentInstruction;
}
