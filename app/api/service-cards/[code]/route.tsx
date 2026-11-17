import { hasLocale } from "next-intl";
import { guestRouting } from "@/i18n/routing";
import { renderServiceCard } from "@/components/modules/appointment/server";

/**
 * A service's card as a PNG (JIKU-189): `format=portrait` to post (1080 × 1350),
 * `format=status` for a status (1080 × 1920), landscape by default for the link
 * preview. Cached briefly, so a new price or place shows within minutes.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[A-Za-z0-9]{4,16}$/.test(code)) return new Response(null, { status: 404 });
  const search = new URL(request.url).searchParams;
  const requested = search.get("lang") ?? guestRouting.defaultLocale;
  const locale = hasLocale(guestRouting.locales, requested) ? requested : guestRouting.defaultLocale;
  const requestedFormat = search.get("format");
  const format = requestedFormat === "portrait" || requestedFormat === "status" ? requestedFormat : "landscape";
  const image = await renderServiceCard(code, format, locale);
  if (!image) return new Response(null, { status: 404 });
  image.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
  return image;
}
