'use client';

import { useEffect } from 'react';
import { captureException } from '@/lib/error-tracking';

/**
 * Root error boundary. Next.js renders it in place of the root layout when an
 * otherwise-unhandled error is thrown while rendering, so it must supply its own
 * `<html>`/`<body>`. It reports the error to the tracking sink and offers a retry.
 * It renders outside the locale layout and its message catalogs, so its few words
 * are inline and picked from the URL's locale prefix.
 */
const COPY = {
    fr: {
        title: 'Une erreur est survenue',
        description: "Un problème inattendu s'est produit. Réessayez ; s'il persiste, prévenez-nous.",
        retry: 'Réessayer',
    },
    en: {
        title: 'Something went wrong',
        description: 'An unexpected problem occurred. Try again; if it keeps happening, let us know.',
        retry: 'Try again',
    },
} as const;

export default function GlobalError({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>) {
    useEffect(() => {
        captureException(error, { digest: error.digest ?? null, boundary: 'global' });
    }, [error]);

    const locale = typeof window !== 'undefined' && window.location.pathname.startsWith('/en') ? 'en' : 'fr';
    const copy = COPY[locale];

    return (
        <html lang={locale}>
            <body>
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        padding: '1.5rem',
                        textAlign: 'center',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{copy.title}</h1>
                    <p style={{ color: '#64748b', maxWidth: '28rem' }}>
                        {copy.description}
                    </p>
                    <button
                        type="button"
                        onClick={reset}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: '#0f172a',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {copy.retry}
                    </button>
                </div>
            </body>
        </html>
    );
}
