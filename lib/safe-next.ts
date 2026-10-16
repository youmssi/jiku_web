const PROBE_ORIGIN = "https://jiku.invalid";

/**
 * Only same-origin paths may be used as a post-auth destination. Anything else
 * (absolute URLs, protocol-relative `//host`, the `/\host` form browsers read
 * the same way, or control characters) falls back, so a crafted link can never
 * bounce a fresh session to another site.
 */
export function safeNext(next: string | undefined, fallback: string): string {
  if (!next || !next.startsWith("/") || /[\\\u0000-\u001f]/.test(next)) return fallback;
  try {
    const url = new URL(next, PROBE_ORIGIN);
    return url.origin === PROBE_ORIGIN ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
