import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/register", "/invitation/", "/checkin/", "/offline"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
