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
  /** The booked time for an appointment; null for a walk-in. */
  startsAt: string | null;
  endsAt: string | null;
  /** When the client arrived at the counter, set once they are waiting. */
  arrivedAt: string | null;
  dayRank: number | null;
  /** What the client owes the organization (JIKU-110); service cannot start while DUE. */
  paymentStatus: TicketPaymentStatus;
  amountDueMinor: number | null;
  amountDueCurrency: string | null;
  /** The counter the client was called to, once called. */
  counter: string | null;
}

export type TicketPaymentStatus = "NOT_REQUIRED" | "DUE" | "DUE_AFTER_SERVICE" | "PAID";

/** How the client paid the organization; Jikū never handles the money. */
export type CollectedPaymentMethod = "MOBILE_MONEY" | "PAYMENT_LINK" | "CASH";

export interface DayLineView {
  serviceId: string;
  serviceName: string;
  timezone: string;
  /** The line's day, in the service's timezone. */
  date: string;
  entries: LineTicket[];
}

/** An entry only moves one way; its button follows from its state. */
export type LineTransition = "arrive" | "call" | "present" | "finish" | "no-show";

/** A successful action: the transition applied and the updated entry. */
export interface LineActionResult {
  outcome: "OK";
  ticket: LineTicket;
}

/** Who opens the console: the signed-in organizer, or staff through their link. */
export type DayLineAuth =
  | { kind: "organizer"; serviceId: string }
  /**
   * A counter link (`line/{token}`) or an operator's link on this service
   * (`operator/{token}/services/{serviceId}`, JIKU-116): the path is the credential.
   */
  | { kind: "staff"; base: string };

/** A walk-in added at the counter; messages are `common.validation` keys. */
export const walkInSchema = z.object({
  clientName: z.string().trim().min(1, "required").min(2, "tooShort").max(120, "tooLong"),
  clientPhone: z.string().trim().min(1, "required").min(6, "phone").max(32, "tooLong"),
});

export type WalkInInput = z.infer<typeof walkInSchema>;

/**
 * An appointment request waiting for a decision (on-request mode, JIKU-88): the
 * client booked a time, but no ticket is issued until a counter or the organizer
 * confirms or declines it.
 */
export interface PendingAppointmentRequest {
  id: string;
  startsAt: string;
  endsAt: string;
  clientName: string | null;
  clientPhone: string | null;
  requestedAt: string;
  heldUntil: string | null;
}
