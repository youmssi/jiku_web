import { OrderScreen } from "@/components/modules/sale/server";

// A buyer's name, order and tickets must never be indexed.
export const metadata = { robots: { index: false, follow: false, nocache: true } };

/** A buyer's order by its short link (JIKU-250). */
export default async function ShortOrderPage({ params }: Readonly<{ params: Promise<{ code: string }> }>) {
  const { code } = await params;
  return <OrderScreen token={code} />;
}
