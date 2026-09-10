import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AddGuestDialog, ExportGuestsButton, ImportGuestsDialog, SendInvitationsDialog } from "@/components/modules/guest/guest-actions";
import { GuestsTable, type GuestRow } from "@/components/modules/guest/guests-table";
import type { TicketTypeResponse } from "@/components/modules/event";
import { serverFetch } from "@/lib/api-server";
import type { Guest, Invitation } from "@/components/modules/guest/schema";
import { INVITATION_CHANNELS, type InvitationChannel } from "@/lib/channels";
import { eventGuestsExportRoute } from "@/lib/constants";

/**
 * Guest-list management for one event: a data-table with search and category
 * filter, and toolbar dialogs for adding, importing and inviting. Creation and
 * sending live in Dialogs; destructive row actions keep their AlertDialogs.
 */
export async function GuestsView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [guestsResponse, invitationsResponse, eventResponse, typesResponse] = await Promise.all([
    serverFetch(`/events/${id}/guests`),
    serverFetch(`/events/${id}/invitations`),
    serverFetch(`/events/${id}`),
    serverFetch(`/events/${id}/ticket-types`),
  ]);
  const guests: Guest[] = guestsResponse.ok ? await guestsResponse.json() : [];
  const ticketTypes: TicketTypeResponse[] = typesResponse.ok ? await typesResponse.json() : [];
  const invitations: Invitation[] = invitationsResponse.ok ? await invitationsResponse.json() : [];
  const enabledChannels: InvitationChannel[] = eventResponse.ok
    ? ((await eventResponse.json()) as { invitationChannels: InvitationChannel[] }).invitationChannels
    : [];

  const statusFor = (guestId: string, channel: string): string | null =>
    invitations.find((invitation) => invitation.guestId === guestId && invitation.channel === channel)
      ?.status ?? null;

  const rows: GuestRow[] = guests.map((guest) => ({
    id: guest.id,
    name: `${guest.firstName} ${guest.lastName}`.trim(),
    contact: guest.email ?? guest.phoneNumber ?? "No contact",
    excludedFromInvitations: guest.excludedFromInvitations,
    checkedInAt: guest.checkedInAt ?? null,
    ticketTypeId: guest.ticketTypeId ?? null,
    statuses: Object.fromEntries(
      INVITATION_CHANNELS.map((channel) => [channel, statusFor(guest.id, channel)]),
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Guests</h1>
          <Badge variant="secondary">{guests.length}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportGuestsButton href={eventGuestsExportRoute(id)} />
          <ImportGuestsDialog eventId={id} />
          <AddGuestDialog eventId={id} />
          <SendInvitationsDialog
            eventId={id}
            enabledChannels={enabledChannels}
            guestCount={guests.length}
          />
        </div>
      </div>

      {guests.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No guests yet</EmptyTitle>
            <EmptyDescription>
              Start building your guest list: import a CSV file or add a guest by hand.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <ImportGuestsDialog eventId={id} />
            <AddGuestDialog eventId={id} />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-4">
          <GuestsTable eventId={id} rows={rows} ticketTypes={ticketTypes} />
        </div>
      )}
    </div>
  );
}
