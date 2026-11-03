import { z } from "zod";
import type { Schema } from "@/lib/api-contract";
import { compactPhone, NAME_MAX, NAME_MIN, OPEN_ANSWERS, PHONE_PATTERN } from "./answers";

// CONTRACT — open invitation (JIKU-184, ADR 106): an event shared in groups
// without a guest list, answered yes, maybe or no.

export type OpenInvitation = Schema<"OpenInvitationView">;
export type PublicOpenInvitation = Schema<"PublicOpenInvitationView">;
export type OpenResponse = Schema<"OpenResponseView">;
export type OrganizerOpenResponse = Schema<"OrganizerOpenResponseView">;
/** The event's look on every guest surface (JIKU-194): a style and an optional banner photo. */
export type EventLook = Schema<"EventLookView">;
/** One network's shares, visits and answers (JIKU-282). */
export type CardFunnelRow = Schema<"CardFunnelRow">;
export type OpenAnswer = OpenResponse["answer"];
export type OpenClosedReason = NonNullable<PublicOpenInvitation["closedReason"]>;

export { OPEN_ANSWERS } from "./answers";

/** What a person fills in; messages are `common.validation` keys. The browser checks the same rules (./answers). */
export const respondSchema = z.object({
  name: z.string().trim().min(1, "required").min(NAME_MIN, "tooShort").max(NAME_MAX, "tooLong"),
  phone: z
    .string()
    .transform(compactPhone)
    .pipe(z.string().regex(PHONE_PATTERN, "phone")),
  answer: z.enum(OPEN_ANSWERS),
  companions: z.number().int().min(0),
  /** The network the card was opened from (JIKU-282). */
  source: z.string().max(16).optional(),
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
    showComing: z.boolean(),
    relay: z.boolean(),
  });
}

export type SettingsInput = z.infer<ReturnType<typeof settingsSchema>>;
