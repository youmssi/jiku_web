/**
 * Validator-facing types mirroring the backend check-in API (JIKU-22/23). Shared
 * across the validator module's services, hooks and components.
 */

export type CheckInOutcome =
  | "CHECKED_IN"
  | "ALREADY_CHECKED_IN"
  | "CANCELLED"
  | "NOT_FOUND";

export interface CheckInResponse {
  outcome: CheckInOutcome;
  guestName: string | null;
  ticketCode: string | null;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

export interface GuestMatch {
  guestId: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  rsvpStatus: string;
  ticketCode: string | null;
  ticketStatus: string | null;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

export interface AttendanceResponse {
  checkedIn: number;
  confirmed: number;
}

/** One guest in the pre-synced offline roster (mirrors the backend RosterEntry). */
export interface RosterEntry {
  guestId: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  rsvpStatus: string;
  ticketCode: string | null;
  ticketStatus: string | null;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

/** A check-in captured offline, awaiting sync. */
export interface QueuedCheckIn {
  id: string;
  ticketCode: string;
  scannedAt: string;
  guestName: string | null;
}

/** Per-item reconciliation result returned by the sync endpoint. */
export interface SyncResultEntry {
  ticketCode: string;
  outcome: CheckInOutcome;
  guestName: string | null;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

export interface ValidatorContext {
  eventName: string;
  startDateTime: string | null;
  timezone: string;
  eventLocation: string | null;
  organizerName: string;
  primaryColor: string;
  logoUrl: string | null;
  validatorLabel: string;
  checkedIn: number;
  confirmed: number;
}
