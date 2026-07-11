/**
 * Support contact configuration (JIKU-27B). Destinations are read from public env
 * vars so each deployment points them at its own monitored mailbox / WhatsApp
 * line. The email has a sensible default; WhatsApp is optional and hidden when
 * unset.
 */
export function supportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@jiku.app";
}

export function supportWhatsApp(): string | null {
  const value = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.trim();
  return value ? value.replace(/[^0-9]/g, "") : null;
}

export function supportMailto(): string {
  const subject = encodeURIComponent("Jikū support request");
  return `mailto:${supportEmail()}?subject=${subject}`;
}

export function supportWhatsAppLink(): string | null {
  const number = supportWhatsApp();
  return number ? `https://wa.me/${number}` : null;
}

/**
 * Sales contact for enterprise / on-premise inquiries (JIKU-44). Falls back to
 * the support mailbox so the CTA never points at an unmonitored address.
 */
export function salesEmail(): string {
  return process.env.NEXT_PUBLIC_SALES_EMAIL ?? supportEmail();
}

export function salesMailto(subject: string): string {
  return `mailto:${salesEmail()}?subject=${encodeURIComponent(subject)}`;
}
