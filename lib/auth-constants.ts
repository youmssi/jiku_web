// Cookie names shared between the middleware (edge runtime) and server-side auth
// helpers. Kept free of `next/headers` so the middleware can import it safely.
export const ACCESS_COOKIE = "jiku_access_token";
export const REFRESH_COOKIE = "jiku_refresh_token";
