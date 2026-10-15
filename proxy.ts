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
const GUARDED_PREFIXES = [
  ROUTES.DASHBOARD,
  ROUTES.EVENTS,
  ROUTES.SERVICES,
  ROUTES.BILLING,
  ROUTES.SETTINGS,
  ROUTES.OPERATORS,
  ROUTES.ONBOARDING,
];

/** Strip the optional locale prefix so we can match on the canonical route. */
function stripLocale(pathname: string): string {
  for (const loc of routing.locales) {
    if (pathname === `/${loc}`) return "/";
    if (pathname.startsWith(`/${loc}/`)) return pathname.slice(loc.length + 1);
  }
  return pathname;
}

/**
 * Only a page load may move the locale cookie. The router's own fetches
 * (prefetches and soft navigations) carry `Sec-Fetch-Dest: empty`: right after a
 * switch to French, the router still prefetches the /en links of the page it is
 * leaving, and if next-intl synced the cookie on those responses it would flip
 * back to "en" and the next visit to "/" would redirect to /en. A click on a
 * language link writes the cookie in the browser itself, so nothing is lost.
 * Next strips its internal prefetch headers before the proxy runs, which is why
 * the fetch destination is the signal.
 */
function isRouterFetch(request: NextRequest): boolean {
  const destination = request.headers.get("sec-fetch-dest");
  return destination !== null && destination !== "document";
}

/**
 * Drops the locale cookie next-intl attaches to a router fetch. Deleting the
 * header is not enough, because Next re-serialises the response's cookie jar,
 * so the response is rebuilt from its headers without the cookie.
 */
function withoutRouterFetchCookie(request: NextRequest, response: NextResponse): NextResponse {
  if (!isRouterFetch(request) || !response.headers.has("set-cookie")) return response;
  const headers = new Headers(response.headers);
  headers.delete("set-cookie");
  return new NextResponse(null, { status: response.status, headers });
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // API routes never need locale rewriting or auth at this layer.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // Let next-intl decide the locale (it may redirect — return that immediately).
  const intlResponse = withoutRouterFetchCookie(request, intlMiddleware(request));
  if (intlResponse.headers.get("location")) return intlResponse;

  const bareRoute = stripLocale(pathname);

  // A payment provider may send the payer back with a cross-site form POST,
  // which carries no SameSite=Lax session cookie. Answer it with a 303 to the
  // same URL: the browser follows it as a top-level GET, cookie included.
  if (request.method === "POST" && bareRoute === ROUTES.BILLING_RETURN) {
    return NextResponse.redirect(request.nextUrl, 303);
  }

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
    // rewriting those static URLs to /{locale}/... which would 404. `landing/`
    // holds the landing page's images.
    "/((?!api|_next/static|_next/image|landing/|favicon\\.ico|sw\\.js|icon-192\\.png|icon-512\\.png|icon-maskable-512\\.png|apple-icon-180\\.png|jiku-logo-mark\\.png|jiku-logo-1024\\.png|robots\\.txt|llms\\.txt|indexnow-key\\.txt|sitemap\\.xml|manifest\\.webmanifest|opengraph-image).*)",
  ],
};
