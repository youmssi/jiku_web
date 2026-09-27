import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SalePage } from "@/components/modules/sale";
import { fetchPublicSale } from "@/components/modules/sale/server";

type Params = Promise<{ locale: string; username: string; eventId: string }>;

export async function generateMetadata({ params }: Readonly<{ params: Params }>): Promise<Metadata> {
  const { username, eventId } = await params;
  const sale = await fetchPublicSale(username, eventId);
  return {
    title: sale ? `${sale.eventName} · ${sale.organizerName}` : undefined,
    robots: { index: Boolean(sale?.onSale), follow: true },
  };
}

/** Route resolution only: an unknown event or organization is a 404. */
export default async function EventSalePage({ params }: Readonly<{ params: Params }>) {
  const { username, eventId } = await params;
  const sale = await fetchPublicSale(username, eventId);
  if (!sale) notFound();
  return <SalePage sale={sale} username={username} />;
}
