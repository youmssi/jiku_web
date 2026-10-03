import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/modules/seo";
import { routing } from "@/i18n/routing";

/**
 * Paths kept out of crawling, in every locale: unprefixed (fr) and under /en.
 * Authenticated areas and tokenized guest, operator, booking and account links
 * carry no indexable content; /register stays crawlable as a conversion page,
 * and public organization pages (/o/) stay open.
 */
const PRIVATE_PATHS = [
  "/login",
  "/forgot-password",
  "/dashboard",
  "/events",
  "/services",
  "/billing",
  "/settings",
  "/onboarding",
  "/invitation/",
  "/checkin/",
  "/admin/",
  "/line/",
  "/r/",
  "/appointments/",
  "/widget/",
  "/invitations/",
  "/verify-email",
  "/reset-password",
  "/offline",
];

export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl();
  const localized = routing.locales.filter((locale) => locale !== routing.defaultLocale);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app areas and tokenized guest, operator, booking and
      // account links carry no indexable content; /register stays crawlable
      // as a conversion page, and public organization pages (/o/) stay open.
      disallow: [
        "/api/",
        ...PRIVATE_PATHS,
        ...localized.flatMap((locale) => PRIVATE_PATHS.map((path) => `/${locale}${path}`)),
        // Open invitation cards (/i/) stay reachable: WhatsApp builds a card's
        // link preview from that page. Their noindex tag keeps them out of search.
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
