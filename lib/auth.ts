import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth-constants";

const ACCESS_MAX_AGE = 60 * 60; // 1 hour, matching the backend access token
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, matching the backend refresh token

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Persists the backend's JWTs as httpOnly cookies. The tokens are never exposed
 * to client-side JavaScript; the BFF reads them server-side and forwards the
 * access token as a Bearer credential when calling the backend.
 */
export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  store.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  store.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}
