import type { Metadata } from "next";
import { LANDING_CONTENT, LandingPage } from "@/components/modules/landing";

const content = LANDING_CONTENT.fr;

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  keywords: content.meta.keywords,
  alternates: {
    canonical: "/",
    languages: { fr: "/", en: "/en" },
  },
  openGraph: {
    type: "website",
    siteName: "Jikū",
    locale: "fr",
    title: content.meta.title,
    description: content.meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: content.meta.title,
    description: content.meta.description,
  },
};

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app";
  return <LandingPage locale="fr" siteUrl={siteUrl} />;
}
