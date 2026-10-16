import { z } from "zod";

/** When a client pays for a service: free, before the appointment, or once served. */
export type ServicePaymentRule = "FREE" | "BEFORE" | "AFTER_SERVICE";

export const SERVICE_PAYMENT_RULES: readonly ServicePaymentRule[] = ["FREE", "BEFORE", "AFTER_SERVICE"];

export interface ServiceSummary {
  id: string;
  name: string;
  timezone: string;
  paymentRule: ServicePaymentRule;
  /** Null for a free service. */
  priceMinor: number | null;
  currency: string | null;
}

/** Canal de rappel d'un service (JIKU-89) : seul WhatsApp est livrable aujourd'hui. */
/**
 * WhatsApp, optionally with an SMS when WhatsApp cannot deliver (a paid
 * fallback for clients without WhatsApp or mobile data), or no reminders.
 * The API may still answer a legacy "SMS" for a service saved before SMS
 * became a fallback; the screen reads it as WhatsApp with the SMS fallback.
 */
export type ReminderChannel = "WHATSAPP" | "WHATSAPP_OR_SMS" | "NONE";

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
/** Appointment lengths offered as one-tap choices; anything else is set later in the service's settings. */
export const DURATION_CHOICES = [15, 30, 45, 60, 90] as const;

export const createServiceSchema = z.object({
  name: z.string().trim().min(1, "required").max(120, "tooLong"),
  timezone: z.string().min(1, "required"),
  durationMinutes: z.number().int().min(5).max(480),
});

/** One opening range of a week day (ISO day, 1 = Monday), in "HH:mm". */
export interface WeeklyRange {
  dayOfWeek: number;
  start: string;
  end: string;
}

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

/** Resource kinds in display order; labels are `services.resourceTypes` keys. */
export const RESOURCE_TYPES: readonly ResourceType[] = ["PERSON", "LOCATION", "EQUIPMENT"];
