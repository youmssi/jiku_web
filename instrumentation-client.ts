/**
 * Browser-side error tracking (JIKU-70). Next.js loads this file on the client
 * before any application code. Initialisation is skipped entirely when no DSN is
 * configured, so local development and preview builds send nothing.
 */

import * as Sentry from '@sentry/nextjs';

import { isSentryConfigured, sentryOptions } from '@/lib/sentry-options';

if (isSentryConfigured()) {
    Sentry.init(sentryOptions());
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
