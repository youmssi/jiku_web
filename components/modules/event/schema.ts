import { z } from "zod";

export const INVITATION_CHANNELS = ["EMAIL", "WHATSAPP"] as const;
export type InvitationChannel = (typeof INVITATION_CHANNELS)[number];

export const INVITATION_CHANNEL_LABELS: Record<InvitationChannel, string> = {
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
};

/** Curated timezone list focused on the target markets, plus a few common ones. */
export const TIMEZONES = [
  "Africa/Abidjan",
  "Africa/Accra",
  "Africa/Dakar",
  "Africa/Douala",
  "Africa/Lagos",
  "Africa/Casablanca",
  "Africa/Tunis",
  "Europe/Paris",
  "Europe/London",
  "UTC",
] as const;

export const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string(),
  timezone: z.string().min(1, "Select a timezone"),
  startLocal: z.string(),
  endLocal: z.string(),
  location: z.string(),
  placementEnabled: z.boolean(),
  transferAllowed: z.boolean(),
  transferDeadlineLocal: z.string(),
  overbookingAllowed: z.boolean(),
  maxOverbookingCount: z.number().int().min(0).nullable(),
  invitationChannels: z.array(z.enum(INVITATION_CHANNELS)),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const emptyEventValues: EventFormValues = {
  name: "",
  description: "",
  timezone: "Africa/Abidjan",
  startLocal: "",
  endLocal: "",
  location: "",
  placementEnabled: false,
  transferAllowed: false,
  transferDeadlineLocal: "",
  overbookingAllowed: false,
  maxOverbookingCount: null,
  invitationChannels: [],
};
