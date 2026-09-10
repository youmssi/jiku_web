import { apiBaseUrl } from "@/lib/api";
import { getAccessToken, getAdminAccessToken } from "@/lib/auth";

/**
 * Abort a backend call that hangs, so a slow upstream can't stall a render.
 * Configurable per deployment: a cold or overloaded backend may need more than
 * the default headroom.
 */
const TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS ?? 15_000);
/** Propagated so a frontend error can be traced to the backend's request log. */
const CORRELATION_HEADER = "X-Correlation-Id";
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
  const url = `${apiBaseUrl()}${path}`;
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
