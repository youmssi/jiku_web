import { hasLocale } from "next-intl";
import { guestRouting } from "@/i18n/routing";
import { renderCard } from "@/components/modules/open-invitation/public-server";

/**
 * The card of an open invitation as a PNG (JIKU-194, JIKU-283). `format=portrait`
 * is the card people post (1080 × 1350), `format=status` the one for a status
 * (1080 × 1920); the default is the landscape card, the link preview and the
 * image at the top of the WhatsApp card message. Cached briefly: the organizer tab adds
 * a version to see a new style or photo at once.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const search = new URL(request.url).searchParams;
  const requested = search.get("lang") ?? guestRouting.defaultLocale;
  const locale = hasLocale(guestRouting.locales, requested) ? requested : guestRouting.defaultLocale;
  const requestedFormat = search.get("format");
  const format = requestedFormat === "portrait" || requestedFormat === "status" ? requestedFormat : "landscape";
  const image = await renderCard(code, format, locale);
  if (!image) return new Response(null, { status: 404 });
  image.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
  return image;
}
