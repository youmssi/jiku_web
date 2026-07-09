import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app areas and tokenized guest/validator links carry no
      // indexable content; /register stays crawlable as a conversion page.
      disallow: [
        "/api/",
        "/login",
        "/dashboard",
        "/events",
        "/invitation/",
        "/checkin/",
        "/offline",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
