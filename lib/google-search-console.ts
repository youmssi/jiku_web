import { createSign } from "node:crypto";

/**
 * Minimal Google Search Console API client (server-only, zero dependencies —
 * never import from a Client Component: it reads unprefixed env vars and uses
 * node:crypto, both of which exist only on the server).
 *
 * Authenticates as a Google Cloud service account (two-legged OAuth: a signed
 * RS256 JWT exchanged for an access token) and exposes the two operations the
 * project needs today: sitemap submission and URL inspection. The service
 * account must be added as a full user of the Search Console property.
 *
 * Env vars (see .env.example):
 *  - GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL  service account email
 *  - GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY   PEM private key (\n-escaped allowed)
 *  - GOOGLE_SEARCH_CONSOLE_SITE_URL      property ("https://jiku.app/" or
 *                                        "sc-domain:jiku.app"); defaults to
 *                                        NEXT_PUBLIC_SITE_URL
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters";

interface ServiceAccountConfig {
  clientEmail: string;
  privateKey: string;
  siteUrl: string;
}

export function searchConsoleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL &&
      process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY,
  );
}

function requireConfig(): ServiceAccountConfig {
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );
  const siteUrl =
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL;
  if (!clientEmail || !privateKey) {
    throw new Error(
      "Google Search Console API is not configured: set GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL and GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY",
    );
  }
  if (!siteUrl) {
    throw new Error(
      "Set GOOGLE_SEARCH_CONSOLE_SITE_URL (or NEXT_PUBLIC_SITE_URL) to the Search Console property",
    );
  }
  return { clientEmail, privateKey, siteUrl };
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Exchange a signed service-account JWT for a short-lived access token. */
async function getAccessToken(config: ServiceAccountConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: config.clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = base64url(signer.sign(config.privateKey));
  const assertion = `${header}.${claims}.${signature}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Google token exchange failed (${response.status}): ${await response.text()}`,
    );
  }
  const body = (await response.json()) as { access_token: string };
  return body.access_token;
}

/**
 * Submit (or re-submit) the sitemap to Search Console so new pages are
 * discovered promptly. Call after a deploy that adds routes, e.g. from a
 * deploy hook or an admin-only route handler.
 */
export async function submitSitemap(sitemapPath = "/sitemap.xml"): Promise<void> {
  const config = requireConfig();
  const token = await getAccessToken(config);
  const feed = new URL(sitemapPath, config.siteUrl.replace(/^sc-domain:/, "https://")).href;
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.siteUrl)}/sitemaps/${encodeURIComponent(feed)}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(
      `Sitemap submission failed (${response.status}): ${await response.text()}`,
    );
  }
}

export interface UrlInspectionResult {
  verdict: string;
  coverageState?: string;
  lastCrawlTime?: string;
  googleCanonical?: string;
}

/**
 * Inspect how Google currently sees a URL of the property (index status,
 * canonical, last crawl). Useful for a lightweight SEO health check.
 */
export async function inspectUrl(url: string): Promise<UrlInspectionResult> {
  const config = requireConfig();
  const token = await getAccessToken(config);
  const response = await fetch(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inspectionUrl: url, siteUrl: config.siteUrl }),
    },
  );
  if (!response.ok) {
    throw new Error(
      `URL inspection failed (${response.status}): ${await response.text()}`,
    );
  }
  const body = (await response.json()) as {
    inspectionResult?: {
      indexStatusResult?: {
        verdict?: string;
        coverageState?: string;
        lastCrawlTime?: string;
        googleCanonical?: string;
      };
    };
  };
  const index = body.inspectionResult?.indexStatusResult;
  return {
    verdict: index?.verdict ?? "UNKNOWN",
    coverageState: index?.coverageState,
    lastCrawlTime: index?.lastCrawlTime,
    googleCanonical: index?.googleCanonical,
  };
}
