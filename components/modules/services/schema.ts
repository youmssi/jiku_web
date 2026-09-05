export interface ServiceSummary {
  id: string;
  name: string;
  timezone: string;
}

/** Canal de rappel d'un service (JIKU-89) : seul WhatsApp est livrable aujourd'hui. */
export type ReminderChannel = "WHATSAPP" | "NONE";

export type ConfirmationMode = "INSTANTANEOUS" | "ON_REQUEST";
export type PaymentMode = "FREE" | "BEFORE" | "AFTER";

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
  paymentMode: PaymentMode;
  reminderChannel: ReminderChannel;
  reminderOffsetsMinutes: number[];
  occupancyMinutes: number;
}

/** Mise à jour partielle (PUT /services/{id}/configuration) — les rappels (JIKU-89). */
export interface ReminderPolicyUpdate {
  reminderChannel: ReminderChannel;
  reminderOffsetsMinutes: number[];
}
