import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

/** Guest-facing RSVP view. */
export type RsvpView = Schema<"RsvpView">;

/**
 * The recipient of a transferred place. Either contact channel is enough — they
 * need one way to receive their own invitation link, and the sender may only
 * know a phone number. Messages are `common.validation` keys.
 */
export const transferTicketSchema = z
  .object({
    firstName: z.string().trim().min(1, "required").max(100, "tooLong"),
    lastName: z.string().trim().min(1, "required").max(100, "tooLong"),
    email: z.union([z.string().email("email"), z.literal("")]).optional(),
    phoneNumber: z
      .union([z.string().regex(/^\+[1-9]\d{6,14}$/, "phone"), z.literal("")])
      .optional(),
  })
  .refine((value) => Boolean(value.email) || Boolean(value.phoneNumber), {
    message: "contactRequired",
    path: ["email"],
  });

export type TransferTicketInput = z.infer<typeof transferTicketSchema>;
