import "server-only";

import { publicFetch } from "@/lib/api-server";
import type { OperatorConsoleView } from "@/components/modules/operator/schema";

/**
 * Reads for an operator's console (JIKU-116), for Server Components only. The
 * operator's link carries a short code; it is exchanged here, server-side, for
 * the signed token the API works with, so the token never shows in the URL.
 * A revoked or unknown code resolves to null.
 */
export async function resolveOperatorCode(code: string): Promise<string | null> {
  const response = await publicFetch(`/operator-codes/${encodeURIComponent(code)}`);
  if (!response.ok) return null;
  const { token } = (await response.json()) as { token: string };
  return token;
}

export async function loadOperatorConsole(token: string): Promise<OperatorConsoleView | null> {
  const response = await publicFetch(`/operator/${encodeURIComponent(token)}`);
  if (!response.ok) return null;
  return (await response.json()) as OperatorConsoleView;
}
