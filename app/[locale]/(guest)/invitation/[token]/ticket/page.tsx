import { TicketView } from "@/components/modules/invitation";

// The QR ticket itself must never be indexed (JIKU-58).
export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default function TicketPage({ params }: Readonly<{ params: Promise<{ token: string }> }>) {
  return <TicketView params={params} />;
}
