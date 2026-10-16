/** A `.` or `..` segment, literal or percent-encoded, before any query or fragment. */
const DOT_SEGMENT = /(^|\/)(\.|%2e){1,2}(\/|$)/i;

/**
 * Refuses an API path that would climb out of the route it names. Paths are
 * built from route params and action arguments, which a caller controls, and
 * URL parsing resolves `..` (and `%2e%2e`) before the request leaves: an id of
 * `../members` would otherwise reach another endpoint with the visitor's token.
 */
export function assertApiPath(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0] ?? "";
  if (!pathname.startsWith("/") || DOT_SEGMENT.test(pathname)) {
    throw new Error(`Refused API path ${JSON.stringify(path)}: it must stay within the route it names`);
  }
  return path;
}
