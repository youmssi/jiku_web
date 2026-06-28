import { apiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

/**
 * Server-side fetch to the backend that attaches the organizer's access token
 * from the httpOnly cookie as a Bearer credential. For use in Server Components
 * and Server Actions only.
 */
export async function serverFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${apiBaseUrl()}${path}`, { ...init, headers, cache: "no-store" });
}
