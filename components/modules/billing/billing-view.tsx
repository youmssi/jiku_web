"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PayOnlineButton } from "./pay-online-button";
import { PaymentHistoryTable } from "./payment-history-table";
import type { EventPricing, ManualPaymentInstructions, PaymentHistoryItem, UsageAllowance } from "./schema";

/** The tier an event reports while Pro Organisateur covers it (ADR 105). */
const PACK_TIER = "PACK";
/** Guests suggested above what the event already uses, when it buys more. */
const HEADROOM = 50;

interface BillingViewProps {
  eventId: string;
  usage: UsageAllowance;
  /** The per-guest price in the organization's currency (ADR 109). */
  pricing: EventPricing;
  payments: PaymentHistoryItem[];
  /** The event's open activation request, when one exists (JIKU-45). */
  activation: ManualPaymentInstructions | null;
  /** Capacity requests require the ADMIN or OWNER role (JIKU-41). */
  canManage: boolean;
  /** Online payment is offered next to the manual transfer (JIKU-165). */
  online: boolean;
}

export function BillingView({
  eventId,
  usage,
  pricing,
  payments,
  activation,
  canManage,
  online,
}: BillingViewProps) {
  const t = useTranslations("billing.event");
  const locale = useLocale();
  const [request, setRequest] = useState<ManualPaymentInstructions | null>(activation);
  const [guests, setGuests] = useState(Math.max(usage.paidGuests + 1, usage.invitedGuests + HEADROOM));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const valid = Number.isSafeInteger(guests) && guests > usage.paidGuests && guests <= pricing.maxGuestsPerEvent;
  const estimate = valid ? (guests - usage.paidGuests) * pricing.perGuestMinor : 0;

  function requestGuests() {
    setPending(true);
    requestActivationAction(eventId, guests).then(({ instructions, error }) => {
      setPending(false);
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
            {t("allowance", { used: usage.invitedGuests, allowance: usage.allowance })}
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

      {usage.tier === PACK_TIER ? (
        <Alert>
          <InfoIcon />
          <AlertTitle>{t("coveredTitle")}</AlertTitle>
          <AlertDescription>{t("coveredText")}</AlertDescription>
        </Alert>
      ) : request ? (
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
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">
              {t("perGuest", { amount: formatAmount(pricing.perGuestMinor, pricing.currency, locale) })}
            </p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-2">
                <Label htmlFor="billing-guests">{t("guestsLabel")}</Label>
                <Input
                  id="billing-guests"
                  type="number"
                  inputMode="numeric"
                  min={usage.paidGuests + 1}
                  max={pricing.maxGuestsPerEvent}
                  value={Number.isFinite(guests) ? guests : ""}
                  onChange={(event) => setGuests(event.target.valueAsNumber)}
                  aria-invalid={!valid}
                  aria-describedby="billing-guests-help"
                  className="w-40"
                />
              </div>
              <div aria-live="polite">
                <p className="text-xs text-muted-foreground">{t("estimate")}</p>
                <p className="text-2xl font-semibold tabular-nums">{formatAmount(estimate, pricing.currency, locale)}</p>
              </div>
            </div>
            <p id="billing-guests-help" className="mt-2 text-xs text-muted-foreground">
              {valid
                ? usage.paidGuests > 0
                  ? t("onlyNew", { count: usage.paidGuests })
                  : t("guestsHelp")
                : t("guestsInvalid", { min: usage.paidGuests + 1, max: pricing.maxGuestsPerEvent })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant={online ? "outline" : "default"} onClick={requestGuests} disabled={!valid || pending}>
                {pending ? t("requesting") : t("activate")}
              </Button>
              {online ? (
                <PayOnlineButton target={{ kind: "guests", eventId, guests }} disabled={!valid} />
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t("note")}</p>
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
