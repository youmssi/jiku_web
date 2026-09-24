import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

/** CSV import outcome (backend GuestImportResult). */
export type ImportResult = Schema<"GuestImportResult">;
export type RowIssue = Schema<"RowIssue">;

/** A guest row with its answer and its live ticket (organizer views). */
export type Guest = Schema<"GuestResponse">;
export type Invitation = Schema<"InvitationStatusResponse">;

export type RsvpStatus = NonNullable<Guest["rsvpStatus"]>;
export type TicketPaymentStatus = NonNullable<Guest["paymentStatus"]>;

/** How a guest paid the organizer; Jikū never handles the money (JIKU-110). */
export const PAYMENT_METHODS = ["MOBILE_MONEY", "PAYMENT_LINK", "CASH"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Validation messages are `common.validation` keys, translated where they render.
export const singleGuestSchema = z
  .object({
    firstName: z.string().trim().min(1, "required").max(120, "tooLong"),
    lastName: z.string().trim().min(1, "required").max(120, "tooLong"),
    email: z.string().trim().email("email").or(z.literal("")),
    phone: z.string().trim().max(30, "tooLong"),
  })
  .refine((guest) => guest.email !== "" || guest.phone !== "", {
    message: "contactRequired",
    path: ["email"],
  });

export type SingleGuestInput = z.infer<typeof singleGuestSchema>;
