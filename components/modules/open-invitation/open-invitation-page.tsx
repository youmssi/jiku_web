import { getLocale, getTranslations } from "next-intl/server";
import { CalendarDays, Hourglass, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClampedText, StateMessage, VerifiedBadge } from "@/components/shared";
import { fullWhen, liveWhen, shortDay, shortTime } from "@/lib/short-dates";
import { RespondForm } from "./respond-form";
import { whatsappAnswerLink } from "./share";
import type { PublicOpenInvitation } from "./schema";

/**
 * A shared card's page (JIKU-184): who invites, when and where, the host's
 * word, then the answer. The WhatsApp button, when the platform has a number
 * for cards, answers without a form; the form answers here.
 */
export async function OpenInvitationPage({ invitation }: { invitation: PublicOpenInvitation }) {
  const [t, locale] = await Promise.all([getTranslations("guest.openInvitation"), getLocale()]);
  const zone = invitation.eventTimezone;
  const start = invitation.eventStart;
  const answerBy =
    invitation.closesAt && invitation.accepting
      ? `${shortDay(invitation.closesAt, zone, locale, { weekday: false })} · ${shortTime(invitation.closesAt, zone, locale)}`
      : null;
  const whatsapp = invitation.whatsappNumber
    ? whatsappAnswerLink(invitation.whatsappNumber, t("whatsappMessage", { code: invitation.code }))
    : null;

  return (
    <div className="flex flex-1 justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <header
          className="mb-8 rounded-2xl border p-6 text-center"
          style={invitation.primaryColor ? { borderTop: `4px solid ${invitation.primaryColor}` } : undefined}
        >
          {invitation.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={invitation.logoUrl} alt={invitation.organizerName} className="mx-auto mb-4 h-12 object-contain" />
          ) : null}
          <p className="text-sm text-muted-foreground">{t("invitedBy", { organizer: invitation.organizerName })}</p>
          <VerifiedBadge kind={invitation.organizerVerification} className="mt-2" />
          <h1 className="mt-2 text-balance text-2xl font-semibold">{invitation.eventName}</h1>
          <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {start ? (
              <p className="flex items-center justify-center gap-1.5">
                <CalendarDays aria-hidden className="size-4 shrink-0" />
                <time dateTime={start} title={fullWhen(start, zone, locale)} className="first-letter:uppercase">
                  {liveWhen(start, zone, locale)}
                </time>
              </p>
            ) : null}
            {invitation.eventLocation ? (
              <p className="flex items-center justify-center gap-1.5">
                <MapPin aria-hidden className="size-4 shrink-0" />
                {invitation.eventLocation}
              </p>
            ) : null}
          </div>
          {answerBy ? (
            <p className="mt-4 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              <Hourglass aria-hidden className="size-3.5 shrink-0" />
              {t("answerBy", { date: answerBy })}
            </p>
          ) : null}
          {invitation.welcomeMessage ? (
            <ClampedText text={invitation.welcomeMessage} more={t("readMore")} className="mt-4 text-sm" />
          ) : null}
        </header>

        {invitation.accepting ? (
          <div className="flex flex-col gap-6">
            {whatsapp ? (
              <div className="flex flex-col gap-2">
                <Button asChild size="lg" className="w-full">
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden />
                    {t("answerOnWhatsApp")}
                  </a>
                </Button>
                <p className="text-center text-xs text-muted-foreground">{t("orHere")}</p>
              </div>
            ) : null}
            <RespondForm invitation={invitation} />
          </div>
        ) : (
          <StateMessage
            title={t("closedTitle")}
            description={t(`closed.${invitation.closedReason ?? "DISABLED"}`)}
          />
        )}
      </div>
    </div>
  );
}
