import type { Schema } from "@/lib/api-contract";

/** CSV import outcome (backend GuestImportResult). */
export type ImportResult = Schema<"GuestImportResult">;
export type RowIssue = Schema<"RowIssue">;

/** A guest row and its per-channel invitation status (organizer views). */
export type Guest = Schema<"GuestResponse">;
export type Invitation = Schema<"InvitationStatusResponse">;
