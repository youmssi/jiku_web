/**
 * Base URL of the backend API, used from server-side code (Server Actions, Route
 * Handlers, Server Components). Server-only, so it has no NEXT_PUBLIC_ prefix.
 */
export function apiBaseUrl(): string {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api/v1"
  );
}
