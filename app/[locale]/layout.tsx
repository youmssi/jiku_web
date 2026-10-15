import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ServiceWorkerRegister, UmamiScript } from "@/components/shared";
import { SHARE_IMAGE, SiteJsonLd, siteUrl } from "@/components/modules/seo";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Only Inter is preloaded: it sets every heading and paragraph. The mono face
// shows in a few app screens and loads when one of them first needs it.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Jikū: Event Invitations, Ticketing & Check-in Platform",
    template: "%s · Jikū",
  },
  description:
    "White-label platform for event invitation, ticketing, RSVP, and check-in. Send invitations via email and WhatsApp, issue digital QR tickets, and check guests in online or offline.",
  applicationName: "Jikū",
  keywords: [
    "event management",
    "invitation platform",
    "ticketing",
    "RSVP",
    "QR code tickets",
    "check-in app",
    "offline check-in",
    "WhatsApp invitations",
    "event technology",
    "white-label event platform",
  ],
  authors: [{ name: "Jikū" }],
  creator: "Jikū",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jikū",
  },
  openGraph: {
    type: "website",
    images: [SHARE_IMAGE],
    siteName: "Jikū",
    title: "Jikū: Event Invitations, Ticketing & Check-in Platform",
    description:
      "White-label platform for event invitation, ticketing, RSVP, and check-in. Send invitations, issue QR tickets, and check guests in online or offline.",
  },
  twitter: {
    card: "summary_large_image",
    images: [SHARE_IMAGE.url],
    title: "Jikū: Event Invitations, Ticketing & Check-in Platform",
    description:
      "White-label platform for event invitation, ticketing, RSVP, and check-in.",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Ownership proofs for each search engine's webmaster console. Bing's also
  // covers Yahoo, DuckDuckGo and Ecosia, which use its index.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && {
      other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION },
    }),
  },
};

export const viewport: Viewport = {
  // The site has no dark theme, so the browser chrome stays white in every
  // OS mode instead of turning black above a white page (JIKU-236).
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Per-locale root layout. Validates the locale segment (404 for /zz/...), seeds
 * setRequestLocale so server components and metadata resolve the right strings,
 * and wraps the tree in NextIntlClientProvider for client components.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <SiteJsonLd siteUrl={siteUrl()} />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <ServiceWorkerRegister />
        <UmamiScript />
      </body>
    </html>
  );
}
