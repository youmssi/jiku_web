/**
 * The Sentry options shared by the browser, server and edge runtimes, so the DSN,
 * release and — critically — the personal-data scrubbing are defined once rather
 * than three times.
 *
 * `sendDefaultPii` is disabled explicitly rather than left to the SDK default, so a
 * future version changing that default cannot quietly start attaching request
 * headers, cookies and IP addresses.
 */

import type { ErrorEvent } from '@sentry/nextjs';

import { scrubPersonalData } from '@/lib/scrub-personal-data';

export function sentryOptions() {
    return {
        dsn: process.env.NEXT_PUBLIC_ERROR_TRACKING_DSN,
        release: process.env.NEXT_PUBLIC_ERROR_TRACKING_RELEASE || undefined,
        environment: process.env.NEXT_PUBLIC_ERROR_TRACKING_ENVIRONMENT || 'local',
        sendDefaultPii: false,
        beforeSend(event: ErrorEvent): ErrorEvent {
            if (event.message) {
                event.message = scrubPersonalData(event.message);
            }
            event.exception?.values?.forEach((value) => {
                if (value.value) {
                    value.value = scrubPersonalData(value.value);
                }
            });
            return event;
        },
    };
}

/** True once a DSN is configured; until then nothing is initialised or sent. */
export function isSentryConfigured(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_ERROR_TRACKING_DSN);
}
