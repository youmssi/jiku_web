import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import { BillingView } from "@/components/modules/billing";
import type {
  ManualPaymentInstructions,
  PaymentHistoryItem,
  TierCatalog,
  UsageAllowance,
} from "@/components/modules/billing";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Organizer billing page for one event (JIKU-35): current usage/allowance, capacity
 * purchase, and tenant-scoped payment history with downloadable receipts.
 */
export default async function BillingPage({ params }: PageProps) {
  const { id } = await params;

  const [usageRes, catalogRes, paymentsRes, activationRes] = await Promise.all([
    serverFetch(`/events/${id}/usage`),
    serverFetch(`/billing/tiers`),
    serverFetch(`/billing/payments`),
    serverFetch(`/events/${id}/payments/manual`),
  ]);

  if (usageRes.status === 401) {
    redirect(ROUTES.LOGIN);
  }

  const usage = (await usageRes.json()) as UsageAllowance;
  const catalog = (await catalogRes.json()) as TierCatalog;
  const allPayments = paymentsRes.ok ? ((await paymentsRes.json()) as PaymentHistoryItem[]) : [];
  const payments = allPayments.filter((payment) => payment.eventId === id);
  // 404 simply means no open activation request for this event.
  const activation = activationRes.ok
    ? ((await activationRes.json()) as ManualPaymentInstructions)
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Billing</h1>
      <BillingView
        eventId={id}
        usage={usage}
        catalog={catalog}
        payments={payments}
        activation={activation}
      />
    </div>
  );
}
