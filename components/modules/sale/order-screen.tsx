import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { ticketRoute } from "@/lib/constants";
import { StateMessage } from "@/components/shared";
import { OrderView } from "./order-view";
import { fetchOrder } from "./sale.queries";

/**
 * What a buyer's order link opens (JIKU-177, JIKU-250): the order while it is
 * being paid, then the ticket itself once a single-ticket order is confirmed,
 * so the link in the buyer's messages leads straight to the QR code.
 */
export async function OrderScreen({ token }: { token: string }) {
  const order = await fetchOrder(token);
  if (!order) {
    const t = await getTranslations("guest.order");
    return <StateMessage title={t("unavailableTitle")} description={t("unavailableText")} />;
  }
  if (order.status === "PAID" && order.ticketTokens.length === 1) {
    redirect({ href: ticketRoute(order.ticketTokens[0]), locale: await getLocale() });
  }
  return <OrderView order={order} token={token} />;
}
