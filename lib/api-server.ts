import { headers as requestHeaders } from "next/headers";
import { apiBaseUrl } from "@/lib/api";
import { getAccessToken, getAdminAccessToken } from "@/lib/auth";
import { assertApiPath } from "./api-path";

/**
 * Abort a backend call that hangs, so a slow upstream can't stall a render.
 * Configurable per deployment: a cold or overloaded backend may need more than
 * the default headroom.
 */
const TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS ?? 15_000);
/** Propagated so a frontend error can be traced to the backend's request log. */
const CORRELATION_HEADER = "X-Correlation-Id";
/**
 * The API's rate limits key on the client's IP, and every call from here comes
 * from this server. With the shared secret set, each call names the visitor's
 * IP so they keep their own budget; the API ignores the name without it.
 */
const CLIENT_IP_HEADER = "X-Jiku-Client-Ip";
const CLIENT_IP_SECRET_HEADER = "X-Jiku-Client-Ip-Secret";
/** Idempotent GETs are retried once on a transient failure (network / 5xx). */
const GET_ATTEMPTS = 2;

/** True when the error is our own deadline abort (as opposed to a caller-supplied signal). */
function isTimeoutError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "TimeoutError";
}

/** A hung backend reads as an HTTP failure so every caller's existing error path applies. */
function gatewayTimeoutResponse(): Response {
  return new Response(
    JSON.stringify({ detail: "The service took too long to respond. Please try again." }),
    { status: 504, headers: { "Content-Type": "application/json" } },
  );
}

/**
 * The visitor's IP as the hosting edge reports it (Vercel and the reverse
 * proxy both set `x-forwarded-for`, first entry first), or null outside a
 * request, such as during a build.
 */
async function visitorIp(): Promise<string | null> {
  try {
    const incoming = await requestHeaders();
    const forwarded = incoming.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || incoming.get("x-real-ip");
  } catch {
    return null;
  }
}

/**
 * Single server-side entry point to the backend. Adds a per-request correlation id,
 * a timeout, and one retry for idempotent GETs — behaviour every caller should get
 * for free. `serverFetch` layers the bearer token on top; `publicFetch` does not.
 */
async function request(path: string, init: RequestInit, authHeaders?: Headers): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  authHeaders?.forEach((value, key) => headers.set(key, value));
  if (!headers.has(CORRELATION_HEADER)) {
    headers.set(CORRELATION_HEADER, crypto.randomUUID());
  }
  const secret = process.env.API_CLIENT_IP_SECRET;
  const ip = secret ? await visitorIp() : null;
  if (secret && ip) {
    headers.set(CLIENT_IP_HEADER, ip);
    headers.set(CLIENT_IP_SECRET_HEADER, secret);
  }
  const url = `${apiBaseUrl()}${assertApiPath(path)}`;
  const attempts = method === "GET" && !init.signal ? GET_ATTEMPTS : 1;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        headers,
        cache: "no-store",
        signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS),
      });
      if (response.status >= 500 && attempt < attempts) {
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt >= attempts) {
        // A timeout we imposed (not a caller's own abort) becomes a 504 instead
        // of an exception, so forms and pages fail gracefully rather than crash.
        if (!init.signal && isTimeoutError(error)) {
          return gatewayTimeoutResponse();
        }
        throw error;
      }
    }
  }
  throw lastError;
}

/**
 * Server-side fetch that attaches the organizer's access token from the httpOnly
 * cookie as a Bearer credential. For Server Components and Server Actions only.
 */
export async function serverFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const authHeaders = new Headers();
  const token = await getAccessToken();
  if (token) {
    authHeaders.set("Authorization", `Bearer ${token}`);
  }
  return request(path, init, authHeaders);
}

/**
 * Server-side fetch to a public backend endpoint (no authentication): guest RSVP,
 * validator check-in and the auth endpoints.
 */
export function publicFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return request(path, init);
}

/**
 * Server-side fetch attaching the platform-admin token (JIKU-46). Kept apart from
 * `serverFetch` so an admin call can never silently fall back to an organizer
 * session or vice versa.
 */
export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const authHeaders = new Headers();
  const token = await getAdminAccessToken();
  if (token) {
    authHeaders.set("Authorization", `Bearer ${token}`);
  }
  return request(path, init, authHeaders);
}
