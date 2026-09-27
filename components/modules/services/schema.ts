import { z } from "zod";

export interface ServiceSummary {
  id: string;
  name: string;
  timezone: string;
}

/** Canal de rappel d'un service (JIKU-89) : seul WhatsApp est livrable aujourd'hui. */
export type ReminderChannel = "WHATSAPP" | "NONE";

export type ConfirmationMode = "INSTANTANEOUS" | "ON_REQUEST";

/**
 * Options effectives d'un service (GET /services/{id}/configuration) : la valeur
 * renseignée par l'organisateur ou le défaut de configuration.
 */
export interface ServiceConfiguration {
  confirmationMode: ConfirmationMode;
  stepMinutes: number;
  durationMinutes: number;
  bufferMinutes: number;
  minHorizonMinutes: number;
  maxHorizonDays: number;
  holdMinutes: number;
  cancelDeadlineHours: number;
  noShowToleranceMinutes: number;
  walkInsAllowed: boolean;
  reminderChannel: ReminderChannel;
  reminderOffsetsMinutes: number[];
  occupancyMinutes: number;
  /** Clients served together per slot, within the plan's cap. */
  clientsPerSlot: number;
  /** The most clients per slot the plan allows. */
  maxClientsPerSlot: number;
}

/** Mise à jour partielle (PUT /services/{id}/configuration) — les rappels (JIKU-89). */
export interface ReminderPolicyUpdate {
  reminderChannel: ReminderChannel;
  reminderOffsetsMinutes: number[];
}

export type ResourceType = "PERSON" | "LOCATION" | "EQUIPMENT";

export interface ServiceResource {
  id: string;
  name: string;
  type: ResourceType;
  timezone: string;
  active: boolean;
}

export interface ServiceRequirement {
  id: string;
  serviceId: string;
  type: ResourceType;
  quantity: number;
}

export interface StaffLink {
  id: string;
  serviceId: string;
  label: string;
  revoked: boolean;
  /** Short shareable code (`/line/{code}`); null for links created before it existed. */
  code: string | null;
  createdAt: string;
  revokedAt: string | null;
}

/** Réponse de création d'un lien comptoir : le jeton n'est montré qu'ici. */
export interface StaffLinkCreated extends StaffLink {
  token: string;
}

export interface ResourceAvailability {
  id: string;
  resourceId: string;
  dayOfWeek: number;
  start: string;
  end: string;
}

export interface ResourceUnavailability {
  id: string;
  resourceId: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
}

/** Services and resources are scheduled against the same curated list as events. */
export { TIMEZONES as SERVICE_TIMEZONES } from "@/lib/timezones";

// Validation messages are `common.validation` keys, translated where they render.
export const createServiceSchema = z.object({
  name: z.string().trim().min(1, "required").max(120, "tooLong"),
  timezone: z.string().min(1, "required"),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

/** Resource kinds in display order; labels are `services.resourceTypes` keys. */
export const RESOURCE_TYPES: readonly ResourceType[] = ["PERSON", "LOCATION", "EQUIPMENT"];
