/**
 * Central sink for frontend errors. Every uncaught render error (via the route
 * and global error boundaries) and any explicitly-caught client failure funnels
 * through here, so error reporting has a single, provider-agnostic integration
 * point. Set NEXT_PUBLIC_ERROR_BEACON_URL to forward reports to a collector
 * (e.g. the backend or a third-party service) — until then they are logged.
 */

export interface ErrorContext {
  /** Next.js error digest, when the error came from an error boundary. */
  digest?: string;
  /** Where the error was caught (boundary name, action, component…). */
  source?: string;
  [key: string]: unknown;
}

export function reportError(error: unknown, context: ErrorContext = {}): void {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
    at: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : undefined,
  };

  // Always surfaced in logs (browser console client-side, server output otherwise).
  console.error("[jiku] frontend error", payload);

  const beacon = process.env.NEXT_PUBLIC_ERROR_BEACON_URL;
  if (beacon && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      navigator.sendBeacon(beacon, JSON.stringify(payload));
    } catch {
      // Error reporting must never throw.
    }
  }
}
