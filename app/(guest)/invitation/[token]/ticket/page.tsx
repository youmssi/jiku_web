import { TicketView } from "@/components/modules/invitation";

export default function TicketPage({ params }: { params: Promise<{ token: string }> }) {
  return <TicketView params={params} />;
}
