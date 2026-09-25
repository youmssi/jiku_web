import { localeRedirect } from "@/i18n/redirect";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import { BillingView } from "@/components/modules/billing";
import { getOrganizerContext } from "@/components/modules/identity/server";
import type {
  EventTierQuote,
  ManualPaymentInstructions,
  PaymentHistoryItem,
  TierCatalog,
  UsageAllowance,
} from "@/components/modules/billing";

interface PageProps {
  params: Promise<{ id: string }>;
}

const MANAGER_ROLES = ["ORGANIZER_OWNER", "ORGANIZER_ADMIN"];

/**
 * Organizer billing page for one event (JIKU-35): current usage/allowance, capacity
 * purchase priced by the server for this event (tier difference and interactive
 * surcharge, ADR 105), and tenant-scoped payment history with downloadable receipts. Capacity
 * requests are gated to admins and owners; members see the notice instead.
 */
export default async function BillingPage({ params }: PageProps) {
  const { id } = await params;

  const [usageRes, catalogRes, quotesRes, paymentsRes, activationRes, context] = await Promise.all([
    serverFetch(`/events/${id}/usage`),
    serverFetch(`/billing/tiers`),
    serverFetch(`/events/${id}/billing/quotes`),
    serverFetch(`/billing/payments`),
    serverFetch(`/events/${id}/payments/manual`),
    getOrganizerContext(),
  ]);

  if (usageRes.status === 401) {
    return localeRedirect(ROUTES.LOGIN);
  }

  const usage = (await usageRes.json()) as UsageAllowance;
  const catalog = (await catalogRes.json()) as TierCatalog;
  const quotes = quotesRes.ok ? ((await quotesRes.json()) as EventTierQuote[]) : [];
  const allPayments = paymentsRes.ok ? ((await paymentsRes.json()) as PaymentHistoryItem[]) : [];
  const payments = allPayments.filter((payment) => payment.eventId === id);
  // 404 simply means no open activation request for this event.
  const activation = activationRes.ok
    ? ((await activationRes.json()) as ManualPaymentInstructions)
    : null;
  const canManage = context !== null && MANAGER_ROLES.includes(context.role);

  return (
    <div className="max-w-3xl">
      <BillingView
        eventId={id}
        usage={usage}
        catalog={catalog}
        quotes={quotes}
        payments={payments}
        activation={activation}
        canManage={canManage}
      />
    </div>
  );
}
