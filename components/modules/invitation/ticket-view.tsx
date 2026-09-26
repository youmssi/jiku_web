import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { publicFetch } from "@/lib/api-server";
import { invitationRoute, PRIVACY_ROUTE, ticketRoute } from "@/lib/constants";
import { formatEventDay, formatEventTime, zoneCity } from "@/lib/datetime";
import { routing } from "@/i18n/routing";
import { TicketCard } from "@/components/modules/invitation/ticket-card";
import { TicketActions } from "@/components/modules/invitation/ticket-actions";
import { DataDeletion } from "@/components/modules/invitation/data-deletion";
import { googleCalendarLink } from "@/components/modules/invitation/calendar-link";
import type { RsvpView } from "@/components/modules/invitation/schema";
import { PaymentDue, StateMessage } from "@/components/shared";
import { siteUrl } from "@/components/modules/seo";

/** Guest-facing ticket screen, shown once the guest has confirmed. */
export async function TicketView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [response, t, locale] = await Promise.all([
    publicFetch(`/rsvp/${token}`),
    getTranslations("guest.ticket"),
    getLocale(),
  ]);

  if (!response.ok) {
    return <StateMessage title={t("unavailableTitle")} description={t("unavailableDescription")} />;
  }

  const rsvp = (await response.json()) as RsvpView;

  if (rsvp.status !== "CONFIRMED" || !rsvp.ticketCode) {
    return (
      <StateMessage
        title={t("noneTitle")}
        description={t("noneDescription")}
        action={
          <Link
            href={invitationRoute(token)}
            className="text-sm font-medium underline underline-offset-4"
          >
            {t("back")}
          </Link>
        }
      />
    );
  }

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
        ticketCode={rsvp.ticketCode}
        eventName={rsvp.eventName}
        organizerName={rsvp.organizerName}
        primaryColor={rsvp.primaryColor}
        logoUrl={rsvp.logoUrl}
        guestName={rsvp.guestName}
        categoryName={rsvp.categoryName}
        day={start && zone ? formatEventDay(start, zone, locale) : null}
        time={
          start && zone
            ? [start, rsvp.eventEnd]
                .filter((instant): instant is string => Boolean(instant))
                .map((instant) => formatEventTime(instant, zone, locale))
                .join(" – ")
            : null
        }
        zone={zone ? zoneCity(zone) : null}
        location={rsvp.eventLocation}
        cancelled={cancelled}
      />
      {rsvp.payment && !cancelled ? (
        <div className="mt-4 w-full max-w-sm print:hidden">
          <PaymentDue {...rsvp.payment} />
        </div>
      ) : null}
      <TicketActions calendarUrl={calendarUrl} />
      <p className="mt-3 text-center text-xs text-muted-foreground print:hidden">{t("brightness")}</p>
      <div className="w-full max-w-sm print:hidden">
        <DataDeletion token={token} erased={rsvp.erased} />
        <p className="mt-4 text-xs text-muted-foreground">
          <Link href={PRIVACY_ROUTE} className="underline underline-offset-4">
            {(await getTranslations("guest.invitation"))("privacy")}
          </Link>
        </p>
      </div>
    </div>
  );
}
