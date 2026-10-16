import { getLocale, getTranslations } from "next-intl/server";
import { publicFetch } from "@/lib/api-server";
import { CARD_STYLE_TOKENS, cardStyleOf, displayTitle, FALLBACK_BRAND_COLOR } from "@/lib/card-style";
import { fullWhen, liveWhen } from "@/lib/short-dates";
import { CardHero, OrganizerMark, PaymentDue, StateMessage, VerifiedBadge } from "@/components/shared";
import { RsvpActions } from "@/components/modules/invitation/rsvp-actions";
import { DataDeletion } from "@/components/modules/invitation/data-deletion";
import { TicketScreen } from "@/components/modules/invitation/ticket-view";
import type { RsvpView } from "@/components/modules/invitation/schema";

/**
 * A guest's personal link (JIKU-248), short or signed. Before answering, the
 * invitation in the organizer's style with a one-tap answer, like a shared
 * card; once confirmed, the ticket itself, so the QR code is the first thing
 * the guest sees when opening the message again.
 */
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
  if (rsvp.status === "CONFIRMED" && rsvp.ticketCode) {
    return <TicketScreen rsvp={rsvp} token={token} />;
  }

  const style = cardStyleOf(rsvp.cardStyle);
  const tokens = CARD_STYLE_TOKENS[style];
  const pill = style === "MODERN" ? "rounded-sm" : "rounded-full";
  const start = rsvp.eventStart;
  const zone = rsvp.eventTimezone;
  const cancelled = rsvp.eventStatus === "CANCELLED";

  return (
    <div className="flex flex-1 flex-col" style={{ background: tokens.panel, color: tokens.panelInk }}>
      <CardHero style={style} color={rsvp.primaryColor ?? FALLBACK_BRAND_COLOR} bannerUrl={rsvp.bannerUrl}>
        <div className="mx-auto flex min-h-64 w-full max-w-lg flex-col justify-between gap-8 px-5 pb-6 pt-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <OrganizerMark name={rsvp.organizerName} logoUrl={rsvp.logoUrl} square={style === "MODERN"} />
            <span>{t("invitedBy", { organizer: rsvp.organizerName })}</span>
            <VerifiedBadge kind={rsvp.organizerVerification} />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-balance" style={displayTitle(tokens, "clamp(2.2rem, 10vw, 3.2rem)")}>
              {rsvp.eventName}
            </h1>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {start && zone ? (
                <time
                  dateTime={start}
                  title={fullWhen(start, zone, locale)}
                  className={`border border-white/30 bg-white/15 px-3 py-1 first-letter:uppercase ${pill}`}
                >
                  {liveWhen(start, zone, locale)}
                </time>
              ) : null}
              {rsvp.eventLocation ? (
                <span className={`border border-white/30 bg-white/15 px-3 py-1 ${pill}`}>{rsvp.eventLocation}</span>
              ) : null}
            </div>
          </div>
        </div>
      </CardHero>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-5 pb-10 pt-6">
        <p className="text-[15px]">{t("greeting", { name: rsvp.guestName })}</p>
        {rsvp.payment && !cancelled ? (
          <PaymentDue {...rsvp.payment} organizerVerification={rsvp.organizerVerification} />
        ) : null}
        {cancelled ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {t("cancelled")}
          </p>
        ) : (
          <RsvpActions token={token} status={rsvp.status} style={style} transferredTo={rsvp.transferredTo} />
        )}
        <div className="mt-auto flex justify-center pt-4">
          <DataDeletion token={token} erased={rsvp.erased} />
        </div>
      </div>
    </div>
  );
}
