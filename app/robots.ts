import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/modules/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app areas and tokenized guest, operator, booking and
      // account links carry no indexable content; /register stays crawlable
      // as a conversion page, and public organization pages (/o/) stay open.
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
        "/r/",
        "/appointments/",
        "/widget/",
        "/invitations/",
        "/verify-email",
        "/reset-password",
        "/offline",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
