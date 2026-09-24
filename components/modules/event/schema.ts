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

// Validation messages are `common.validation` keys, translated where they render.
export const eventFormSchema = z
  .object({
    name: z.string().trim().min(1, "required").max(255, "tooLong"),
    description: z.string().max(5000, "tooLong"),
    timezone: z.string().min(1, "required"),
    startLocal: z.string(),
    endLocal: z.string(),
    location: z.string().max(500, "tooLong"),
    transferAllowed: z.boolean(),
    transferDeadlineLocal: z.string(),
    overbookingAllowed: z.boolean(),
    maxOverbookingCount: z.number().int("wholeNumber").min(0, "positive").nullable(),
    invitationChannels: z.array(z.enum(INVITATION_CHANNELS)),
  })
  .refine((values) => !values.startLocal || !values.endLocal || values.endLocal > values.startLocal, {
    message: "endBeforeStart",
    path: ["endLocal"],
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
 * A ticket category as the organizer types it: the price in major units (what
 * people read, "150 000 GNF"), converted to the API's minor units on save. An
 * empty price means the category is free.
 */
export const ticketTypeFormSchema = z.object({
  label: z.string().trim().min(1, "required").max(120, "tooLong"),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "required"),
  maxCapacity: z.number().int("wholeNumber").min(1, "positive").nullable(),
  price: z.number().min(0, "positive").nullable(),
});

export type TicketTypeFormValues = z.infer<typeof ticketTypeFormSchema>;

export const QUORUM_FRACTIONS = [
  { key: "half", numerator: 1, denominator: 2 },
  { key: "twoThirds", numerator: 2, denominator: 3 },
  { key: "threeQuarters", numerator: 3, denominator: 4 },
] as const;

export type QuorumFractionKey = (typeof QUORUM_FRACTIONS)[number]["key"];

export const quorumFormSchema = z
  .object({
    mode: z.enum(["NONE", "FRACTION", "ABSOLUTE"]),
    fraction: z.enum(["half", "twoThirds", "threeQuarters"]),
    absolute: z.number().int("wholeNumber").min(1, "positive").nullable(),
  })
  .refine((values) => values.mode !== "ABSOLUTE" || values.absolute !== null, {
    message: "required",
    path: ["absolute"],
  });

export type QuorumFormValues = z.infer<typeof quorumFormSchema>;

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
