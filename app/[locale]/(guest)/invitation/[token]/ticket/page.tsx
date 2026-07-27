import { TicketView } from "@/components/modules/invitation";

export default function TicketPage({ params }: Readonly<{ params: Promise<{ token: string }> }>) {
  return <TicketView params={params} />;
}
