import { notFound } from "next/navigation";
import { EventWizard } from "@/components/modules/organizer/components/event-wizard";
import type {
  EventFormValues,
  InvitationChannel,
} from "@/components/modules/organizer/event-schemas";
import { serverFetch } from "@/lib/api-server";
import { utcToLocalInput } from "@/lib/datetime";

interface EventResponse {
  id: string;
  name: string;
  description: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
  timezone: string;
  location: string | null;
  status: string;
  settings: {
    placementEnabled: boolean;
    transferAllowed: boolean;
    transferDeadline: string | null;
    overbookingAllowed: boolean;
    maxOverbookingCount: number | null;
  };
  invitationChannels: InvitationChannel[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const response = await serverFetch(`/events/${id}`);
  if (!response.ok) {
    notFound();
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
    <div className="mx-auto flex w-full max-w-2xl justify-center px-4 py-10">
      <EventWizard eventId={event.id} initialValues={values} status={event.status} />
    </div>
  );
}
