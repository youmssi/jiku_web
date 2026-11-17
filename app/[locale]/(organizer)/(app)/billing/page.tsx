import { getTranslations } from "next-intl/server";
import { localeRedirect } from "@/i18n/redirect";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AllPaymentsView,
  GiftsSection,
  InvoicesTable,
  PackSection,
  PendingPayments,
  SubscriptionSection,
  fetchGiftsAction,
  fetchInvoicesAction,
  fetchOpenRequestsAction,
  fetchPackAction,
  fetchSubscriptionAction,
} from "@/components/modules/billing";
import { isOnlinePaymentEnabled } from "@/components/modules/billing/server";
import { getOrganizerContext } from "@/components/modules/identity/server";
import type { GiftEventOption, PaymentHistoryItem } from "@/components/modules/billing";
import { serverFetch } from "@/lib/api-server";
import { ROUTES } from "@/lib/constants";

const MANAGER_ROLES = ["ORGANIZER_OWNER", "ORGANIZER_ADMIN"];

/**
 * Organizer billing overview: the transfer requests still waiting (JIKU-307),
 * the prepaid subscription (JIKU-90), the formula,
 * expiry, active resources used and included, the renewal banner, the
 * Pro Organisateur (ADR 109), then payment history across every event in the
 * tenant and any accounting-grade invoices.
 */
export default async function BillingPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ gift?: string }> }>) {
  const { gift: openGiftId } = await searchParams;
  const response = await serverFetch("/billing/payments");
  if (response.status === 401) {
    return localeRedirect(ROUTES.LOGIN);
  }
  const payments = response.ok ? ((await response.json()) as PaymentHistoryItem[]) : [];
  const [invoices, subscription, pack, waiting, gifts, events, context, t] = await Promise.all([
    fetchInvoicesAction(),
    fetchSubscriptionAction(),
    fetchPackAction(),
    fetchOpenRequestsAction(),
    fetchGiftsAction(),
    loadEventOptions(),
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

      {waiting.length > 0 ? (
        <div className="mb-10">
          <PendingPayments requests={waiting} canManage={canManage} />
        </div>
      ) : null}

      {gifts.length > 0 ? (
        <div className="mb-10">
          <GiftsSection key={openGiftId ?? "gifts"} gifts={gifts} events={events} canManage={canManage} openGiftId={openGiftId} />
        </div>
      ) : null}

      {subscription ? (
        <section className="mb-10 flex flex-col gap-4">
          <SubscriptionSection
            initial={subscription}
            online={online}
            waiting={waiting.find((request) => request.kind === "SUBSCRIPTION") ?? null}
          />
        </section>
      ) : null}

      {pack ? (
        <section className="mb-10 flex flex-col gap-4">
          <PackSection initial={pack} canManage={canManage} online={online} waiting={waiting} />
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

/** The organization's events, for choosing where a gift's guests go (JIKU-315). */
async function loadEventOptions(): Promise<GiftEventOption[]> {
  const response = await serverFetch("/events");
  if (!response.ok) return [];
  const events = (await response.json().catch(() => [])) as { id: string; name: string }[];
  return events.map((event) => ({ id: event.id, name: event.name }));
}
