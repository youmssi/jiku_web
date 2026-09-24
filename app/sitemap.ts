import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/modules/seo";
import { SEO_ROUTES } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteUrl();

  const lastModified = new Date();

  // The generic marketing pages (use-cases, simulator) are bilingual with the
  // default locale (fr) serving unprefixed — they carry explicit hreflang
  // alternates, like the landing page. /faq and /privacy render French content
  // regardless of locale segment, so they stay single entries.
  return [
    {
      url: origin,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: { fr: origin, en: `${origin}/en` },
      },
    },
    {
      url: `${origin}/en`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: { fr: origin, en: `${origin}/en` },
      },
    },
    {
      url: `${origin}${SEO_ROUTES.USE_CASES}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${origin}${SEO_ROUTES.USE_CASES}`,
          en: `${origin}/en${SEO_ROUTES.USE_CASES}`,
        },
      },
    },
    {
      url: `${origin}/en${SEO_ROUTES.USE_CASES}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${origin}${SEO_ROUTES.USE_CASES}`,
          en: `${origin}/en${SEO_ROUTES.USE_CASES}`,
        },
      },
    },
    {
      url: `${origin}${SEO_ROUTES.SIMULATOR}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${origin}${SEO_ROUTES.SIMULATOR}`,
          en: `${origin}/en${SEO_ROUTES.SIMULATOR}`,
        },
      },
    },
    {
      url: `${origin}/en${SEO_ROUTES.SIMULATOR}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${origin}${SEO_ROUTES.SIMULATOR}`,
          en: `${origin}/en${SEO_ROUTES.SIMULATOR}`,
        },
      },
    },
    {
      url: `${origin}${SEO_ROUTES.FAQ}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${origin}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
