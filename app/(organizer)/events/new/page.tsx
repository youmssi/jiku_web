import { EventWizard, emptyEventValues } from "@/components/modules/event";

export default function NewEventPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl justify-center px-4 py-10">
      <EventWizard initialValues={emptyEventValues} />
    </div>
  );
}
