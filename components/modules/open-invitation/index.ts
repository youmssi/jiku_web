// Open invitation module (JIKU-184, ADR 106): an event shared in groups without
// a guest list. The card's public page and its answer form; the organizer's tab
// and the server reads are exported from `./server`.
export { OpenInvitationPage } from "./open-invitation-page";
export type { OpenInvitation, PublicOpenInvitation, OrganizerOpenResponse } from "./schema";
