import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

// Private, tokenized or session-gated routes (JIKU-58): guest lists and other
// personal data must never be indexed. `generateMetadata`'s `robots: noindex`
// on each of these pages is the primary defense; this header is defense in
// depth in case a page ever omits it. `:locale(en)?` matches both the
// unprefixed default locale and the `/en` prefix (i18n/routing.ts).
const NOINDEX_HEADERS = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
const noindexRoute = (path: string) => ({
  source: `/:locale(en)?${path}`,
  headers: NOINDEX_HEADERS,
});

const nextConfig: NextConfig = {
  // Emit a self-contained server (.next/standalone) so the production container
  // ships only the compiled app and its runtime dependencies, not node_modules.
  // Vercel ignores this setting; it only affects self-hosted/container builds.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // The service worker must never be cached, so shell updates ship promptly.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      noindexRoute("/invitation/:path*"),
      noindexRoute("/checkin/:path*"),
      noindexRoute("/admin/:path*"),
      noindexRoute("/reserver/:id/paiement"),
      noindexRoute("/reserver/:id/statut"),
    ];
  },
};

// i18n foundation (mirrors Tûm): locale segment in the URL for non-default
// locales, message catalogs under messages/, request config in i18n/request.ts.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Error tracking (JIKU-70). The wrapper only adds build-time instrumentation and
// source-map handling; nothing is reported at runtime unless a DSN is set. Source
// maps are uploaded only when SENTRY_AUTH_TOKEN is present, so an ordinary build
// — local, CI or preview — neither needs credentials nor contacts the provider.
// `disableLogger` is deliberately absent: it is deprecated, and its replacement
// (`webpack.treeshake.removeDebugLogging`) does not apply to this project, which
// builds with Turbopack. The cost is that the SDK's debug logging is not tree
// shaken out of the client bundle — worth revisiting only if that shows up in a
// bundle measurement.
export default withSentryConfig(withNextIntl(nextConfig), {
  silent: !process.env.CI,
  telemetry: false,
});
