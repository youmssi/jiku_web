import { localeRedirect } from "@/i18n/redirect";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";
import { BillingView } from "@/components/modules/billing";
import { isOnlinePaymentEnabled } from "@/components/modules/billing/server";
import { getOrganizerContext } from "@/components/modules/identity/server";
import type {
  EventPricing,
  ManualPaymentInstructions,
  PaymentHistoryItem,
  UsageAllowance,
} from "@/components/modules/billing";

interface PageProps {
  params: Promise<{ id: string }>;
}

const MANAGER_ROLES = ["ORGANIZER_OWNER", "ORGANIZER_ADMIN"];

/**
 * Organizer billing page for one event (JIKU-35): current usage/allowance, buying
 * guests at the per-guest price (ADR 109, the server prices the payment), and
 * tenant-scoped payment history with downloadable receipts. Guest purchases are
 * gated to admins and owners; members see the notice instead.
 */
export default async function BillingPage({ params }: PageProps) {
  const { id } = await params;

  const [usageRes, pricingRes, paymentsRes, activationRes, context] = await Promise.all([
    serverFetch(`/events/${id}/usage`),
    serverFetch(`/billing/event-pricing`),
    serverFetch(`/billing/payments`),
    serverFetch(`/events/${id}/payments/manual`),
    getOrganizerContext(),
  ]);

  if (usageRes.status === 401) {
    return localeRedirect(ROUTES.LOGIN);
  }

  const usage = (await usageRes.json()) as UsageAllowance;
  const pricing = (await pricingRes.json()) as EventPricing;
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
        pricing={pricing}
        payments={payments}
        activation={activation}
        canManage={canManage}
        online={isOnlinePaymentEnabled()}
      />
    </div>
  );
}
