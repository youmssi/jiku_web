import { getTranslations } from "next-intl/server";
import { StateMessage } from "@/components/shared";
import { OrderView } from "@/components/modules/sale";
import { fetchOrder } from "@/components/modules/sale/server";

// A buyer's name, order and tickets must never be indexed.
export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function OrderPage({ params }: Readonly<{ params: Promise<{ token: string }> }>) {
  const { token } = await params;
  const order = await fetchOrder(token);
  if (!order) {
    const t = await getTranslations("guest.order");
    return <StateMessage title={t("unavailableTitle")} description={t("unavailableText")} />;
  }
  return <OrderView order={order} token={token} />;
}
