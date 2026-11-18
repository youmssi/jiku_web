import "server-only";

import type { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { localeDirection, routing, type GuestLocale } from "@/i18n/routing";
import { siteUrl } from "@/components/modules/seo";
import {
  inlineCardImage,
  renderCardArt,
  type CardArtData,
  type CardFormat,
} from "@/components/modules/open-invitation/public-server";
import { DEFAULT_CARD_STYLE, FALLBACK_BRAND_COLOR } from "@/lib/card-style";
import { formatAmount } from "@/lib/currency";
import { upcomingTimes } from "@/lib/short-dates";
import { serviceCardLink } from "./service-card-link";
import { loadAppointment } from "./appointment.service";

/**
 * A service's card as a PNG (JIKU-189), drawn by the open invitation's card
 * engine: the organization, the service, its indicative price and length, where
 * it takes place, and a QR code to its booking page tagged `src=card`. Null for
 * an unknown code.
 */
export async function renderServiceCard(code: string, format: CardFormat, locale: GuestLocale): Promise<ImageResponse | null> {
  // A card in slot mode lists its next free times (JIKU-190), worked out again on every download.
  const view = await loadAppointment({ code }, undefined, true);
  if (!view) return null;
  const slotMode = view.cardMode === "SLOT";
  const [t, logo] = await Promise.all([
    getTranslations({ locale, namespace: "guest.serviceCard" }),
    inlineCardImage(view.logoUrl),
  ]);
  const organizer = view.organizerName ?? "";
  const facts = [
    view.priceMinor != null && view.currency ? formatAmount(view.priceMinor, view.currency, locale) : null,
    view.durationMinutes ? t("minutes", { count: view.durationMinutes }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const next =
    slotMode && view.upcoming && view.upcoming.length > 0
      ? t("next", { times: upcomingTimes(view.upcoming.map((slot) => slot.startsAt), view.timezone, locale) })
      : null;
  const data: CardArtData = {
    style: DEFAULT_CARD_STYLE,
    color: view.primaryColor ?? FALLBACK_BRAND_COLOR,
    eventName: view.name,
    organizerName: organizer,
    logo,
    photo: null,
    day: null,
    month: null,
    weekdayTime: null,
    when: facts || null,
    location: view.place ?? null,
    answerBy: next ?? (facts || null),
    url: serviceCardLink(`${siteUrl()}${prefix}`, code, "card", view.cardMode),
    signature: false,
    labels: { invites: t("by", { organizer }), scan: t("book"), via: t("via") },
    direction: localeDirection(locale),
  };
  // The landscape card lists `when`, the place and `answerBy` on one line: the facts once are enough there.
  return renderCardArt(format === "landscape" && !next ? { ...data, answerBy: null } : data, format);
}

/**
 * What a shared booking link shows in a WhatsApp preview (JIKU-189): the
 * service, its facts and the organization, with the card as the image. The
 * preview fetches no beacon, so it never counts as an open.
 */
export async function serviceCardMetadata(code: string, locale: GuestLocale): Promise<{ title: string; description: string; image: string } | null> {
  const view = await loadAppointment({ code });
  if (!view) return null;
  const t = await getTranslations({ locale, namespace: "guest.serviceCard" });
  const facts = [
    view.priceMinor != null && view.currency ? formatAmount(view.priceMinor, view.currency, locale) : null,
    view.durationMinutes ? t("minutes", { count: view.durationMinutes }) : null,
    view.place ?? null,
  ].filter(Boolean);
  const by = view.organizerName ? t("by", { organizer: view.organizerName }) : null;
  return {
    title: view.name,
    description: [facts.join(" · "), by].filter(Boolean).join(" — "),
    image: `${siteUrl()}/api/service-cards/${encodeURIComponent(code)}?format=landscape&lang=${locale}`,
  };
}
