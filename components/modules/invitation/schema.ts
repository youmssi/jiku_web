import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

/** Guest-facing RSVP view. */
export type RsvpView = Schema<"RsvpView">;

/**
 * Ticket-transfer state carried by the RSVP view (JIKU-64). The generated
 * `RsvpView` snapshot predates these fields; the intersection adds them until
 * the OpenAPI snapshot is regenerated (see openapi/README.md).
 */
export interface RsvpTransferCapability {
  /** True when this guest may hand their place on right now — the backend decides. */
  transferAllowed: boolean;
  transferDeadline: string | null;
  /** Set once the place has been handed over, naming who now holds it. */
  transferredTo: string | null;
}

/**
 * The recipient of a transferred place. Either contact channel is enough — they
 * need one way to receive their own invitation link, and the sender may only
 * know a phone number.
 */
export const transferTicketSchema = z
  .object({
    firstName: z.string().trim().min(1, "Enter their first name").max(100),
    lastName: z.string().trim().min(1, "Enter their last name").max(100),
    email: z.union([z.string().email("Enter a valid email"), z.literal("")]).optional(),
    phoneNumber: z
      .union([
        z.string().regex(/^\+[1-9]\d{6,14}$/, "Use the international format, e.g. +224620000000"),
        z.literal(""),
      ])
      .optional(),
  })
  .refine((value) => Boolean(value.email) || Boolean(value.phoneNumber), {
    message: "Give an email address or a phone number so they can receive their invitation",
    path: ["email"],
  });

export type TransferTicketInput = z.infer<typeof transferTicketSchema>;
