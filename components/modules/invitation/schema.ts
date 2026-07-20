import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

/** Guest-facing RSVP view. */
export type RsvpView = Schema<"RsvpView">;

/**
 * Ticket-transfer availability for the current RSVP. Not yet part of the
 * generated `RsvpView` schema — the backend needs to add `transferAllowed`
 * and `transferDeadline` to `GET /rsvp/{token}` (it already tracks both on
 * the event's settings, just doesn't surface them on this guest-facing view
 * yet). Until then every RSVP is treated as non-transferable, so the button
 * simply won't appear rather than erroring.
 */
export interface RsvpTransferCapability {
  transferAllowed: boolean;
  transferDeadline: string | null;
}

export const transferTicketSchema = z.object({
  recipientName: z.string().min(1, "Enter their name"),
  recipientEmail: z.string().email("Enter a valid email"),
});

export type TransferTicketInput = z.infer<typeof transferTicketSchema>;
