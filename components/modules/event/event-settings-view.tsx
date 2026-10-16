import { AdvancedOnly, AdvancedSettings, AdvancedToggle } from "@/components/shared";
import { getTranslations } from "next-intl/server";
import { EventSettingsForm } from "./event-settings-form";
import { EventSummary } from "./event-summary";
import { loadEvent, toEventFormValues } from "./event.queries";
import { QuorumSettings } from "./quorum-settings";

/**
 * The event's Settings tab. A draft gets the form, its rarer options (branding,
 * ticket rules, quorum) folded away; a published or cancelled event gets a
 * short summary of what its guests received, and only the quorum, which still
 * changes, stays a form (JIKU-255).
 */
export async function EventSettingsView({ eventId }: { eventId: string }) {
  const load = await loadEvent(eventId);
  if (load.kind !== "ok") return null;
  const { event } = load;

  if (event.status !== "DRAFT") {
    const t = await getTranslations("events.settings");
    return (
      <AdvancedSettings initialOpen={Boolean(event.quorum)}>
        <div className="flex flex-col gap-6">
          <EventSummary event={event} />
          {event.status === "CANCELLED" ? null : (
            <>
              {event.quorum ? null : <AdvancedToggle label={t("advanced")} />}
              <AdvancedOnly first>
                <QuorumSettings eventId={event.id} initial={event.quorum ?? null} />
              </AdvancedOnly>
            </>
          )}
        </div>
      </AdvancedSettings>
    );
  }

  return (
    <AdvancedSettings
      initialOpen={Boolean(
        event.settings.brandName || event.settings.transferAllowed || event.settings.overbookingAllowed || event.quorum,
      )}
    >
      <div className="flex flex-col gap-6">
        <EventSettingsForm eventId={event.id} initialValues={toEventFormValues(event)} />
        <AdvancedOnly>
          <QuorumSettings eventId={event.id} initial={event.quorum ?? null} />
        </AdvancedOnly>
      </div>
    </AdvancedSettings>
  );
}
