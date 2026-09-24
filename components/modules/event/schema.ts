import { z } from "zod";
import type { Schema } from "@/lib/api-contract";
import {
  INVITATION_CHANNELS,
  INVITATION_CHANNEL_LABELS,
  type InvitationChannel,
} from "@/lib/channels";
import { DEFAULT_TIMEZONE, TIMEZONES } from "@/lib/timezones";

/** Full event (backend EventResponse); the list endpoint returns the same shape. */
export type EventResponse = Schema<"EventResponse">;
export type EventListItem = EventResponse;

// Channels are a cross-module concern (see lib/channels); re-exported here so event
// consumers keep importing them from the event contract.
export { INVITATION_CHANNELS, INVITATION_CHANNEL_LABELS, type InvitationChannel };

export { TIMEZONES };

export const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string(),
  timezone: z.string().min(1, "Select a timezone"),
  startLocal: z.string(),
  endLocal: z.string(),
  location: z.string(),
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
  timezone: DEFAULT_TIMEZONE,
  startLocal: "",
  endLocal: "",
  location: "",
  transferAllowed: false,
  transferDeadlineLocal: "",
  overbookingAllowed: false,
  maxOverbookingCount: null,
  invitationChannels: [],
};

/**
 * The creation dialog's own, smaller schema: just what's needed to start a
 * draft. Everything else in EventFormValues (description, end date, location,
 * transfer/overbooking, invitation channels) has a real default and is filled
 * in afterward on the event's own Settings tab — the page the dialog redirects
 * to the moment the draft exists.
 */
export const quickCreateEventSchema = z.object({
  name: z.string().trim().min(1, "required").max(255, "tooLong"),
  timezone: z.string().min(1, "required"),
  startLocal: z.string(),
});

export type QuickCreateEventValues = z.infer<typeof quickCreateEventSchema>;

/** Règle de quorum d'un événement (JIKU-94), absente si non configurée. */
export type QuorumResponse = Schema<"QuorumResponse">;
export type UpdateQuorumRequest = Schema<"UpdateQuorumRequest">;

/** Catégorie d'accès d'un événement (JIKU-93). */
export type TicketTypeResponse = Schema<"TicketTypeResponse">;
export type UpsertTicketTypeRequest = Schema<"UpsertTicketTypeRequest">;

/**
 * Palette proposée pour les catégories. Choisie pour rester distinguable à
 * distance et sous l'éclairage d'une salle : le portier reconnaît la couleur du
 * bandeau avant de lire le libellé.
 */
export const TICKET_TYPE_COLORS = [
  "#B45309",
  "#1D4ED8",
  "#047857",
  "#BE123C",
  "#6D28D9",
  "#0F766E",
  "#A16207",
  "#334155",
] as const;
