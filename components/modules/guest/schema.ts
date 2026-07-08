import { z } from "zod";
import type { Schema } from "@/lib/api-contract";
import { INVITATION_CHANNELS } from "@/lib/channels";

/** CSV import outcome (backend GuestImportResult). */
export type ImportResult = Schema<"GuestImportResult">;
export type RowIssue = Schema<"RowIssue">;

/** A guest row and its per-channel invitation status (organizer views). */
export type Guest = Schema<"GuestResponse">;
export type Invitation = Schema<"InvitationStatusResponse">;

/** Manual single-guest form values. */
export const singleGuestSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email address.").or(z.literal("")),
  phone: z.string().default(""),
});

export type SingleGuestInput = z.input<typeof singleGuestSchema>;
