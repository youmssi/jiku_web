import { AdvancedOnly, AdvancedSettings } from "@/components/shared";
import { EventSettingsForm } from "./event-settings-form";
import { loadEvent, toEventFormValues } from "./event.queries";
import { QuorumSettings } from "./quorum-settings";

/** The event's Settings tab: the event itself, then its rarer options (branding, ticket rules, quorum) folded away. */
export async function EventSettingsView({ eventId }: { eventId: string }) {
  const load = await loadEvent(eventId);
  if (load.kind !== "ok") return null;
  const { event } = load;
  return (
    <AdvancedSettings
      initialOpen={Boolean(
        // A live event is read-only and shows everything; a draft folds what it does not use.
        event.status !== "DRAFT" ||
          event.settings.brandName ||
          event.settings.transferAllowed ||
          event.settings.overbookingAllowed ||
          event.quorum,
      )}
    >
      <div className="flex flex-col gap-6">
        <EventSettingsForm
          eventId={event.id}
          initialValues={toEventFormValues(event)}
          editable={event.status === "DRAFT"}
        />
        {event.status === "CANCELLED" ? null : (
          <AdvancedOnly>
            <QuorumSettings eventId={event.id} initial={event.quorum ?? null} />
          </AdvancedOnly>
        )}
      </div>
    </AdvancedSettings>
  );
}
