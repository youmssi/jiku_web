import { EventWizard } from "@/components/modules/organizer/components/event-wizard";
import { emptyEventValues } from "@/components/modules/organizer/event-schemas";

export default function NewEventPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl justify-center px-4 py-10">
      <EventWizard initialValues={emptyEventValues} />
    </div>
  );
}
