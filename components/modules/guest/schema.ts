import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

/** CSV import outcome (backend GuestImportResult). */
export type ImportResult = Schema<"GuestImportResult">;
export type RowIssue = Schema<"RowIssue">;

/** A guest row and its per-channel invitation status (organizer views). */
export type Guest = Schema<"GuestResponse">;
export type Invitation = Schema<"InvitationStatusResponse">;

/** CSV columns the import endpoint expects; also the manual-entry field order. */
export const GUEST_CSV_HEADERS = ["firstName", "lastName", "email", "phone"] as const;

// Mirrors the backend row validation (GuestService) so a manual entry never
// round-trips to the server only to come back as a per-row failure.
const PHONE_PATTERN = /^\+?[0-9 ]{6,20}$/;

/** Single guest added through the manual-entry form (one-row import). */
export const singleGuestSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z
      .string()
      .trim()
      .refine((value) => value === "" || z.string().email().safeParse(value).success, {
        message: "Enter a valid email address",
      }),
    phone: z
      .string()
      .trim()
      .refine((value) => value === "" || PHONE_PATTERN.test(value), {
        message: "Enter a valid phone number",
      }),
  })
  .refine((values) => values.email !== "" || values.phone !== "", {
    message: "Add an email or a phone number so this guest can be reached",
    path: ["email"],
  });

export type SingleGuestInput = z.infer<typeof singleGuestSchema>;
