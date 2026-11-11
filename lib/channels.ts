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

/**
 * The channel a guest is invited on first (JIKU-273): the event's choice when it
 * still offers it, else WhatsApp, else whatever the event offers. Mirrors the
 * backend's `InvitationChannel.channelOrder`.
 */
export function effectivePrimaryChannel(
  enabled: readonly InvitationChannel[],
  primary: InvitationChannel | null | undefined,
): InvitationChannel | null {
  if (primary && enabled.includes(primary)) return primary;
  if (enabled.includes("WHATSAPP")) return "WHATSAPP";
  return enabled[0] ?? null;
}
