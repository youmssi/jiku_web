// Day-line module — the counter console: one ordered list mixing appointment
// and walk-in tickets for a service, with the SUIVANT rule and its transitions.
export { DayLineOrganizerView, DayLineStaffView } from "./dayline-views";
export { DayLineConsole } from "./day-line-console";
export { useDayLine } from "./useDayLine";
export { resolveCounterLinkAction } from "./dayline.service";
export type {
  DayLineAuth,
  DayLineView,
  LineActionResult,
  LineStatus,
  LineTicket,
  LineTransition,
  PendingAppointmentRequest,
  TicketKind,
  WalkInInput,
} from "./schema";
export { walkInSchema } from "./schema";
