import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ServiceWorkerRegister } from "@/components/shared";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const dmSansHeading = DM_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiku-web.vercel.app",
  ),
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
    siteName: "Jikū",
    title: "Jikū: Event Invitations, Ticketing & Check-in Platform",
    description:
      "White-label platform for event invitation, ticketing, RSVP, and check-in. Send invitations, issue QR tickets, and check guests in online or offline.",
  },
  twitter: {
    card: "summary_large_image",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        dmSansHeading.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
