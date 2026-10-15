/**
 * The Sentry options shared by the browser, server and edge runtimes, so the DSN,
 * release and — critically — the personal-data scrubbing are defined once rather
 * than three times.
 *
 * `sendDefaultPii` is disabled explicitly rather than left to the SDK default, so a
 * future version changing that default cannot quietly start attaching request
 * headers, cookies and IP addresses.
 */

import type { Breadcrumb, BrowserOptions, ErrorEvent } from '@sentry/nextjs';

import { maskAnalyticsUrl } from '@/lib/analytics-privacy';
import { scrubPersonalData } from '@/lib/scrub-personal-data';

/**
 * The share of page loads and navigations traced for performance, from
 * NEXT_PUBLIC_ERROR_TRACKING_TRACES_SAMPLE_RATE (0 to 1). Unset or invalid means
 * no tracing, so a missing value never starts sending traces.
 */
function tracesSampleRate(): number {
    const rate = Number(process.env.NEXT_PUBLIC_ERROR_TRACKING_TRACES_SAMPLE_RATE ?? 0);
    return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : 0;
}

/** A sampled trace, as the SDK hands it to `beforeSendTransaction`. */
type TransactionEvent = Parameters<NonNullable<BrowserOptions['beforeSendTransaction']>>[0];

const URL_KEYS = ['url', 'http.url', 'from', 'to'] as const;

/** Masks the secret in every URL a breadcrumb carries (navigations, fetches). */
function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
    const data = breadcrumb.data;
    if (data) {
        for (const key of URL_KEYS) {
            if (typeof data[key] === 'string') data[key] = maskAnalyticsUrl(data[key]);
        }
    }
    if (breadcrumb.category === 'navigation' && breadcrumb.message) {
        breadcrumb.message = maskAnalyticsUrl(breadcrumb.message);
    }
    return breadcrumb;
}

/**
 * Masks the tokens of guest, operator and booking links in an event: the page
 * URL, the breadcrumbs and, for a trace, its name and each span's URL. Without
 * it a single report would hand the tracker a working invitation or check-in
 * link.
 */
function scrubUrls<T extends ErrorEvent | TransactionEvent>(event: T): T {
    if (event.request?.url) event.request.url = maskAnalyticsUrl(event.request.url);
    event.breadcrumbs = event.breadcrumbs?.map(scrubBreadcrumb);
    if (event.type === 'transaction') {
        if (event.transaction) event.transaction = maskAnalyticsUrl(event.transaction);
        event.spans?.forEach((span) => {
            if (span.description) span.description = maskAnalyticsUrl(span.description);
            for (const key of URL_KEYS) {
                const value = span.data?.[key];
                if (typeof value === 'string') span.data[key] = maskAnalyticsUrl(value);
            }
        });
    }
    return event;
}

export function sentryOptions() {
    return {
        dsn: process.env.NEXT_PUBLIC_ERROR_TRACKING_DSN,
        release: process.env.NEXT_PUBLIC_ERROR_TRACKING_RELEASE || undefined,
        environment: process.env.NEXT_PUBLIC_ERROR_TRACKING_ENVIRONMENT || 'local',
        sendDefaultPii: false,
        tracesSampleRate: tracesSampleRate(),
        beforeBreadcrumb: scrubBreadcrumb,
        beforeSendTransaction(event: TransactionEvent): TransactionEvent {
            return scrubUrls(event);
        },
        beforeSend(event: ErrorEvent): ErrorEvent {
            if (event.message) {
                event.message = scrubPersonalData(event.message);
            }
            event.exception?.values?.forEach((value) => {
                if (value.value) {
                    value.value = scrubPersonalData(value.value);
                }
            });
            return scrubUrls(event);
        },
    };
}

/** True once a DSN is configured; until then nothing is initialised or sent. */
export function isSentryConfigured(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_ERROR_TRACKING_DSN);
}
