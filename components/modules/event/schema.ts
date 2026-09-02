import { z } from "zod";
import type { Schema } from "@/lib/api-contract";
import {
  INVITATION_CHANNELS,
  INVITATION_CHANNEL_LABELS,
  type InvitationChannel,
} from "@/lib/channels";

/** Full event (backend EventResponse); the list endpoint returns the same shape. */
export type EventResponse = Schema<"EventResponse">;
export type EventListItem = EventResponse;

// Channels are a cross-module concern (see lib/channels); re-exported here so event
// consumers keep importing them from the event contract.
export { INVITATION_CHANNELS, INVITATION_CHANNEL_LABELS, type InvitationChannel };

/**
 * Curated timezone list, the launch market first: Conakry heads the list and is
 * the default, followed by the neighbouring markets organizers most often run
 * events in, then the diaspora zones they organize from.
 */
export const TIMEZONES = [
  "Africa/Conakry",
  "Africa/Abidjan",
  "Africa/Dakar",
  "Africa/Accra",
  "Africa/Bamako",
  "Africa/Douala",
  "Africa/Ndjamena",
  "Africa/Lagos",
  "Africa/Casablanca",
  "Africa/Tunis",
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
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
  timezone: "Africa/Conakry",
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

/** Règle de quorum d'un événement (JIKU-94), absente si non configurée. */
export type QuorumResponse = Schema<"QuorumResponse">;
export type UpdateQuorumRequest = Schema<"UpdateQuorumRequest">;
