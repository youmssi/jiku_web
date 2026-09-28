import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { renderCard } from "@/components/modules/open-invitation/server";

/**
 * The card of an open invitation as a PNG (JIKU-194). `format=portrait` is the
 * card people post (1080 × 1350); the default is the landscape card, shown at
 * the top of the WhatsApp card message. Cached briefly: the organizer tab adds
 * a version to see a new style or photo at once.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const search = new URL(request.url).searchParams;
  const requested = search.get("lang") ?? routing.defaultLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const image = await renderCard(code, search.get("format") === "portrait" ? "portrait" : "landscape", locale);
  if (!image) return new Response(null, { status: 404 });
  image.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
  return image;
}
