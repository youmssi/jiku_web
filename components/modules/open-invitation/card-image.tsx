import "server-only";

import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/components/modules/seo";
import { cardStyleOf, FALLBACK_BRAND_COLOR } from "@/lib/card-style";
import { openInvitationRoute } from "@/lib/constants";
import { datePart, shortDay, shortTime, shortWhen } from "@/lib/short-dates";
import { LANDSCAPE, LandscapeCard, PORTRAIT, PortraitCard, type CardArtData } from "./card-art";
import { cardFonts } from "./card-fonts";
import { fetchPublicOpenInvitation } from "./open-invitation.queries";

export type CardFormat = "portrait" | "landscape";

/** Reads an image into a data URL, or null when it cannot be read: a broken link never breaks the card. */
async function inline(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "image/jpeg";
    if (!type.startsWith("image/")) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * The card of the open invitation [code] as a PNG (JIKU-194), in the style the
 * organizer picked; null for an unknown code.
 */
export async function renderCard(
  code: string,
  format: CardFormat,
  locale: (typeof routing.locales)[number],
): Promise<ImageResponse | null> {
  const invitation = await fetchPublicOpenInvitation(code);
  if (!invitation) return null;
  const [t, tShare, photo, logo] = await Promise.all([
    getTranslations({ locale, namespace: "guest.openInvitation" }),
    getTranslations({ locale, namespace: "events.openInvitation.share" }),
    inline(invitation.bannerUrl),
    inline(invitation.logoUrl),
  ]);
  const style = cardStyleOf(invitation.cardStyle);
  const zone = invitation.eventTimezone;
  const start = invitation.eventStart;
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const data: CardArtData = {
    style,
    color: invitation.primaryColor ?? FALLBACK_BRAND_COLOR,
    eventName: invitation.eventName,
    organizerName: invitation.organizerName,
    logo,
    photo,
    day: start ? datePart(start, zone, locale, { day: "numeric" }) : null,
    month: start ? datePart(start, zone, locale, { month: "short" }) : null,
    weekdayTime: start ? `${datePart(start, zone, locale, { weekday: "short" })} · ${shortTime(start, zone, locale)}` : null,
    when: start ? shortWhen(start, zone, locale) : null,
    location: invitation.eventLocation ?? null,
    answerBy:
      invitation.closesAt && invitation.accepting
        ? tShare("cardAnswerBy", {
            date: `${shortDay(invitation.closesAt, zone, locale, { weekday: false })} · ${shortTime(invitation.closesAt, zone, locale)}`,
          })
        : null,
    url: `${siteUrl()}${prefix}${openInvitationRoute(invitation.code)}`,
    labels: {
      invites: t("invitedBy", { organizer: invitation.organizerName }),
      scan: tShare("cardAnswer"),
      via: t("via"),
    },
  };
  const size = format === "portrait" ? PORTRAIT : LANDSCAPE;
  return new ImageResponse(format === "portrait" ? <PortraitCard data={data} /> : <LandscapeCard data={data} />, {
    ...size,
    fonts: await cardFonts(style),
  });
}
