import { PaymentHistoryTable } from "./payment-history-table";
import type { PaymentHistoryItem } from "./schema";

/** Payment history across every event in the tenant, not scoped to one event. */
export function AllPaymentsView({ payments }: { payments: PaymentHistoryItem[] }) {
  return <PaymentHistoryTable payments={payments} />;
}
