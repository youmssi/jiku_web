import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/components/modules/seo";
import { fetchPublicOpenInvitation } from "@/components/modules/open-invitation/server";
import { shortDay, shortTime, shortWhen } from "@/lib/short-dates";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Invitation";

/** The link preview WhatsApp shows when a card is posted (JIKU-184): who invites, what, when and where. */
export default async function OpenInvitationImage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale: requested, code } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const [invitation, t] = await Promise.all([
    fetchPublicOpenInvitation(code),
    getTranslations({ locale, namespace: "guest.openInvitation" }),
  ]);
  const when = invitation?.eventStart ? shortWhen(invitation.eventStart, invitation.eventTimezone, locale) : "";
  return new ImageResponse(
    buildOgImage({
      eyebrow: invitation ? t("invitedBy", { organizer: invitation.organizerName }) : "Jikū",
      headline: invitation?.eventName ?? t("previewFallback"),
      subtitle: [when, invitation?.eventLocation].filter(Boolean).join(" · "),
      badges: [
        invitation?.closesAt && invitation.accepting
          ? t("answerBy", {
              date: `${shortDay(invitation.closesAt, invitation.eventTimezone, locale, { weekday: false })} · ${shortTime(invitation.closesAt, invitation.eventTimezone, locale)}`,
            })
          : t("previewBadge"),
      ],
    }),
    size,
  );
}
