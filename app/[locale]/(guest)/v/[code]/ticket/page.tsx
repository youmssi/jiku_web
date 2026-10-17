import { InvitationView } from "@/components/modules/invitation";

// The QR ticket itself must never be indexed (JIKU-58).
export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default function ShortTicketPage({ params }: Readonly<{ params: Promise<{ code: string }> }>) {
  return <InvitationView params={params.then(({ code }) => ({ token: code }))} />;
}
