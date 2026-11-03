import "server-only";

import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/components/modules/seo";
import { fullWhen } from "@/lib/short-dates";
import { LANDSCAPE } from "./card-art";
import { cardVersion } from "./share";
import type { PublicOpenInvitation } from "./schema";

/**
 * The link preview of a shared card (JIKU-283): the landscape card image,
 * addressed with the card's version so WhatsApp and Facebook draw it again
 * after any change, and a text alternative that says what the card is.
 */
export async function cardMetadata(invitation: PublicOpenInvitation, locale: string): Promise<Metadata> {
  const language = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: language, namespace: "guest.openInvitation" });
  const when = invitation.eventStart ? fullWhen(invitation.eventStart, invitation.eventTimezone, locale) : null;
  const query = new URLSearchParams({ lang: locale, v: cardVersion(invitation) });
  const image = {
    url: `${siteUrl()}/api/cards/${encodeURIComponent(invitation.code)}?${query.toString()}`,
    ...LANDSCAPE,
    alt: when ? t("previewAlt", { event: invitation.eventName, when }) : t("previewAltNoDate", { event: invitation.eventName }),
  };
  const description = invitation.welcomeMessage ?? invitation.organizerName;
  return {
    title: `${invitation.eventName} · ${invitation.organizerName}`,
    description: invitation.welcomeMessage ?? undefined,
    robots: { index: false, follow: false },
    openGraph: { title: invitation.eventName, description, images: [image] },
    twitter: { card: "summary_large_image", title: invitation.eventName, description, images: [image] },
  };
}
