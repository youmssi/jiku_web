import type { MetadataRoute } from "next";

/**
 * Web app manifest for the installable Jikū PWA. The validator check-in screen is
 * the primary beneficiary (it must work on degraded venue networks), but the whole
 * app is installable. Served at `/manifest.webmanifest`; Next links it automatically.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jikū — Event Invitations & Ticketing",
    short_name: "Jikū",
    description:
      "White-label platform for event invitation, ticketing, RSVP, and check-in.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0F172A",
    theme_color: "#0F172A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
