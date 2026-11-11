// Server-only surface of the open invitation module for the organizer: the
// event's open invitation tab. What a card's public page and its images need
// lives in `./public-server`, so a guest's page never pulls in the organizer's
// screens (JIKU-287).
import "server-only";

export { OpenInvitationView } from "./open-invitation-view";
