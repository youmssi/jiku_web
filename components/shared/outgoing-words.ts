import { createTranslator } from "next-intl";
import type { Messages } from "@/i18n/messages";
import type { GuestLocale } from "@/i18n/routing";

/**
 * The words of what an organizer sends to guests from the app (JIKU-293): the
 * share message, the invitation and the reminder sent from their own
 * WhatsApp. They are written in the event's guest language, which may differ
 * from the language the organizer reads the app in, so the server hands them
 * over with their locale.
 */
export interface OutgoingWords {
  locale: GuestLocale;
  messages: Messages["guest"]["outgoing"];
}

export function outgoingTranslator(words: OutgoingWords) {
  return createTranslator({ locale: words.locale, messages: { outgoing: words.messages }, namespace: "outgoing" });
}
