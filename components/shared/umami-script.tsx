import Script from "next/script";

/**
 * Loads the self-hosted Umami tracking script (JIKU-59) after the page is
 * interactive, so it never competes with the initial render for bandwidth on
 * the slow mobile connections this market runs on. Renders nothing until both
 * env vars are set — safe to ship before Umami itself is deployed (JIKU-60).
 */
export function UmamiScript() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!src || !websiteId) {
    return null;
  }
  return <Script src={src} data-website-id={websiteId} strategy="afterInteractive" />;
}
