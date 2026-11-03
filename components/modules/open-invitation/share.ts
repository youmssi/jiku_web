// Links a card is shared with (JIKU-184, JIKU-280): WhatsApp's own "click to
// chat" and "share" addresses, and the share pages of Facebook and Telegram,
// built the same way on the card page and the organizer's tab.

import { whatsappChatLink } from "@/components/shared";

/** Opens a chat with the cards [number], with [message] ready to send. */
export const whatsappAnswerLink = whatsappChatLink;

/** Opens WhatsApp to pick the chats or groups [message] goes to. */
export function whatsappShareLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** Opens Facebook's share dialog; Facebook draws the card from the page's preview and ignores any ready text. */
export function facebookShareLink(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/** Opens Telegram to pick the chats [url] and [text] go to. */
export function telegramShareLink(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/** The networks a card's link can leave through (JIKU-282); each link carries its own in `?via=`. */
export const CARD_SOURCES = ["whatsapp", "facebook", "telegram", "share", "link", "qr"] as const;
export type CardSource = (typeof CARD_SOURCES)[number];

/** [url] tagged with the network it leaves through, so its visits and answers count there. */
export function taggedLink(url: string, source: CardSource): string {
  return `${url}${url.includes("?") ? "&" : "?"}via=${source}`;
}

/** The network a card page was opened from, when its `via` is one we tag; anything else is left out. */
export function cardSourceOf(value: string | string[] | undefined): CardSource | undefined {
  return CARD_SOURCES.find((source) => source === value);
}
