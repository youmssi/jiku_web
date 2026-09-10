import { redirect } from "next/navigation";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AllPaymentsView,
  InvoicesTable,
  SubscriptionSection,
  fetchInvoicesAction,
  fetchSubscriptionAction,
} from "@/components/modules/billing";
import type { PaymentHistoryItem } from "@/components/modules/billing";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";

/**
 * Organizer billing overview: the prepaid subscription (JIKU-90), the formula,
 * expiry, active resources used and included, the renewal banner, then payment
 * history across every event in the tenant and any accounting-grade invoices.
 */
export default async function BillingPage() {
  const response = await serverFetch("/billing/payments");
  if (response.status === 401) {
    redirect(ROUTES.LOGIN);
  }
  const payments = response.ok ? ((await response.json()) as PaymentHistoryItem[]) : [];
  const [invoices, subscription] = await Promise.all([
    fetchInvoicesAction(),
    fetchSubscriptionAction(),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Billing</h1>

      <Alert className="mb-8">
        <InfoIcon />
        <AlertTitle>This is your workspace billing</AlertTitle>
        <AlertDescription>
          It covers your subscription and every payment made across all of your events.
          To see one event&apos;s guest allowance and request extra capacity for it, open
          that event and go to its Billing section.
        </AlertDescription>
      </Alert>

      {subscription ? (
        <section className="mb-10 flex flex-col gap-4">
          <SubscriptionSection initial={subscription} nowIso={new Date().toISOString()} />
        </section>
      ) : null}

      <AllPaymentsView payments={payments} />

      <section className="mt-12">
        <h2 className="mb-2 text-lg font-semibold">Invoices</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Formal documents for a company or institution. Your legal details live in
          Settings, and an invoice cannot be issued until they are complete.
        </p>
        <InvoicesTable invoices={invoices} />
      </section>
    </div>
  );
}
