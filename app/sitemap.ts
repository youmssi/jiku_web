import type { MetadataRoute } from "next";
import { SEO_ROUTES } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app";

  const lastModified = new Date();

  // The generic marketing pages (use-cases, simulator) are bilingual with the
  // default locale (fr) serving unprefixed — they carry explicit hreflang
  // alternates, like the landing page. /faq and /privacy render French content
  // regardless of locale segment, so they stay single entries.
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: { fr: siteUrl, en: `${siteUrl}/en` },
      },
    },
    {
      url: `${siteUrl}/en`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: { fr: siteUrl, en: `${siteUrl}/en` },
      },
    },
    {
      url: `${siteUrl}${SEO_ROUTES.USE_CASES}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${siteUrl}${SEO_ROUTES.USE_CASES}`,
          en: `${siteUrl}/en${SEO_ROUTES.USE_CASES}`,
        },
      },
    },
    {
      url: `${siteUrl}/en${SEO_ROUTES.USE_CASES}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${siteUrl}${SEO_ROUTES.USE_CASES}`,
          en: `${siteUrl}/en${SEO_ROUTES.USE_CASES}`,
        },
      },
    },
    {
      url: `${siteUrl}${SEO_ROUTES.SIMULATOR}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${siteUrl}${SEO_ROUTES.SIMULATOR}`,
          en: `${siteUrl}/en${SEO_ROUTES.SIMULATOR}`,
        },
      },
    },
    {
      url: `${siteUrl}/en${SEO_ROUTES.SIMULATOR}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${siteUrl}${SEO_ROUTES.SIMULATOR}`,
          en: `${siteUrl}/en${SEO_ROUTES.SIMULATOR}`,
        },
      },
    },
    {
      url: `${siteUrl}${SEO_ROUTES.FAQ}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
