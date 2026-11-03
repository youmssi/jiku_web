import { getLocale, getTranslations } from "next-intl/server";
import { MapPin, MessageCircle } from "lucide-react";
import { CardHero, ClampedText, directionsLink, googleCalendarLink, OrganizerMark, StateMessage, TrackedLink, VerifiedBadge } from "@/components/shared";
import { CARD_STYLE_TOKENS, cardStyleOf, displayTitle, FALLBACK_BRAND_COLOR } from "@/lib/card-style";
import { countdown, fullWhen, liveWhen, shortDay, shortTime } from "@/lib/short-dates";
import { RespondForm } from "./respond-form";
import { CardVisit } from "./card-visit";
import { whatsappAnswerLink, type CardSource } from "./share";
import type { PublicOpenInvitation } from "./schema";

/**
 * A shared card's page (JIKU-184, JIKU-194), in the style the organizer picked:
 * the banner with the title and the date, the host's word, then the answer.
 * The WhatsApp button answers without a form; the form answers here.
 */
export async function OpenInvitationPage({
  invitation,
  source = null,
}: {
  invitation: PublicOpenInvitation;
  /** The network the page was opened from (JIKU-282); null when the link carried none. */
  source?: CardSource | null;
}) {
  const [t, locale] = await Promise.all([getTranslations("guest.openInvitation"), getLocale()]);
  const style = cardStyleOf(invitation.cardStyle);
  const tokens = CARD_STYLE_TOKENS[style];
  const zone = invitation.eventTimezone;
  const start = invitation.eventStart;
  const answerBy =
    invitation.closesAt && invitation.accepting
      ? `${shortDay(invitation.closesAt, zone, locale, { weekday: false })} · ${shortTime(invitation.closesAt, zone, locale)}`
      : null;
  const whatsapp = invitation.whatsappNumber
    ? whatsappAnswerLink(invitation.whatsappNumber, t("whatsappMessage", { code: invitation.code }))
    : null;
  const pill = style === "MODERN" ? "rounded-sm" : "rounded-full";
  const until = start ? countdown(start, zone, locale) : null;
  // Offered once the person answered: saving the date only matters to someone who may come (JIKU-289).
  const calendar = start
    ? {
        google: googleCalendarLink({
          title: invitation.eventName,
          start,
          end: invitation.eventEnd ?? null,
          location: invitation.eventLocation ?? null,
          details: invitation.organizerName,
        }),
        ics: `/api/cards/${encodeURIComponent(invitation.code)}/calendar`,
      }
    : null;

  return (
    <div className="flex flex-1 flex-col" style={{ background: tokens.panel, color: tokens.panelInk }}>
      <CardVisit code={invitation.code} source={source} />
      <CardHero style={style} color={invitation.primaryColor ?? FALLBACK_BRAND_COLOR} bannerUrl={invitation.bannerUrl}>
        <div className="mx-auto flex min-h-72 w-full max-w-lg flex-col justify-between gap-8 px-5 pb-6 pt-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <OrganizerMark name={invitation.organizerName} logoUrl={invitation.logoUrl} square={style === "MODERN"} />
            <span>{t("invitedBy", { organizer: invitation.organizerName })}</span>
            <VerifiedBadge kind={invitation.organizerVerification} />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-balance" style={displayTitle(tokens, "clamp(2.4rem, 11vw, 3.4rem)")}>
              {invitation.eventName}
            </h1>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {start ? (
                <time
                  dateTime={start}
                  title={fullWhen(start, zone, locale)}
                  className={`inline-flex min-h-8 items-center border border-white/30 bg-white/15 px-3 py-1 ${pill}`}
                >
                  <span className="block first-letter:uppercase">{liveWhen(start, zone, locale)}</span>
                </time>
              ) : null}
              {invitation.eventLocation ? (
                <a
                  href={directionsLink(invitation.eventLocation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("directions", { place: invitation.eventLocation })}
                  className={`inline-flex min-h-8 items-center gap-1.5 border border-white/30 bg-white/15 px-3 py-1 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 ${pill}`}
                >
                  <MapPin aria-hidden className="size-3.5" />
                  {invitation.eventLocation}
                </a>
              ) : null}
            </div>
            {start && until ? <p className="text-sm font-medium opacity-90">{until}</p> : null}
          </div>
        </div>
      </CardHero>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-5 pb-10 pt-6">
        {invitation.welcomeMessage ? (
          <ClampedText text={invitation.welcomeMessage} more={t("readMore")} className="text-[15px] leading-relaxed" />
        ) : null}
        {answerBy ? (
          <p className="flex items-center gap-2 text-xs font-semibold" style={{ color: tokens.panelMuted }}>
            <span aria-hidden className="size-1.5 rounded-full" style={{ background: tokens.detail }} />
            {t("answerBy", { date: answerBy })}
          </p>
        ) : null}

        {invitation.accepting ? (
          <>
            {whatsapp ? (
              <div className="flex flex-col gap-2">
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center gap-2 bg-[#1F7A54] text-[15px] font-semibold text-white transition-colors hover:bg-[#1A6847] focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ borderRadius: Math.min(tokens.radius, 16) }}
                >
                  <MessageCircle aria-hidden className="size-5" />
                  {t("answerOnWhatsApp")}
                </a>
                <p className="text-center text-xs" style={{ color: tokens.panelMuted }}>
                  {t("orHere")}
                </p>
              </div>
            ) : null}
            <RespondForm invitation={invitation} style={style} source={source} calendar={calendar} />
          </>
        ) : (
          <StateMessage title={t("closedTitle")} description={t(`closed.${invitation.closedReason ?? "DISABLED"}`)} />
        )}
        {invitation.jikuSignature ? (
          <TrackedLink
            href="/"
            eventName="cta_click"
            eventProperties={{ from: "card_signature" }}
            className="mx-auto mt-auto inline-flex min-h-11 items-center gap-2 pt-8 text-xs font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: tokens.panelMuted }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- a 16 px static mark, no optimisation needed */}
            <img src="/jiku-logo-mark.png" alt="" width={16} height={16} className="size-4" />
            {t("signature")}
          </TrackedLink>
        ) : null}
      </div>
    </div>
  );
}
