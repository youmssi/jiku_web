import { TicketTypesView } from "@/components/modules/event/server";

export default async function EventTicketsPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <TicketTypesView eventId={id} />;
}
