import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LineTicketTake, loadAppointment } from "@/components/modules/appointment";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Where the entrance QR leads: a client takes a ticket for today's line (JIKU-113). */
export default async function LineTakePage({ params }: Readonly<{ params: Promise<{ locale: string; code: string }> }>) {
  const { code } = await params;
  const view = await loadAppointment({ code });
  if (!view) notFound();
  return <LineTicketTake link={{ code }} serviceName={view.name} />;
}
