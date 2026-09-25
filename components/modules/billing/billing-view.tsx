"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAmount } from "@/lib/currency";
import { ActivationInstructions } from "./activation-instructions";
import { requestActivationAction } from "./billing.service";
import { PaymentHistoryTable } from "./payment-history-table";
import type {
  EventTierQuote,
  ManualPaymentInstructions,
  PaymentHistoryItem,
  TierCatalog,
  UsageAllowance,
} from "./schema";

interface BillingViewProps {
  eventId: string;
  usage: UsageAllowance;
  catalog: TierCatalog;
  /** What each tier this event can still buy costs it, from the server (ADR 105). */
  quotes: EventTierQuote[];
  payments: PaymentHistoryItem[];
  /** The event's open activation request, when one exists (JIKU-45). */
  activation: ManualPaymentInstructions | null;
  /** Capacity requests require the ADMIN or OWNER role (JIKU-41). */
  canManage: boolean;
}

export function BillingView({
  eventId,
  usage,
  catalog,
  quotes,
  payments,
  activation,
  canManage,
}: BillingViewProps) {
  const t = useTranslations("billing.event");
  const locale = useLocale();
  const [request, setRequest] = useState<ManualPaymentInstructions | null>(activation);
  const paid = catalog.tiers.filter((tier) => tier.maxGuests <= usage.allowance).at(-1);
  const lastTier = catalog.tiers.at(-1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingTier, setPendingTier] = useState<string | null>(null);

  function requestTier(tier: string) {
    setPendingTier(tier);
    requestActivationAction(eventId, tier).then(({ instructions, error }) => {
      setPendingTier(null);
      if (error) {
        toast.error(error);
        return;
      }
      if (instructions) {
        setRequest(instructions);
        setDialogOpen(true);
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionHeading>{t("allowanceTitle")}</SectionHeading>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            {t("allowance", { tier: usage.tier, used: usage.invitedGuests, allowance: usage.allowance })}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                usage.withinAllowance ? "bg-green-600" : "bg-amber-500"
              }`}
              style={{
                width: `${Math.min(100, usage.allowance > 0 ? (usage.invitedGuests / usage.allowance) * 100 : 0)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("remaining", { count: usage.remaining })}
          </p>
        </div>
      </section>

      {request ? (
        <section>
          <SectionHeading>{t("requestTitle")}</SectionHeading>
          <ActivationInstructions instructions={request} />
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
              {t("viewInstructions")}
            </Button>
          </div>
        </section>
      ) : canManage ? (
        <section>
          <SectionHeading>{t("addTitle")}</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2">
            {quotes.length === 0 && lastTier ? (
              <p className="text-sm text-muted-foreground">{t("maxed", { count: lastTier.maxGuests })}</p>
            ) : null}
            {quotes.map((quote) => (
              <div key={quote.tier} className="flex flex-col justify-between rounded-xl border p-4">
                <div>
                  <p className="font-medium">{quote.tier}</p>
                  <p className="text-sm text-muted-foreground">
                    {quote.maxGuests <= usage.allowance ? t("surchargeOnly") : t("upTo", { count: quote.maxGuests })}
                  </p>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <span className="text-lg font-semibold">
                      {formatAmount(quote.amountMinor, quote.currency, locale)}
                    </span>
                    {quote.surchargeMinor > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {t("surcharge", { amount: formatAmount(quote.surchargeMinor, quote.currency, locale) })}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => requestTier(quote.tier)}
                    disabled={pendingTier !== null}
                  >
                    {pendingTier === quote.tier ? t("requesting") : t("activate")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {paid ? `${t("difference")} ` : ""}
            {t("note")}
          </p>
        </section>
      ) : (
        <Alert>
          <InfoIcon />
          <AlertTitle>{t("managedTitle")}</AlertTitle>
          <AlertDescription>{t("managedText")}</AlertDescription>
        </Alert>
      )}

      <section>
        <SectionHeading>{t("historyTitle")}</SectionHeading>
        <PaymentHistoryTable payments={payments} />
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-full sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dialogText")}</DialogDescription>
          </DialogHeader>
          {request ? <ActivationInstructions instructions={request} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}
