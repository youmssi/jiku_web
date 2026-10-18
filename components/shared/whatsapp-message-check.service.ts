"use server";

import type { Schema } from "@/lib/api-contract";
import { serverFetch } from "@/lib/api-server";
import { reportApiError } from "@/lib/action-result";

/** Whether a message reads as information or as marketing, and the words that make it promotional. */
export type WhatsAppMessageVerdict = Schema<"WhatsAppMessageCheck">;

/** Longest text the check accepts, as the backend does. */
const MESSAGE_CHECK_MAX = 4096;

/** The verdict the send will give [text] (JIKU-269); null when it cannot be checked right now. */
export async function checkWhatsAppMessageAction(text: string): Promise<WhatsAppMessageVerdict | null> {
  if (typeof text !== "string" || text.trim() === "" || text.length > MESSAGE_CHECK_MAX) return null;
  const response = await serverFetch("/messaging/whatsapp/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    if (response.status >= 500) reportApiError(response);
    return null;
  }
  return (await response.json()) as WhatsAppMessageVerdict;
}
