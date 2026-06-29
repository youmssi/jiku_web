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
