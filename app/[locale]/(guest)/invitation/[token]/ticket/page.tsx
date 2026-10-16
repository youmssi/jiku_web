import { InvitationView } from "@/components/modules/invitation";

// The QR ticket itself must never be indexed (JIKU-58).
export const metadata = { robots: { index: false, follow: false, nocache: true } };

/** Kept for links sent before short codes: a confirmed guest sees the ticket, anyone else the invitation. */
export default function TicketPage({ params }: Readonly<{ params: Promise<{ token: string }> }>) {
  return <InvitationView params={params} />;
}
