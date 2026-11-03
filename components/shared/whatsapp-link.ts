/**
 * WhatsApp's "click to chat" address: opens a chat with [number] (any format,
 * only the digits are kept), with [message] ready to send. Used for a card's
 * answer button (JIKU-184) and for the organizer's own sends (JIKU-281).
 */
export function whatsappChatLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
