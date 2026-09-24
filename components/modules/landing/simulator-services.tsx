"use client";

import { useState } from "react";
import { Check, Info, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { quoteForService, servicePlan, type ServicePlanId } from "@/lib/pricing";
import { salesMailto } from "@/lib/support";
import { cn } from "@/lib/utils";
import type { SimulatorContent, SimulatorServicePlan } from "./simulator-content";
import { fill, type PriceFormat } from "./simulator-format";
import { NumberField } from "./simulator-number-field";

/** "Je reçois des clients": pick a plan and a team size, see the monthly and yearly total. */
export function ServicesPanel({
  content,
  format,
  planId,
  onPlanChange,
  servers,
  onServersChange,
}: {
  content: SimulatorContent;
  format: PriceFormat;
  planId: ServicePlanId;
  onPlanChange: (plan: ServicePlanId) => void;
  servers: number;
  onServersChange: (servers: number) => void;
}) {
  const { services } = content;
  const [yearly, setYearly] = useState(false);
  const selected = services.plans.find((plan) => plan.id === planId) ?? services.plans[1];
  const quote = quoteForService(planId, servers, yearly);
  const soloTooSmall = planId === "solo" && servers > (servicePlan("solo").maxServers ?? 1);

  return (
    <div className="flex flex-col gap-8">
      <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-muted-foreground">{services.intro}</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border/50 bg-card/60 p-6 sm:p-8">
          <NumberField
            id="simulator-servers"
            label={services.serversLabel}
            helper={services.serversHelper}
            value={servers}
            min={1}
            max={50}
            inputMax={500}
            onChange={onServersChange}
          />
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ToggleGroup
              type="single"
              variant="outline"
              value={yearly ? "yearly" : "monthly"}
              onValueChange={(value) => value && setYearly(value === "yearly")}
            >
              <ToggleGroupItem value="monthly" className="px-4">
                {services.monthly}
              </ToggleGroupItem>
              <ToggleGroupItem value="yearly" className="px-4">
                {services.yearly}
              </ToggleGroupItem>
            </ToggleGroup>
            <Badge variant="secondary">{services.yearlyBadge}</Badge>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {services.plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={plan.id === planId}
                yearly={yearly}
                format={format}
                content={content}
                onSelect={() => onPlanChange(plan.id)}
              />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/[0.08] to-transparent p-6">
            <p className="text-sm text-muted-foreground">{selected.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="size-4" />
              {format.number(servers)}
            </p>
            {quote.monthlyTotal === null ? (
              <p className="mt-4 text-3xl font-bold tracking-tight">{content.onQuote}</p>
            ) : (
              <>
                <p className="mt-4 text-4xl font-bold tracking-tight">{format.gnf(quote.monthlyTotal)}</p>
                <p className="text-sm text-muted-foreground">
                  {services.perMonth} · {format.usd(quote.monthlyTotal)}
                </p>
                <p className="mt-3 text-sm">
                  {format.gnf(quote.yearlyTotal ?? 0)} {services.perYear}
                </p>
                {quote.yearlySaving > 0 ? (
                  <p className="mt-2 text-sm font-medium text-primary">
                    {fill(services.saving, { amount: format.gnf(quote.yearlySaving) })}
                  </p>
                ) : null}
              </>
            )}
            {soloTooSmall ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
                <Info className="mt-0.5 size-4 shrink-0" />
                {services.soloLimit}
              </p>
            ) : null}
            <Button asChild size="lg" className="mt-6 w-full rounded-full">
              {selected.id === "enterprise" ? (
                <a href={salesMailto(selected.mailSubject)}>{selected.cta}</a>
              ) : (
                <Link href={ROUTES.REGISTER}>{selected.cta}</Link>
              )}
            </Button>
          </div>
          <Note>{services.clientsPay}</Note>
          <Note>{services.freeRoles}</Note>
        </aside>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  selected,
  yearly,
  format,
  content,
  onSelect,
}: {
  plan: SimulatorServicePlan;
  selected: boolean;
  yearly: boolean;
  format: PriceFormat;
  content: SimulatorContent;
  onSelect: () => void;
}) {
  const pricing = servicePlan(plan.id);
  const perPerson = yearly && pricing.yearly !== null ? pricing.yearly : pricing.monthly;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "relative flex flex-col rounded-2xl border p-5 text-left transition-all",
        selected
          ? "border-primary bg-primary/[0.06] shadow-lg shadow-primary/10"
          : "border-border/50 hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-base font-semibold">{plan.name}</span>
        {selected ? <Check className="size-4 text-primary" /> : null}
      </span>
      <span className="mt-1 text-xs text-muted-foreground">{plan.audience}</span>
      <span className="mt-4 text-xl font-bold tracking-tight">
        {perPerson === null ? content.onQuote : format.gnf(perPerson)}
      </span>
      {perPerson !== null && perPerson > 0 ? (
        <span className="text-xs text-muted-foreground">{content.services.perPersonMonth}</span>
      ) : null}
      <ul className="mt-4 flex flex-col gap-1.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </button>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-2xl border border-border/50 bg-card/60 p-4 text-sm text-muted-foreground">
      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
      {children}
    </p>
  );
}
