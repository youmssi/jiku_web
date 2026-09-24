import Script from "next/script";
import { maskAnalyticsUrl } from "@/lib/analytics-privacy";

const BEFORE_SEND = "jikuAnalyticsBeforeSend";

/**
 * Loads the self-hosted, cookieless Umami script (JIKU-59) after the page is
 * interactive, so it never competes with the first render on slow mobile
 * connections. Every payload first goes through `maskAnalyticsUrl`: links that
 * carry a ticket or console secret are never recorded as they are. Renders
 * nothing until both env vars are set.
 */
export function UmamiScript() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC;
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!src || !websiteId) {
    return null;
  }
  const hook = `window.${BEFORE_SEND}=function(type,payload){var mask=${maskAnalyticsUrl.toString()};if(payload&&payload.url){payload.url=mask(payload.url);}if(payload&&payload.referrer){payload.referrer=mask(payload.referrer);}return payload;};`;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: hook }} />
      <Script
        src={src}
        data-website-id={websiteId}
        data-before-send={BEFORE_SEND}
        data-exclude-search="true"
        data-exclude-hash="true"
        data-do-not-track="true"
        strategy="afterInteractive"
      />
    </>
  );
}
