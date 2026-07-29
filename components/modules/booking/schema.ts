import { z } from "zod";

export const EVENT_TYPES = ["MARIAGE", "BAPTEME", "SALLE", "SEMINAIRE", "AUTRE"] as const;

export const EVENT_TYPE_LABELS: Record<(typeof EVENT_TYPES)[number], string> = {
  MARIAGE: "Mariage",
  BAPTEME: "Baptême",
  SALLE: "Location de salle",
  SEMINAIRE: "Séminaire",
  AUTRE: "Autre",
};

export const reservationSchema = z.object({
  customerName: z.string().trim().min(1, "Indiquez votre nom"),
  customerPhone: z.string().trim().min(6, "Indiquez un numéro valide"),
  customerEmail: z.string().trim().email("Indiquez un email valide"),
  eventType: z.enum(EVENT_TYPES),
  eventDate: z.string().min(1, "Choisissez une date"),
  guestCountEstimate: z.coerce.number().int().positive("Indiquez le nombre d'invités"),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

/** Live tier/deposit preview (GET /bookings/quote) — no row written. */
export interface BookingQuote {
  tier: string;
  currency: string;
  totalAmountMinor: number;
  depositAmountMinor: number;
  balanceAmountMinor: number;
}

/** Response of POST /bookings. */
export interface BookingCreationResult extends BookingQuote {
  id: string;
  accessToken: string;
  balanceDueDate: string;
  status: string;
}

/** Response of GET /bookings/{id}?token= — the public status page. */
export interface BookingStatusView {
  id: string;
  customerName: string;
  eventType: string;
  eventDate: string;
  guestCountEstimate: number;
  tier: string;
  currency: string;
  totalAmountMinor: number;
  depositAmountMinor: number;
  balanceAmountMinor: number;
  balanceDueDate: string;
  status: string;
  createdAt: string;
}

export interface BookingPayeeDetails {
  payeeName: string | null;
  orangeMoneyNumber: string | null;
  mtnMomoNumber: string | null;
}

export const declarePaymentSchema = z.object({
  amountMinor: z.coerce.number().int().positive("Indiquez le montant envoyé"),
  kind: z.enum(["DEPOSIT", "BALANCE"]),
  operator: z.enum(["ORANGE_MONEY", "MTN_MOMO"]),
  transactionReference: z.string().trim().min(1, "Indiquez l'identifiant de transaction"),
});

export type DeclarePaymentInput = z.infer<typeof declarePaymentSchema>;

export interface PaymentDeclarationResult {
  id: string;
  bookingId: string;
  verificationStatus: string;
  declaredAt: string;
}
