/**
 * Rewrites a URL before it reaches the analytics server: guest, operator and
 * booking links carry the secret that opens a ticket or a console, so those
 * segments become `:token`, record ids become `:id`, and the query string and
 * hash (password-reset and verification tokens live there) are dropped.
 *
 * Self-contained on purpose: the layout inlines its source as Umami's
 * `before-send` hook, so it must not reference anything outside itself.
 */
export function maskAnalyticsUrl(url: string): string {
  const SECRET_AFTER = ["invitation", "checkin", "line", "appointments", "r", "widget", "bookings", "operator"];
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let origin = "";
  let path = url;
  const schemeEnd = url.indexOf("://");
  if (schemeEnd !== -1) {
    const pathStart = url.indexOf("/", schemeEnd + 3);
    origin = pathStart === -1 ? url : url.slice(0, pathStart);
    path = pathStart === -1 ? "/" : url.slice(pathStart);
  }
  path = path.split("#")[0].split("?")[0];
  const segments = path.split("/");
  for (let i = 1; i < segments.length; i++) {
    if (SECRET_AFTER.indexOf(segments[i - 1]) !== -1 && segments[i] !== "") {
      segments[i] = ":token";
    } else if (UUID.test(segments[i])) {
      segments[i] = ":id";
    }
  }
  return origin + segments.join("/");
}
