import { getLocale, getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { CardHero, ClampedText, OrganizerMark, StateMessage, VerifiedBadge } from "@/components/shared";
import { CARD_STYLE_TOKENS, cardStyleOf, displayTitle, FALLBACK_BRAND_COLOR } from "@/lib/card-style";
import { fullWhen, liveWhen, shortDay, shortTime } from "@/lib/short-dates";
import { RespondForm } from "./respond-form";
import { whatsappAnswerLink } from "./share";
import type { PublicOpenInvitation } from "./schema";

/**
 * A shared card's page (JIKU-184, JIKU-194), in the style the organizer picked:
 * the banner with the title and the date, the host's word, then the answer.
 * The WhatsApp button answers without a form; the form answers here.
 */
export async function OpenInvitationPage({ invitation }: { invitation: PublicOpenInvitation }) {
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

  return (
    <div className="flex flex-1 flex-col" style={{ background: tokens.panel, color: tokens.panelInk }}>
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
                  className={`border border-white/30 bg-white/15 px-3 py-1 first-letter:uppercase ${pill}`}
                >
                  {liveWhen(start, zone, locale)}
                </time>
              ) : null}
              {invitation.eventLocation ? (
                <span className={`border border-white/30 bg-white/15 px-3 py-1 ${pill}`}>{invitation.eventLocation}</span>
              ) : null}
            </div>
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
            <RespondForm invitation={invitation} style={style} />
          </>
        ) : (
          <StateMessage title={t("closedTitle")} description={t(`closed.${invitation.closedReason ?? "DISABLED"}`)} />
        )}
      </div>
    </div>
  );
}
