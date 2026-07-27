import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { COOKIES, ROUTES } from "@/lib/constants";

/**
 * Composes locale resolution (next-intl) with the organizer session check.
 * Order matters: the intl middleware redirects when a locale prefix must change,
 * so every downstream redirect targets a properly-localised URL.
 *
 * Static files at the root of app/ (favicon, manifest, robots, sitemap, service
 * worker, icons) and the API surface are skipped by the matcher entirely —
 * they are locale-agnostic resources.
 */
const intlMiddleware = createIntlMiddleware(routing);

/** Routes that require an organizer session (locale-stripped prefixes). */
const GUARDED_PREFIXES = [ROUTES.DASHBOARD, ROUTES.EVENTS];

/** Strip the optional locale prefix so we can match on the canonical route. */
function stripLocale(pathname: string): string {
  for (const loc of routing.locales) {
    if (pathname === `/${loc}`) return "/";
    if (pathname.startsWith(`/${loc}/`)) return pathname.slice(loc.length + 1);
  }
  return pathname;
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // API routes never need locale rewriting or auth at this layer.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // Let next-intl decide the locale (it may redirect — return that immediately).
  const intlResponse = intlMiddleware(request);
  if (intlResponse.headers.get("location")) return intlResponse;

  const bareRoute = stripLocale(pathname);
  const isGuarded = GUARDED_PREFIXES.some(
    (p) => bareRoute === p || bareRoute.startsWith(`${p}/`),
  );
  if (!isGuarded) return intlResponse;

  const hasSession = Boolean(request.cookies.get(COOKIES.ACCESS_TOKEN)?.value);
  if (!hasSession) {
    // Send unauthenticated visitors to login, preserving the locale they were
    // on and the page they were trying to reach.
    const url = request.nextUrl.clone();
    const locale =
      intlResponse.headers.get("x-middleware-request-x-next-intl-locale") ?? "";
    url.pathname =
      locale && locale !== routing.defaultLocale
        ? `/${locale}${ROUTES.LOGIN}`
        : ROUTES.LOGIN;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Run on everything except Next internals, static assets, and API routes.
    // The explicit icon/manifest entries stop next-intl's locale detection from
    // rewriting those static URLs to /{locale}/... which would 404.
    "/((?!api|_next/static|_next/image|favicon\\.ico|sw\\.js|icon-192\\.png|icon-512\\.png|apple-icon-180\\.png|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|opengraph-image).*)",
  ],
};
