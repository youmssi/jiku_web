/**
 * Server and edge error tracking (JIKU-70). Next.js calls `register` once per
 * runtime at startup. Initialisation is skipped entirely when no DSN is
 * configured, so local development and preview builds send nothing.
 *
 * `onRequestError` reports errors thrown while rendering on the server — the ones
 * that never reach a client error boundary and would otherwise be invisible.
 */

import * as Sentry from '@sentry/nextjs';

import { isSentryConfigured, sentryOptions } from '@/lib/sentry-options';

export function register() {
    if (!isSentryConfigured()) {
        return;
    }
    Sentry.init(sentryOptions());
}

export const onRequestError = Sentry.captureRequestError;
