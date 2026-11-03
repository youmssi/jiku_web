// Links a card is shared with (JIKU-184, JIKU-280): WhatsApp's own "click to
// chat" and "share" addresses, and the share pages of Facebook and Telegram,
// built the same way on the card page and the organizer's tab.

/** Opens a chat with the cards [number] (digits only), with [message] ready to send. */
export function whatsappAnswerLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

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
