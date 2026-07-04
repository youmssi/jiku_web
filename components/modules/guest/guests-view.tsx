import Link from "next/link";
import { Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
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
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Guests</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={eventDashboardRoute(id)}>Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={eventEditRoute(id)}>Back to event</Link>
          </Button>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add guests</CardTitle>
          <CardDescription>
            Import a CSV for bulk invitations, or add a single guest by hand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList>
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="manual">Add manually</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4 flex flex-col gap-4">
              <GuestImport eventId={id} />
              <Button variant="outline" size="sm" className="self-start" asChild>
                <a href={CSV_TEMPLATE_HREF} download>
                  <Download className="size-4" />
                  Download CSV template
                </a>
              </Button>
            </TabsContent>
            <TabsContent value="manual" className="mt-4">
              <AddGuest eventId={id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg border p-4">
        <SendInvitations eventId={id} />
      </div>

      {guests.length === 0 ? (
        <Empty className="mt-6 border">
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>No guests yet</EmptyTitle>
          <EmptyDescription>
            Import a CSV or add a guest by hand to start building your list.
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="mt-6">
          <GuestsTable rows={rows} />
        </div>
      )}
    </div>
  );
}
