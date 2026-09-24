import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app areas and tokenized guest, operator and booking
      // links carry no indexable content; /register stays crawlable as a
      // conversion page.
      disallow: [
        "/api/",
        "/login",
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
        "/offline",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
