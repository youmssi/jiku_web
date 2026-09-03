/**
 * The single sink for frontend errors. Every uncaught render error (the route and
 * global error boundaries) and every non-OK backend response funnels through
 * {@link captureException}, so reporting has one provider-agnostic integration
 * point and call sites never change when the provider does.
 *
 * Two things make a report joinable to its backend counterpart:
 *  - `release`, which must match the backend's `ERROR_TRACKING_RELEASE` for the
 *    same deployment, and
 *  - `requestId`, the `X-Request-Id` the backend echoes on every response. Errors
 *    that originate from an API call carry it; a pure render error has no backend
 *    request to join to and legitimately has none.
 *
 * Everything is scrubbed of personal data first — see `scrub-personal-data.ts`.
 */

import * as Sentry from '@sentry/nextjs';

import { scrubPersonalData } from '@/lib/scrub-personal-data';

export interface ErrorContext {
    /** Next.js error digest, when the error came from an error boundary. */
    digest?: string | null;
    /** Where the error was caught (boundary name, action, component…). */
    source?: string;
    /** Backend correlation id, when the error originated from an API response. */
    requestId?: string;
    [key: string]: unknown;
}

const dsn = process.env.NEXT_PUBLIC_ERROR_TRACKING_DSN;
const release = process.env.NEXT_PUBLIC_ERROR_TRACKING_RELEASE;
const beacon = process.env.NEXT_PUBLIC_ERROR_BEACON_URL;

export function isErrorTrackingEnabled(): boolean {
    return Boolean(dsn);
}

/**
 * Scrubs every string in the context. Non-string values are structural (status
 * codes, flags) and pass through; `requestId` is an opaque identifier and is the
 * join key, so it is exempt.
 */
function scrubContext(context: ErrorContext): ErrorContext {
    const scrubbed: ErrorContext = {};
    for (const [key, value] of Object.entries(context)) {
        scrubbed[key] =
            typeof value === 'string' && key !== 'requestId' ? scrubPersonalData(value) : value;
    }
    return scrubbed;
}

export function captureException(error: unknown, context: ErrorContext = {}): void {
    const payload = {
        message: scrubPersonalData(error instanceof Error ? error.message : String(error)),
        stack: error instanceof Error && error.stack ? scrubPersonalData(error.stack) : undefined,
        ...scrubContext(context),
        release,
        at: new Date().toISOString(),
        url: typeof window !== 'undefined' ? scrubPersonalData(window.location.href) : undefined,
    };

    // Always surfaced in logs (browser console client-side, server output otherwise),
    // so an error stays visible even with no provider configured.
    console.error('[jiku] frontend error', payload);

    if (dsn) {
        // The context is already scrubbed; the SDK's own beforeSend (sentry-options.ts)
        // scrubs the message and exception values it derives from the error itself.
        Sentry.captureException(error, { extra: payload });
    }

    if (beacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        try {
            navigator.sendBeacon(beacon, JSON.stringify(payload));
        } catch {
            // Reporting must never throw.
        }
    }
}
