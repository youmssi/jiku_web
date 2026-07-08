import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GuestImport } from "@/components/modules/guest/guest-import";
import { SendInvitations } from "@/components/modules/guest/send-invitations";
import { serverFetch } from "@/lib/api-server";
import { eventDashboardRoute, eventEditRoute } from "@/lib/constants";
import type { Guest, Invitation } from "@/components/modules/guest/schema";
import { INVITATION_CHANNELS, INVITATION_CHANNEL_LABELS } from "@/lib/channels";

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-muted-foreground">—</span>;
  }
  const variant =
    status === "SENT" ? "default" : status === "FAILED" ? "destructive" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

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

      <div className="mt-6 flex flex-col gap-4 rounded-lg border p-4">
        <GuestImport eventId={id} />
        <SendInvitations eventId={id} />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              {INVITATION_CHANNELS.map((channel) => (
                <TableHead key={channel}>{INVITATION_CHANNEL_LABELS[channel]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2 + INVITATION_CHANNELS.length}
                  className="text-center text-muted-foreground"
                >
                  No guests yet. Import a CSV to begin.
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    {guest.firstName} {guest.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {guest.email ?? guest.phoneNumber}
                  </TableCell>
                  {INVITATION_CHANNELS.map((channel) => (
                    <TableCell key={channel}>
                      <StatusBadge status={statusFor(guest.id, channel)} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
