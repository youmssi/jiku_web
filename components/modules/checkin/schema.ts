import type { Schema } from "@/lib/api-contract";

/**
 * Validator check-in contract. Response DTOs alias the generated OpenAPI schemas;
 * `outcome` is refined to the closed set the backend actually returns (springdoc
 * types the raw enum as `string`). `QueuedCheckIn` is client-only — the offline
 * queue — and has no backend counterpart.
 */
export type CheckInOutcome =
  | "CHECKED_IN"
  | "ALREADY_CHECKED_IN"
  | "CANCELLED"
  | "EVENT_CANCELLED"
  | "NOT_FOUND";

export type CheckInResponse = Omit<Schema<"CheckInResponse">, "outcome"> & {
  outcome: CheckInOutcome;
};

export type GuestMatch = Schema<"GuestMatch">;

/** Same backend row shape as GuestMatch; kept distinct per its own endpoint. */
export type RosterEntry = Schema<"RosterEntry">;

export type AttendanceResponse = Schema<"AttendanceResponse">;

/** ValidatorContextResponse plus server-sent fields not yet in the OpenAPI spec. */
export type ValidatorContext = Schema<"ValidatorContextResponse"> & {
  eventStatus?: string | null;
};

export type SyncResultEntry = Omit<Schema<"SyncResultEntry">, "outcome"> & {
  outcome: CheckInOutcome;
};

/** A check-in captured offline, awaiting sync (client-only). */
export interface QueuedCheckIn {
  id: string;
  ticketCode: string;
  scannedAt: string;
  guestName: string | null;
}
