/**
 * Project-wide constants. This is the single place where shared literals live —
 * import from here (e.g. ROUTES.LOGIN, COOKIES.ACCESS_TOKEN) rather than repeating
 * strings across the codebase. Keep it free of runtime imports (no next/headers,
 * etc.) so it is safe to import anywhere, including the edge proxy.
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  EVENTS: "/events",
  EVENTS_NEW: "/events/new",
} as const;

export function eventEditRoute(id: string): string {
  return `/events/${id}/edit`;
}

export function eventGuestsRoute(id: string): string {
  return `/events/${id}/guests`;
}

export function invitationRoute(token: string): string {
  return `/invitation/${token}`;
}

export function ticketRoute(token: string): string {
  return `/invitation/${token}/ticket`;
}

export const COOKIES = {
  ACCESS_TOKEN: "jiku_access_token",
  REFRESH_TOKEN: "jiku_refresh_token",
} as const;
