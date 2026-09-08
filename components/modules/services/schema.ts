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

/** Fuseaux proposés à la création d'un service ou d'une ressource. */
export const SERVICE_TIMEZONES = [
  "Africa/Conakry",
  "Africa/Abidjan",
  "Africa/Dakar",
  "Africa/Accra",
  "Africa/Douala",
  "Africa/Casablanca",
  "Europe/Paris",
  "UTC",
] as const;

export const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "PERSON", label: "Personne" },
  { value: "LOCATION", label: "Lieu" },
  { value: "EQUIPMENT", label: "Équipement" },
];

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  PERSON: "Personne",
  LOCATION: "Lieu",
  EQUIPMENT: "Équipement",
};
