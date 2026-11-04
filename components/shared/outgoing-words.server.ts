import "server-only";

import { getMessages } from "next-intl/server";
import type { GuestLocale } from "@/i18n/routing";
import type { OutgoingWords } from "./outgoing-words";

/** The outgoing words in [locale], for a client component that composes a guest message. */
export async function loadOutgoingWords(locale: GuestLocale): Promise<OutgoingWords> {
  const messages = await getMessages({ locale });
  return { locale, messages: messages.guest.outgoing };
}
