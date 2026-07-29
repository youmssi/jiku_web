import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app areas and tokenized guest/validator/booking links
      // carry no indexable content; /register and /reserver (without a
      // trailing path) stay crawlable as conversion pages.
      disallow: [
        "/api/",
        "/login",
        "/dashboard",
        "/events",
        "/settings",
        "/invitation/",
        "/checkin/",
        "/admin/",
        "/reserver/",
        "/offline",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
