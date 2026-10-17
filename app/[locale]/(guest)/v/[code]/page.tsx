import { InvitationView } from "@/components/modules/invitation";

// Guest names, event details and RSVP status must never be indexed (JIKU-58).
export const metadata = { robots: { index: false, follow: false, nocache: true } };

/** A guest's invitation by its short code (JIKU-248), the link sent by email, WhatsApp and SMS. */
export default function ShortInvitationPage({ params }: Readonly<{ params: Promise<{ code: string }> }>) {
  return <InvitationView params={params.then(({ code }) => ({ token: code }))} />;
}
