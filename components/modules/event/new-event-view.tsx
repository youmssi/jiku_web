import { EventWizard } from "@/components/modules/event/event-wizard";
import { emptyEventValues } from "@/components/modules/event/schema";

/** Create-event screen: the wizard seeded with empty values. */
export function NewEventView() {
  return (
    <div className="mx-auto flex w-full max-w-2xl justify-center px-4 py-10">
      <EventWizard initialValues={emptyEventValues} />
    </div>
  );
}
