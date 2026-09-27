import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

// CONTRACT — open invitation (JIKU-184, ADR 106): an event shared in groups
// without a guest list, answered yes, maybe or no.

export type OpenInvitation = Schema<"OpenInvitationView">;
export type PublicOpenInvitation = Schema<"PublicOpenInvitationView">;
export type OpenResponse = Schema<"OpenResponseView">;
export type OrganizerOpenResponse = Schema<"OrganizerOpenResponseView">;
export type OpenAnswer = OpenResponse["answer"];
export type OpenClosedReason = NonNullable<PublicOpenInvitation["closedReason"]>;

export const OPEN_ANSWERS: OpenAnswer[] = ["YES", "MAYBE", "NO"];

/** What a person fills in; messages are `common.validation` keys. */
export const respondSchema = z.object({
  name: z.string().trim().min(1, "required").min(2, "tooShort").max(120, "tooLong"),
  phone: z
    .string()
    .transform((value) => value.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^\+[1-9][0-9]{7,14}$/, "phone")),
  answer: z.enum(["YES", "MAYBE", "NO"]),
  companions: z.number().int().min(0),
});

export type RespondInput = z.input<typeof respondSchema>;

/** The organizer's settings; `closesAt` is a local date-time from the input, or empty. */
export function settingsSchema(maxCompanions: number) {
  return z.object({
    enabled: z.boolean(),
    welcomeMessage: z.string().trim().max(500, "tooLong"),
    maxCompanions: z.number().int("wholeNumber").min(0, "outOfRange").max(maxCompanions, "outOfRange"),
    closesAt: z.string(),
    notifyOnCancel: z.boolean(),
  });
}

export type SettingsInput = z.infer<ReturnType<typeof settingsSchema>>;
