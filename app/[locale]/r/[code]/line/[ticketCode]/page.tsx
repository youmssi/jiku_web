import type { Metadata } from "next";
import { LineTicketStatus, loadLineTicket } from "@/components/modules/appointment";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** A client's own ticket in today's line, followed live (JIKU-113). */
export default async function LineTicketPage({
  params,
}: Readonly<{ params: Promise<{ locale: string; code: string; ticketCode: string }> }>) {
  const { code, ticketCode } = await params;
  const ticket = await loadLineTicket({ code }, ticketCode);
  return <LineTicketStatus link={{ code }} ticketCode={ticketCode} initial={ticket} />;
}
