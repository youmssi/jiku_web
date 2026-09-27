// Links a card is shared with (JIKU-184): WhatsApp's own "click to chat" and
// "share" addresses, built the same way on the card page and the organizer's tab.

/** Opens a chat with the cards [number] (digits only), with [message] ready to send. */
export function whatsappAnswerLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** Opens WhatsApp to pick the chats or groups [message] goes to. */
export function whatsappShareLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
