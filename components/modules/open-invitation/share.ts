// Links a card is shared with (JIKU-184, JIKU-280): WhatsApp's own "click to
// chat" and "share" addresses, and the share pages of Facebook and Telegram,
// built the same way on the card page and the organizer's tab.

import { whatsappChatLink } from "@/components/shared/whatsapp-link";

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
export const CARD_SOURCES = ["whatsapp", "facebook", "telegram", "share", "link", "qr", "relay"] as const;
export type CardSource = (typeof CARD_SOURCES)[number];

/**
 * [url] tagged with the network it leaves through, so its visits and answers count
 * there, and with the card's [version], so a changed card gets a fresh preview.
 */
export function taggedLink(url: string, source: CardSource, version?: string): string {
  const query = new URLSearchParams({ via: source, ...(version ? { v: version } : {}) });
  return `${url}${url.includes("?") ? "&" : "?"}${query.toString()}`;
}

/** The network a card page was opened from, when its `via` is one we tag; anything else is left out. */
export function cardSourceOf(value: string | string[] | undefined): CardSource | undefined {
  return CARD_SOURCES.find((source) => source === value);
}

/** What a card's preview is drawn from (JIKU-283); any change makes a new version. */
interface CardLookFields {
  eventName: string;
  organizerName: string;
  eventStart?: string | null;
  eventLocation?: string | null;
  cardStyle?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
  logoUrl?: string | null;
  closesAt?: string | null;
}

/**
 * A short fingerprint of how the card looks (JIKU-283). Links and the preview
 * image carry it, so after a change WhatsApp and Facebook draw the new preview
 * instead of the one they cached.
 */
export function cardVersion(card: CardLookFields): string {
  const text = [
    card.eventName,
    card.organizerName,
    card.eventStart,
    card.eventLocation,
    card.cardStyle,
    card.bannerUrl,
    card.primaryColor,
    card.logoUrl,
    card.closesAt,
  ].join("|");
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193) >>> 0;
  }
  return hash.toString(36);
}
