/**
 * Marketing funnel instrumentation (JIKU-59), backed by Umami (self-hosted,
 * cookieless). A no-op wherever the script isn't loaded (local dev, or before
 * NEXT_PUBLIC_UMAMI_SRC/NEXT_PUBLIC_UMAMI_WEBSITE_ID are configured) — callers
 * never need to guard their own calls.
 */
export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const umami = (window as typeof window & { umami?: { track: (name: string, data?: Record<string, unknown>) => void } })
    .umami;
  try {
    umami?.track(name, properties);
  } catch {
    // Analytics must never break the page a visitor is trying to use.
  }
}
