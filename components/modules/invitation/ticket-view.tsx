import Link from "next/link";
import { publicFetch } from "@/lib/api-server";
import { invitationRoute, PRIVACY_ROUTE } from "@/lib/constants";
import { TicketCard } from "@/components/modules/invitation/ticket-card";
import { DataDeletion } from "@/components/modules/invitation/data-deletion";
import type { RsvpView } from "@/components/modules/invitation/schema";
import { StateMessage } from "@/components/shared/state-message";

/** Guest-facing ticket screen, shown once the guest has confirmed. */
export async function TicketView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const response = await publicFetch(`/rsvp/${token}`);

  if (!response.ok) {
    return (
      <StateMessage
        title="Ticket unavailable"
        description="This invitation link is invalid or has expired."
      />
    );
  }

  const rsvp = (await response.json()) as RsvpView;

  if (rsvp.status !== "CONFIRMED" || !rsvp.ticketCode) {
    return (
      <StateMessage
        title="No ticket yet"
        description="Confirm your attendance to get your ticket."
        action={
          <Link
            href={invitationRoute(token)}
            className="text-sm font-medium underline underline-offset-4"
          >
            Back to your invitation
          </Link>
        }
      />
    );
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(60% 50% at 50% 0%, ${rsvp.primaryColor}14, transparent)`,
        }}
      />
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
