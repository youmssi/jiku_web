import { OrdersView } from "@/components/modules/sale/server";

export default async function EventOrdersPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <OrdersView eventId={id} />;
}
