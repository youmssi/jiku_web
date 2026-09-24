import { EventSettingsForm } from "./event-settings-form";
import { loadEvent, toEventFormValues } from "./event.queries";
import { QuorumSettings } from "./quorum-settings";

/** The event's Settings tab: the event itself, then its quorum rule. */
export async function EventSettingsView({ eventId }: { eventId: string }) {
  const load = await loadEvent(eventId);
  if (load.kind !== "ok") return null;
  const { event } = load;
  return (
    <div className="flex flex-col gap-6">
      <EventSettingsForm
        eventId={event.id}
        initialValues={toEventFormValues(event)}
        editable={event.status === "DRAFT"}
      />
      {event.status === "CANCELLED" ? null : <QuorumSettings eventId={event.id} initial={event.quorum ?? null} />}
    </div>
  );
}
