import { getLocale, getTranslations } from "next-intl/server";
import { CalendarDays, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { publicFetch } from "@/lib/api-server";
import { PRIVACY_ROUTE } from "@/lib/constants";
import { formatEventDay, formatEventTime } from "@/lib/datetime";
import { PaymentDue, StateMessage } from "@/components/shared";
import { RsvpActions } from "@/components/modules/invitation/rsvp-actions";
import { DataDeletion } from "@/components/modules/invitation/data-deletion";
import type { RsvpView } from "@/components/modules/invitation/schema";

/** Guest-facing invitation screen: event details and RSVP actions. */
export async function InvitationView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [response, t, locale] = await Promise.all([
    publicFetch(`/rsvp/${token}`),
    getTranslations("guest.invitation"),
    getLocale(),
  ]);

  if (!response.ok) {
    return <StateMessage title={t("unavailableTitle")} description={t("unavailableDescription")} />;
  }

  const rsvp = (await response.json()) as RsvpView;
  const start = rsvp.eventStart;
  const zone = rsvp.eventTimezone;
  const when =
    start && zone ? `${formatEventDay(start, zone, locale)} · ${formatEventTime(start, zone, locale)}` : null;
  const cancelled = rsvp.eventStatus === "CANCELLED";

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
        <p className="text-sm text-muted-foreground">
          {t("invites", { organizer: rsvp.organizerName })}
        </p>
        <h1 className="mt-1 text-balance text-2xl font-semibold">{rsvp.eventName}</h1>
        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {when ? (
            <p className="flex items-center justify-center gap-1.5 first-letter:uppercase">
              <CalendarDays aria-hidden className="size-4 shrink-0" />
              <span className="first-letter:uppercase">{when}</span>
            </p>
          ) : null}
          {rsvp.eventLocation ? (
            <p className="flex items-center justify-center gap-1.5">
              <MapPin aria-hidden className="size-4 shrink-0" />
              {rsvp.eventLocation}
            </p>
          ) : null}
        </div>
        <p className="mt-4 text-sm">{t("greeting", { name: rsvp.guestName })}</p>
        {rsvp.payment && !cancelled ? (
          <div className="mt-4">
            <PaymentDue {...rsvp.payment} />
          </div>
        ) : null}
        {cancelled ? (
          <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {t("cancelled")}
          </p>
        ) : (
        <div className="mt-6">
          <RsvpActions
            token={token}
            status={rsvp.status}
            primaryColor={rsvp.primaryColor}
            ticketCode={rsvp.ticketCode}
            transferAllowed={rsvp.transferAllowed}
            transferDeadline={rsvp.transferDeadline}
            transferredTo={rsvp.transferredTo}
          />
        </div>
        )}
        <DataDeletion token={token} erased={rsvp.erased} />
        <p className="mt-4 text-xs text-muted-foreground">
          <Link href={PRIVACY_ROUTE} className="underline underline-offset-4">
            {t("privacy")}
          </Link>
        </p>
      </div>
    </div>
  );
}
