"use client";

import { useMemo, useState, useTransition } from "react";import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestSubscriptionAction } from "@/components/modules/billing/billing.service";
import { ActivationInstructions } from "@/components/modules/billing/activation-instructions";
import type { ManualPaymentInstructions, SubscriptionView } from "@/components/modules/billing/schema";

function formatDay(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Abonnement prépayé de l'organisateur (JIKU-90) : formule, échéance, ressources
 * utilisées/incluses, bandeau quand l'échéance approche (ou en grâce, en ambre,
 * avec la date de suspension), et demande de prépaiement 1/3/6/12 mois qui suit
 * le circuit Mobile Money manuel (référence puis confirmation par l'équipe).
 */
export function SubscriptionSection({
  initial,
  nowIso,
}: {
  initial: SubscriptionView;
  nowIso: string;
}) {
  const subscription = initial;
  const [showRequest, setShowRequest] = useState(false);
  const [plan, setPlan] = useState(initial.plan);
  const [months, setMonths] = useState<number>(initial.months[0]?.months ?? 1);
  const [instructions, setInstructions] = useState<ManualPaymentInstructions | null>(null);
  const [isSaving, startSave] = useTransition();

  const daysLeft = useMemo(() => {
    const expires = Date.parse(subscription.expiresAt);
    return Math.ceil((expires - Date.parse(nowIso)) / 86_400_000);
  }, [subscription.expiresAt, nowIso]);

  const inGrace = subscription.status === "GRACE";
  const nearExpiry = !inGrace && daysLeft <= 7;
  const selectedPlan = subscription.plans.find((p) => p.name === plan);

  function submitRequest() {
    startSave(async () => {
      const result = await requestSubscriptionAction({ plan, months });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setInstructions(result.instructions);
      setShowRequest(false);
      toast.success("Payment instructions are ready.");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {inGrace ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-semibold">
            Your {subscription.plan} subscription is in grace.
          </p>
          <p className="mt-1">
            Renew now — your workspace will be suspended on {formatDay(subscription.suspensionAt)}.
          </p>
        </div>
      ) : null}
      {nearExpiry ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-semibold">
            Your {subscription.plan} subscription expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}.
          </p>
          <p className="mt-1">
            {subscription.resourcesActive} active resource
            {subscription.resourcesActive === 1 ? "" : "s"} on {subscription.resourcesIncluded} included. Renew
            before then to keep your workspace running.
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold">{subscription.plan} subscription</p>
            <p className="text-sm text-muted-foreground">
              Renews on {formatDay(subscription.expiresAt)} · {subscription.status}
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowRequest((current) => !current)}>
            {showRequest ? "Cancel" : "Renew or change"}
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {subscription.resourcesActive} of {subscription.resourcesIncluded} active resources used
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              subscription.overLimit ? "bg-amber-500" : "bg-green-600"
            }`}
            style={{
              width: `${Math.min(100, (subscription.resourcesActive / subscription.resourcesIncluded) * 100)}%`,
            }}
          />
        </div>
        {subscription.overLimit ? (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            You have more active resources than your formula includes — renew on a larger formula to avoid a
            gap when this period ends.
          </p>
        ) : null}
      </div>

      {instructions ? (
        <ActivationInstructions instructions={instructions} />
      ) : null}

      {showRequest ? (
        <div className="flex flex-col gap-4 rounded-xl border p-5">
          <div>
            <Label>Formula</Label>
            <div className="mt-2 max-w-xs">
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subscription.plans.map((option) => (
                    <SelectItem key={option.name} value={option.name}>
                      {option.name} — up to {option.maxResources} resources
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Prepaid period</Label>
            <div className="mt-2 max-w-xs">
              <Select
                value={String(months)}
                onValueChange={(value) => setMonths(Number.parseInt(value, 10))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subscription.months.map((option) => (
                    <SelectItem key={option.months} value={String(option.months)}>
                      {option.months} month{option.months === 1 ? "" : "s"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {selectedPlan
              ? `You'll receive Mobile Money payment instructions with the exact amount and a reference to quote.`
              : null}
          </p>

          <div>
            <Button onClick={submitRequest} disabled={isSaving}>
              {isSaving ? "Requesting…" : "Request prepayment"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
