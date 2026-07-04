import Link from "next/link";
import { apiBaseUrl } from "@/lib/api";
import { PRIVACY_ROUTE } from "@/lib/constants";
import { RsvpActions } from "@/components/modules/invitation/rsvp-actions";
import { DataDeletion } from "@/components/modules/invitation/data-deletion";
import type { RsvpView } from "@/components/modules/invitation/schema";

/** Guest-facing invitation screen: event details and RSVP actions. */
export async function InvitationView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const response = await fetch(`${apiBaseUrl()}/rsvp/${token}`, { cache: "no-store" });

  if (!response.ok) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Invitation unavailable</h1>
          <p className="mt-2 text-muted-foreground">
            This invitation link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  const rsvp = (await response.json()) as RsvpView;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        {rsvp.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rsvp.logoUrl}
            alt={rsvp.organizerName}
            className="mx-auto mb-4 h-12 object-contain"
          />
        ) : null}
        <p className="text-sm text-muted-foreground">{rsvp.organizerName} invites you to</p>
        <h1 className="mt-1 text-2xl font-semibold">{rsvp.eventName}</h1>
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          {rsvp.eventWhen ? <p>📅 {rsvp.eventWhen}</p> : null}
          {rsvp.eventLocation ? <p>📍 {rsvp.eventLocation}</p> : null}
        </div>
        <p className="mt-4 text-sm">Hi {rsvp.guestName},</p>
        <div className="mt-6">
          <RsvpActions
            token={token}
            status={rsvp.status}
            primaryColor={rsvp.primaryColor}
            ticketCode={rsvp.ticketCode}
          />
        </div>
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
