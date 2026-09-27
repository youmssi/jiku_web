import { getTranslations } from "next-intl/server";
import { loadEventOrders, loadOrgUsername } from "./sale.queries";
import { OrdersBoard } from "./orders-board";
import { SaleLinkCard } from "./sale-link-card";

/** An event's Orders tab (JIKU-177): its public sale link, then its orders to confirm and its sales. */
export async function OrdersView({ eventId }: { eventId: string }) {
  const [orders, username, t] = await Promise.all([loadEventOrders(eventId), loadOrgUsername(), getTranslations("events.orders")]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
      </div>
      <SaleLinkCard username={username} eventId={eventId} />
      <OrdersBoard eventId={eventId} orders={orders} />
    </div>
  );
}
