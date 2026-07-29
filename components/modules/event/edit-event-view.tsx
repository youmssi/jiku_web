import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventWizard } from "@/components/modules/event/event-wizard";
import { EventSubNav } from "@/components/shared/event-sub-nav";
import { StateMessage } from "@/components/shared/state-message";
import type { EventFormValues, EventResponse } from "@/components/modules/event/schema";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import { utcToLocalInput } from "@/lib/datetime";

/** Edit-event screen: loads the event server-side and hydrates the wizard. */
export async function EditEventView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await serverFetch(`/events/${id}`);
  if (response.status === 404) {
    return (
      <StateMessage
        title="This event isn't available here"
        description="It doesn't exist in the currently selected organization. If you expect to see it, switch organizations from the account menu and try again."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.EVENTS}>Back to events</Link>
          </Button>
        }
      />
    );
  }
  if (!response.ok) {
    return (
      <StateMessage
        title="Couldn't load this event"
        description="Something went wrong on our end. Please try again."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.EVENTS}>Back to events</Link>
          </Button>
        }
      />
    );
  }
  const event = (await response.json()) as EventResponse;

  const values: EventFormValues = {
    name: event.name,
    description: event.description ?? "",
    timezone: event.timezone,
    startLocal: utcToLocalInput(event.startDateTime, event.timezone),
    endLocal: utcToLocalInput(event.endDateTime, event.timezone),
    location: event.location ?? "",
    placementEnabled: event.settings.placementEnabled,
    transferAllowed: event.settings.transferAllowed,
    transferDeadlineLocal: utcToLocalInput(event.settings.transferDeadline, event.timezone),
    overbookingAllowed: event.settings.overbookingAllowed,
    maxOverbookingCount: event.settings.maxOverbookingCount,
    invitationChannels: event.invitationChannels,
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <EventSubNav eventId={event.id} />
      <EventWizard eventId={event.id} initialValues={values} status={event.status} />
    </div>
  );
}
