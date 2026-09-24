import { loadEvent, loadOrganizationCurrency, loadTicketTypes } from "./event.queries";
import { TicketTypesSettings } from "./ticket-types-settings";

/** The event's Tickets tab: its categories, their prices and how full each one is. */
export async function TicketTypesView({ eventId }: { eventId: string }) {
  const [load, ticketTypes, currency] = await Promise.all([
    loadEvent(eventId),
    loadTicketTypes(eventId),
    loadOrganizationCurrency(),
  ]);
  if (load.kind !== "ok") return null;
  return (
    <TicketTypesSettings
      eventId={eventId}
      ticketTypes={ticketTypes}
      currency={currency}
      editable={load.event.status !== "CANCELLED"}
    />
  );
}
