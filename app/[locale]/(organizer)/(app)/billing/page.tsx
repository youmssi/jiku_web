import { getTranslations } from "next-intl/server";
import { localeRedirect } from "@/i18n/redirect";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AllPaymentsView,
  InvoicesTable,
  OwnNumberSection,
  PackSection,
  SubscriptionSection,
  fetchInvoicesAction,
  fetchOwnNumberAction,
  fetchPackAction,
  fetchSubscriptionAction,
} from "@/components/modules/billing";
import { isOnlinePaymentEnabled } from "@/components/modules/billing/server";
import { getOrganizerContext } from "@/components/modules/identity/server";
import type { PaymentHistoryItem } from "@/components/modules/billing";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";

const MANAGER_ROLES = ["ORGANIZER_OWNER", "ORGANIZER_ADMIN"];

/**
 * Organizer billing overview: the prepaid subscription (JIKU-90), the formula,
 * expiry, active resources used and included, the renewal banner, the
 * Organizer Pack and the own WhatsApp number (ADR 105), then payment history across every event in the
 * tenant and any accounting-grade invoices.
 */
export default async function BillingPage() {
  const response = await serverFetch("/billing/payments");
  if (response.status === 401) {
    return localeRedirect(ROUTES.LOGIN);
  }
  const payments = response.ok ? ((await response.json()) as PaymentHistoryItem[]) : [];
  const [invoices, subscription, pack, ownNumber, context, t] = await Promise.all([
    fetchInvoicesAction(),
    fetchSubscriptionAction(),
    fetchPackAction(),
    fetchOwnNumberAction(),
    getOrganizerContext(),
    getTranslations("billing.page"),
  ]);
  const canManage = context !== null && MANAGER_ROLES.includes(context.role);
  const online = isOnlinePaymentEnabled();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{t("title")}</h1>

      <Alert className="mb-8">
        <InfoIcon />
        <AlertTitle>{t("notice.title")}</AlertTitle>
        <AlertDescription>{t("notice.text")}</AlertDescription>
      </Alert>

      {subscription ? (
        <section className="mb-10 flex flex-col gap-4">
          <SubscriptionSection initial={subscription} nowIso={new Date().toISOString()} online={online} />
        </section>
      ) : null}

      {pack ? (
        <section className="mb-10 flex flex-col gap-4">
          <PackSection initial={pack} canManage={canManage} online={online} />
        </section>
      ) : null}

      {ownNumber ? (
        <section className="mb-10 flex flex-col gap-4">
          <OwnNumberSection initial={ownNumber} canManage={canManage} online={online} />
        </section>
      ) : null}

      <AllPaymentsView payments={payments} />

      <section className="mt-12">
        <h2 className="mb-2 text-lg font-semibold">{t("invoicesTitle")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("invoicesText")}
        </p>
        <InvoicesTable invoices={invoices} />
      </section>
    </div>
  );
}
