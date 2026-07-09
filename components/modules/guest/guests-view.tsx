import Link from "next/link";
import { Download, Users, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { serverFetch } from "@/lib/api-server";
import { eventDashboardRoute, eventEditRoute } from "@/lib/constants";
import type { Guest, Invitation } from "@/components/modules/guest/schema";
import { INVITATION_CHANNELS } from "@/lib/channels";

const CSV_TEMPLATE_HREF = "/templates/guest-import-template.csv";

/** Guest-list management for one event: import, invitations and the roster table. */
export async function GuestsView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [guestsResponse, invitationsResponse] = await Promise.all([
    serverFetch(`/events/${id}/guests`),
    serverFetch(`/events/${id}/invitations`),
  ]);
  const guests: Guest[] = guestsResponse.ok ? await guestsResponse.json() : [];
  const invitations: Invitation[] = invitationsResponse.ok ? await invitationsResponse.json() : [];

  const statusFor = (guestId: string, channel: string): string | null =>
    invitations.find((invitation) => invitation.guestId === guestId && invitation.channel === channel)
      ?.status ?? null;

  const rows: GuestRow[] = guests.map((guest) => ({
    id: guest.id,
    name: `${guest.firstName} ${guest.lastName}`.trim(),
    contact: guest.email ?? guest.phoneNumber ?? "—",
    statuses: Object.fromEntries(
      INVITATION_CHANNELS.map((channel) => [channel, statusFor(guest.id, channel)]),
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Guests</h1>
        <ButtonGroup>
          <Button variant="outline" asChild>
            <Link href={eventDashboardRoute(id)}>Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={eventEditRoute(id)}>Back to event</Link>
          </Button>
        </ButtonGroup>
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
        <SendInvitations eventId={id} />
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
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {rows.length} guest{rows.length !== 1 ? "s" : ""}
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link href={CSV_TEMPLATE_HREF} download>
                <FileSpreadsheet className="size-3.5" />
                Template
              </Link>
            </Button>
          </div>
          <GuestsTable rows={rows} />
        </div>
      )}
    </div>
  );
}
