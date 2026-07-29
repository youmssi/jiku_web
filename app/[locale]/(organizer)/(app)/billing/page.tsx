import { redirect } from "next/navigation";
import { AllPaymentsView } from "@/components/modules/billing";
import type { PaymentHistoryItem } from "@/components/modules/billing";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";

/** Organizer billing overview: payment history across every event in the tenant. */
export default async function BillingPage() {
  const response = await serverFetch("/billing/payments");
  if (response.status === 401) {
    redirect(ROUTES.LOGIN);
  }
  const payments = response.ok ? ((await response.json()) as PaymentHistoryItem[]) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Billing</h1>
      <AllPaymentsView payments={payments} />
    </div>
  );
}
