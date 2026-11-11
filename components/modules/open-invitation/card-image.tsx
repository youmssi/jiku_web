import "server-only";

import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { localeDirection, routing, type GuestLocale } from "@/i18n/routing";
import { siteUrl } from "@/components/modules/seo";
import { cardStyleOf, FALLBACK_BRAND_COLOR } from "@/lib/card-style";
import { openInvitationRoute } from "@/lib/constants";
import { datePart, shortDay, shortTime, shortWhen } from "@/lib/short-dates";
import { taggedLink } from "./share";
import { LANDSCAPE, LandscapeCard, PORTRAIT, PortraitCard, STATUS, StatusCard, type CardArtData } from "./card-art";
import { cardFonts } from "./card-fonts";
import { hasArabic } from "./card-text";
import { fetchPublicOpenInvitation } from "./open-invitation.queries";

export type CardFormat = "portrait" | "status" | "landscape";

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
  locale: GuestLocale,
): Promise<ImageResponse | null> {
  const invitation = await fetchPublicOpenInvitation(code);
  if (!invitation) return null;
  const [t, tShare, photo, logo] = await Promise.all([
    getTranslations({ locale, namespace: "guest.openInvitation" }),
    getTranslations({ locale, namespace: "guest.outgoing" }),
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
        ? tShare("answerBy", {
            date: `${shortDay(invitation.closesAt, zone, locale, { weekday: false })} · ${shortTime(invitation.closesAt, zone, locale)}`,
          })
        : null,
    signature: invitation.jikuSignature,
    url: taggedLink(`${siteUrl()}${prefix}${openInvitationRoute(invitation.code)}`, "qr"),
    labels: {
      invites: t("invitedBy", { organizer: invitation.organizerName }),
      scan: tShare("scan"),
      via: t("via"),
    },
    direction: localeDirection(locale),
  };
  const size = format === "portrait" ? PORTRAIT : format === "status" ? STATUS : LANDSCAPE;
  const art =
    format === "portrait" ? <PortraitCard data={data} /> : format === "status" ? <StatusCard data={data} /> : <LandscapeCard data={data} />;
  return new ImageResponse(art, {
    ...size,
    // The Arabic face loads only for a card with Arabic on it, in its words or in what the organizer wrote.
    fonts: await cardFonts(style, Object.values(data.labels).concat(data.eventName, data.organizerName, data.location ?? "").some(hasArabic)),
  });
}
