import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EventWizard } from "@/components/modules/event/event-wizard";
import { QuorumSettings } from "@/components/modules/event/quorum-settings";
import { TicketTypesSettings } from "@/components/modules/event/ticket-types-settings";
import { StateMessage } from "@/components/shared/state-message";
import type {
  EventFormValues,
  EventResponse,
  TicketTypeResponse,
} from "@/components/modules/event/schema";
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

  // Les catégories vivent sur leur propre ressource : elles se créent et se
  // suppriment indépendamment de l'événement, et l'échec de leur chargement ne
  // doit pas empêcher de modifier l'événement lui-même.
  const typesResponse = await serverFetch(`/events/${id}/ticket-types`);
  const ticketTypes: TicketTypeResponse[] = typesResponse.ok
    ? ((await typesResponse.json()) as TicketTypeResponse[])
    : [];

  const values: EventFormValues = {
    name: event.name,
    description: event.description ?? "",
    timezone: event.timezone,
    startLocal: utcToLocalInput(event.startDateTime, event.timezone),
    endLocal: utcToLocalInput(event.endDateTime, event.timezone),
    location: event.location ?? "",
    transferAllowed: event.settings.transferAllowed,
    transferDeadlineLocal: utcToLocalInput(event.settings.transferDeadline, event.timezone),
    overbookingAllowed: event.settings.overbookingAllowed,
    maxOverbookingCount: event.settings.maxOverbookingCount,
    invitationChannels: event.invitationChannels,
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <EventWizard eventId={event.id} initialValues={values} status={event.status} />
      {/* Blocs distincts, repliables : un quorum est une règle statutaire saisie
          une fois, les catégories vivent sur leur propre ressource. */}
      <div className="mt-8 flex flex-col gap-4">
        <CollapsibleSection title="Catégories d'accès">
          <TicketTypesSettings eventId={event.id} initial={ticketTypes} />
        </CollapsibleSection>
        <CollapsibleSection title="Quorum">
          <QuorumSettings eventId={event.id} initial={event.quorum ?? null} />
        </CollapsibleSection>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Collapsible defaultOpen className="rounded-xl border">
      <CollapsibleTrigger className="group flex w-full items-center justify-between px-5 py-4 text-left">
        <h2 className="text-base font-medium">{title}</h2>
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t px-5 py-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
