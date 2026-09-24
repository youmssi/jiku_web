/**
 * Marketing funnel instrumentation (JIKU-59), backed by Umami (self-hosted,
 * cookieless). A no-op wherever the script isn't loaded (local dev, or before
 * NEXT_PUBLIC_UMAMI_SRC/NEXT_PUBLIC_UMAMI_WEBSITE_ID are configured) — callers
 * never need to guard their own calls.
 */
/**
 * Every funnel milestone the product records. Steps that end on a server
 * redirect (sign-up, organization created) are read from page views instead:
 * /register → /verify-email → /onboarding → /dashboard.
 */
export type AnalyticsEvent =
  | "cta_click"
  | "whatsapp_click"
  | "email_verified"
  | "event_created"
  | "event_published"
  | "service_created"
  | "ticket_category_saved"
  | "guests_added"
  | "invitation_sent"
  | "ticket_marked_paid"
  | "rsvp_confirmed"
  | "rsvp_declined"
  | "appointment_booked"
  | "plan_found";

export function trackEvent(name: AnalyticsEvent, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const umami = (window as typeof window & { umami?: { track: (name: string, data?: Record<string, unknown>) => void } })
    .umami;
  try {
    umami?.track(name, properties);
  } catch {
    // Analytics must never break the page a visitor is trying to use.
  }
}
