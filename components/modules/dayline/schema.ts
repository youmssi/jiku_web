import { z } from "zod";

/**
 * Contract of the day-line console (JIKU-88). These types mirror the backend's
 * JSON shape exactly: a line mixes appointment tickets (rendez-vous, with a slot)
 * and walk-in tickets (sans-rendez-vous, born at the counter), both for one
 * service on one day in the service's timezone.
 */

export type TicketKind = "APPOINTMENT" | "WALK_IN";

export type LineStatus = "ISSUED" | "WAITING" | "CALLED" | "IN_SERVICE" | "DONE" | "NO_SHOW";

export interface LineTicket {
  id: string;
  ticketCode: string;
  kind: TicketKind;
  status: LineStatus;
  clientName: string | null;
  clientPhone: string | null;
  /** Créneau, pour un rendez-vous ; nul pour un sans-rendez-vous. */
  startsAt: string | null;
  endsAt: string | null;
  /** Heure d'arrivée au comptoir, renseignée dès l'entrée en attente. */
  arrivedAt: string | null;
  dayRank: number | null;
}

export interface DayLineView {
  serviceId: string;
  serviceName: string;
  timezone: string;
  /** Jour de la ligne, dans le fuseau du service. */
  date: string;
  entries: LineTicket[];
}

/** Une entrée ne se modifie que dans un sens précis ; le bouton découle de l'état. */
export type LineTransition = "arrive" | "call" | "present" | "finish" | "no-show";

/** Réponse d'une action réussie : la transition appliquée et la ligne à jour. */
export interface LineActionResult {
  outcome: "OK";
  ticket: LineTicket;
}

/** Qui ouvre la console : l'organisateur connecté, ou le personnel par son lien. */
export type DayLineAuth =
  | { kind: "organizer"; serviceId: string }
  | { kind: "staff"; token: string };

export const walkInSchema = z.object({
  clientName: z.string().trim().min(2, "Indiquez le nom du client"),
  clientPhone: z.string().trim().min(6, "Indiquez un numéro valide"),
});

export type WalkInInput = z.infer<typeof walkInSchema>;
