import "server-only";

import { serverFetch } from "@/lib/api-server";

/**
 * Whether the platform sends SMS at all (JIKU-261). Screens offer an SMS
 * option, or say "or by SMS", only when it does; an unreadable answer counts
 * as no, so a screen never promises an SMS that will not go out.
 */
export async function loadSmsAvailable(): Promise<boolean> {
  const response = await serverFetch("/messaging/channels");
  if (!response.ok) return false;
  const body = (await response.json()) as { sms?: boolean };
  return body.sms === true;
}
