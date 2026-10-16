import { getLocale, getTranslations } from "next-intl/server";
import { ticketRoute } from "@/lib/constants";
import { zoneCity } from "@/lib/datetime";
import { datePart, fullWhen, shortTime } from "@/lib/short-dates";
import { cardStyleOf } from "@/lib/card-style";
import { routing } from "@/i18n/routing";
import { TicketCard } from "@/components/modules/invitation/ticket-card";
import { TicketActions } from "@/components/modules/invitation/ticket-actions";
import { TicketSecondaryActions } from "@/components/modules/invitation/ticket-secondary-actions";
import { DataDeletion } from "@/components/modules/invitation/data-deletion";
import { googleCalendarLink } from "@/components/modules/invitation/calendar-link";
import type { RsvpView } from "@/components/modules/invitation/schema";
import { PaymentDue, VerifiedBadge } from "@/components/shared";
import { siteUrl } from "@/components/modules/seo";

/**
 * A confirmed guest's ticket (JIKU-248): what the invitation link shows once
 * the guest said yes, so the QR code is one tap away from the message. Giving
 * the place away or cancelling stays reachable, as quiet links below.
 */
export async function TicketScreen({ rsvp, token }: { rsvp: RsvpView; token: string }) {
  const [t, locale] = await Promise.all([getTranslations("guest.ticket"), getLocale()]);
  const ticketCode = rsvp.ticketCode ?? "";
  const start = rsvp.eventStart;
  const zone = rsvp.eventTimezone;
  const cancelled = rsvp.eventStatus === "CANCELLED";
  const calendarUrl =
    start && !cancelled
      ? googleCalendarLink({
          title: rsvp.eventName,
          start,
          end: rsvp.eventEnd,
          location: rsvp.eventLocation,
          details: `${rsvp.organizerName} · ${siteUrl()}${locale === routing.defaultLocale ? "" : `/${locale}`}${ticketRoute(token)}`,
        })
      : null;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 print:hidden"
        style={{
          backgroundImage: `radial-gradient(60% 50% at 50% 0%, ${rsvp.primaryColor}14, transparent)`,
        }}
      />
      {cancelled ? (
        <p className="mb-4 w-full max-w-sm rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
          {t("cancelled")}
        </p>
      ) : null}
      <TicketCard
        ticketCode={ticketCode}
        eventName={rsvp.eventName}
        organizerName={rsvp.organizerName}
        primaryColor={rsvp.primaryColor}
        logoUrl={rsvp.logoUrl}
        guestName={rsvp.guestName}
        categoryName={rsvp.categoryName}
        companions={rsvp.companions}
        start={start}
        style={cardStyleOf(rsvp.cardStyle)}
        bannerUrl={rsvp.bannerUrl ?? null}
        day={start && zone ? datePart(start, zone, locale, { day: "numeric" }) : null}
        month={start && zone ? datePart(start, zone, locale, { month: "short" }) : null}
        time={
          start && zone
            ? [start, rsvp.eventEnd]
                .filter((instant): instant is string => Boolean(instant))
                .map((instant) => shortTime(instant, zone, locale))
                .join(" – ")
            : null
        }
        whenFull={start && zone ? fullWhen(start, zone, locale) : null}
        timeZone={zone}
        zoneCity={zone ? zoneCity(zone) : null}
        location={rsvp.eventLocation}
        cancelled={cancelled}
      />
      {rsvp.payment && !cancelled ? (
        <div className="mt-4 w-full max-w-sm print:hidden">
          <PaymentDue {...rsvp.payment} organizerVerification={rsvp.organizerVerification} />
        </div>
      ) : null}
      <VerifiedBadge kind={rsvp.organizerVerification} className="mt-4 print:hidden" />
      <TicketActions calendarUrl={calendarUrl} />
      <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-1 print:hidden">
        {cancelled ? null : (
          <TicketSecondaryActions
            token={token}
            transferAllowed={rsvp.transferAllowed}
            transferDeadline={rsvp.transferDeadline}
          />
        )}
        <DataDeletion token={token} erased={rsvp.erased} />
      </div>
    </div>
  );
}
