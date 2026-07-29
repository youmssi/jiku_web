import type { MetadataRoute } from "next";
import { SEO_ROUTES } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app";

  // The JIKU-63 thematic pages target French/Conakry-market search queries and
  // render identical content regardless of locale segment (same choice already
  // made for /privacy) — no separate English alternate, unlike the landing page.
  const thematicPages = Object.values(SEO_ROUTES).map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: { fr: siteUrl, en: `${siteUrl}/en` },
      },
    },
    {
      url: `${siteUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: { fr: siteUrl, en: `${siteUrl}/en` },
      },
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...thematicPages,
  ];
}
