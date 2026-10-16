import { OrderScreen } from "@/components/modules/sale/server";

// A buyer's name, order and tickets must never be indexed.
export const metadata = { robots: { index: false, follow: false, nocache: true } };

/** A buyer's order by the signed link handed out before short links (JIKU-177). */
export default async function OrderPage({ params }: Readonly<{ params: Promise<{ token: string }> }>) {
  const { token } = await params;
  return <OrderScreen token={token} />;
}
