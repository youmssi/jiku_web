/**
 * Invitation delivery channels — the single source of truth across the web modules
 * (event form, guest sending, guest list columns). Add a channel here and every
 * screen picks it up.
 */
export const INVITATION_CHANNELS = ["EMAIL", "WHATSAPP"] as const;

export type InvitationChannel = (typeof INVITATION_CHANNELS)[number];

export const INVITATION_CHANNEL_LABELS: Record<InvitationChannel, string> = {
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
};
