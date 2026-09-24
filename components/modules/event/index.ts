// Event module — client-safe public surface: the creation dialog, the status
// badge and the contract types. Server-rendered views (the workspace, its tabs
// and the events list) are exported from `server.ts`.
export { NewEventDialog } from "./new-event-dialog";
export { EventStatusBadge } from "./event-status-badge";
export {
  emptyEventValues,
  eventFormSchema,
  INVITATION_CHANNELS,
  INVITATION_CHANNEL_LABELS,
  TIMEZONES,
} from "./schema";
export type { EventFormValues, EventListItem, InvitationChannel, TicketTypeResponse } from "./schema";
