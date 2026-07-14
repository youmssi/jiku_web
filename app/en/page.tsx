import type { Metadata } from "next";
import { LANDING_CONTENT, LandingPage } from "@/components/modules/landing";

const content = LANDING_CONTENT.en;

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  keywords: content.meta.keywords,
  alternates: {
    canonical: "/en",
    languages: { fr: "/", en: "/en" },
  },
  openGraph: {
    type: "website",
    siteName: "Jikū",
    locale: "en",
    title: content.meta.title,
    description: content.meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: content.meta.title,
    description: content.meta.description,
  },
};

export default function EnglishHomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app";
  return <LandingPage locale="en" siteUrl={siteUrl} />;
}
