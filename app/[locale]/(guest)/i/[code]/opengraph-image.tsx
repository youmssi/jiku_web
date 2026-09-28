import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { OG_CONTENT_TYPE, OG_SIZE, buildOgImage } from "@/components/modules/seo";
import { renderCard } from "@/components/modules/open-invitation/server";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Invitation";

/** The link preview WhatsApp shows when a card is posted: the card itself, in the organizer's style (JIKU-194). */
export default async function OpenInvitationImage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale: requested, code } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const image = await renderCard(code, "landscape", locale);
  return image ?? new ImageResponse(buildOgImage({ eyebrow: "Jikū", headline: "Jikū", subtitle: "", badges: [] }), size);
}
