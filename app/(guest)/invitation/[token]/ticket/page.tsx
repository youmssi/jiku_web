import Link from "next/link";
import { apiBaseUrl } from "@/lib/api";
import { invitationRoute, PRIVACY_ROUTE } from "@/lib/constants";
import { TicketCard, DataDeletion } from "@/components/modules/invitation";
import type { RsvpView } from "@/components/modules/invitation";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function TicketPage({ params }: PageProps) {
  const { token } = await params;
  const response = await fetch(`${apiBaseUrl()}/rsvp/${token}`, { cache: "no-store" });

  if (!response.ok) {
    return (
      <Centered>
        <h1 className="text-xl font-semibold">Ticket unavailable</h1>
        <p className="mt-2 text-muted-foreground">
          This invitation link is invalid or has expired.
        </p>
      </Centered>
    );
  }

  const rsvp = (await response.json()) as RsvpView;

  if (rsvp.status !== "CONFIRMED" || !rsvp.ticketCode) {
    return (
      <Centered>
        <h1 className="text-xl font-semibold">No ticket yet</h1>
        <p className="mt-2 text-muted-foreground">
          Confirm your attendance to get your ticket.
        </p>
        <Link
          href={invitationRoute(token)}
          className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
        >
          Back to your invitation
        </Link>
      </Centered>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <TicketCard
        ticketCode={rsvp.ticketCode}
        eventName={rsvp.eventName}
        eventWhen={rsvp.eventWhen}
        eventLocation={rsvp.eventLocation}
        organizerName={rsvp.organizerName}
        primaryColor={rsvp.primaryColor}
        logoUrl={rsvp.logoUrl}
        guestName={rsvp.guestName}
      />
      <div className="w-full max-w-sm">
        <DataDeletion token={token} erased={rsvp.erased} />
        <p className="mt-4 text-xs text-muted-foreground">
          <Link href={PRIVACY_ROUTE} className="underline underline-offset-4">
            How your data is used
          </Link>
        </p>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">{children}</div>
    </div>
  );
}
