import Link from "next/link";
import { Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddGuest } from "@/components/modules/guest/add-guest";
import { GuestImport } from "@/components/modules/guest/guest-import";
import { GuestsTable, type GuestRow } from "@/components/modules/guest/guests-table";
import { SendInvitations } from "@/components/modules/guest/send-invitations";
import { EventSubNav } from "@/components/shared/event-sub-nav";
import type { TicketTypeResponse } from "@/components/modules/event";
import { serverFetch } from "@/lib/api-server";
import type { Guest, Invitation } from "@/components/modules/guest/schema";
import { INVITATION_CHANNELS, type InvitationChannel } from "@/lib/channels";

const CSV_TEMPLATE_HREF = "/templates/guest-import-template.csv";

/** Guest-list management for one event: import, invitations and the roster table. */
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
    contact: guest.email ?? guest.phoneNumber ?? "—",
    excludedFromInvitations: guest.excludedFromInvitations,
    checkedInAt: guest.checkedInAt ?? null,
    ticketTypeId: guest.ticketTypeId ?? null,
    statuses: Object.fromEntries(
      INVITATION_CHANNELS.map((channel) => [channel, statusFor(guest.id, channel)]),
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Guests</h1>
      </div>

      <div className="mt-6">
        <EventSubNav eventId={id} />
      </div>

      <Tabs defaultValue="import" className="mt-6">
        <TabsList>
          <TabsTrigger value="import">Import CSV</TabsTrigger>
          <TabsTrigger value="add">Add manually</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-4">
          <div className="rounded-lg border p-4">
            <GuestImport eventId={id} />
          </div>
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <div className="rounded-lg border p-4">
            <AddGuest eventId={id} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 rounded-lg border p-4">
        <SendInvitations eventId={id} enabledChannels={enabledChannels} />
      </div>

      {guests.length === 0 ? (
        <Empty className="mt-8 border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No guests yet</EmptyTitle>
            <EmptyDescription>
              Start building your guest list by importing a CSV file or adding a guest by hand above.
              Need a template?{" "}
              <a
                href={CSV_TEMPLATE_HREF}
                download
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Download our CSV template
              </a>{" "}
              to get started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant="outline" size="sm">
              <Link href={CSV_TEMPLATE_HREF} download>
                <Download className="size-3.5" />
                Download CSV template
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted-foreground">
            {rows.length} guest{rows.length !== 1 ? "s" : ""}
          </p>
          <GuestsTable eventId={id} rows={rows} ticketTypes={ticketTypes} />
        </div>
      )}
    </div>
  );
}
