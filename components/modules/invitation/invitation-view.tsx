import Link from "next/link";
import { publicFetch } from "@/lib/api-server";
import { PRIVACY_ROUTE } from "@/lib/constants";
import { StateMessage } from "@/components/shared/state-message";
import { RsvpActions } from "@/components/modules/invitation/rsvp-actions";
import { DataDeletion } from "@/components/modules/invitation/data-deletion";
import type { RsvpTransferCapability, RsvpView } from "@/components/modules/invitation/schema";

/** Guest-facing invitation screen: event details and RSVP actions. */
export async function InvitationView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const response = await publicFetch(`/rsvp/${token}`);

  if (!response.ok) {
    return (
      <StateMessage
        title="Invitation unavailable"
        description="This invitation link is invalid or has expired."
      />
    );
  }

  const rsvp = (await response.json()) as RsvpView & Partial<RsvpTransferCapability>;

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
            transferAllowed={rsvp.transferAllowed ?? false}
            transferDeadline={rsvp.transferDeadline ?? null}
            transferredTo={rsvp.transferredTo ?? null}
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
