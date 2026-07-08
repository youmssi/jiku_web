/**
 * Provider-agnostic error capture for the frontend. Application code and the
 * global error boundary report through {@link captureException}; the concrete
 * destination (an error-tracking SaaS such as Sentry) is wired in here later,
 * without touching any call site. Until a provider is chosen, captured errors are
 * logged to the console so they stay visible rather than being silently dropped.
 *
 * The DSN is read from NEXT_PUBLIC_ERROR_TRACKING_DSN — public because capture
 * also runs in the browser.
 */

export type ErrorContext = Record<string, string | number | boolean | null | undefined>;

const dsn = process.env.NEXT_PUBLIC_ERROR_TRACKING_DSN;

export function isErrorTrackingEnabled(): boolean {
    return Boolean(dsn);
}

export function captureException(error: unknown, context?: ErrorContext): void {
    // Drop-in point for a real provider once chosen, e.g.:
    //   if (dsn) Sentry.captureException(error, { extra: context });
    // Kept as a single choke point so call sites never change when it is wired in.
    const prefix = dsn ? '[error-tracking] captured' : '[error-tracking] (no DSN configured)';
    console.error(prefix, error, context ?? {});
}
