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
import { GuestImport } from "@/components/modules/organizer/components/guest-import";
import { SendInvitations } from "@/components/modules/organizer/components/send-invitations";
import { serverFetch } from "@/lib/api-server";
import { eventDashboardRoute, eventEditRoute } from "@/lib/constants";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
}

interface Invitation {
  guestId: string;
  channel: string;
  status: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-muted-foreground">—</span>;
  }
  const variant =
    status === "SENT" ? "default" : status === "FAILED" ? "destructive" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

export default async function GuestsPage({ params }: PageProps) {
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
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
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
                  <TableCell>
                    <StatusBadge status={statusFor(guest.id, "EMAIL")} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={statusFor(guest.id, "WHATSAPP")} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
