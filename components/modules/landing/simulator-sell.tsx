"use client";

import { BadgeCheck, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TICKET_SALES, quoteForSales } from "@/lib/pricing";
import type { SimulatorContent } from "./simulator-content";
import { fill, ticketPriceField, type PriceFormat } from "./simulator-format";
import { NumberField } from "./simulator-number-field";

/** "Je vends des billets": ticket price and count to the 3 % commission, paid by tranche. */
export function SellPanel({
  content,
  format,
  price,
  onPriceChange,
  count,
  onCountChange,
}: {
  content: SimulatorContent;
  format: PriceFormat;
  price: number;
  onPriceChange: (price: number) => void;
  count: number;
  onCountChange: (count: number) => void;
}) {
  const { sell } = content;
  const field = ticketPriceField(format.currency);
  const priceMinor = field.toMinor(price);
  const quote = quoteForSales(priceMinor, count);
  const perTicket = Math.round(priceMinor * TICKET_SALES.commissionRate);

  return (
    <div className="flex flex-col gap-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
        <Badge variant="secondary">{sell.soon}</Badge>
        <p className="text-base leading-relaxed text-muted-foreground">{sell.intro}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8 rounded-3xl border border-border/50 bg-card/60 p-6 sm:p-8">
          <NumberField
            id="simulator-ticket-price"
            label={sell.priceLabel}
            value={price}
            min={field.min}
            max={field.max}
            step={field.step}
            inputMax={field.inputMax}
            onChange={onPriceChange}
            suffix={field.suffix}
          />
          <NumberField
            id="simulator-ticket-count"
            label={sell.countLabel}
            value={count}
            min={1}
            max={5_000}
            inputMax={100_000}
            onChange={onCountChange}
          />
          <ol className="grid gap-3 sm:grid-cols-3">
            {sell.steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-border/50 bg-background/60 p-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm font-semibold">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/[0.08] to-transparent p-6">
            <p className="text-sm text-muted-foreground">{sell.commissionLabel}</p>
            <p className="mt-1 text-4xl font-bold tracking-tight">{format.money(quote.commission)}</p>
            <p className="text-sm text-muted-foreground">
              {format.money(perTicket)} {sell.perTicketLabel}
            </p>
            <div className="mt-5 flex flex-col gap-1 border-t border-border/40 pt-4 text-sm">
              <p className="flex justify-between gap-3">
                <span className="text-muted-foreground">{fill(sell.trancheLabel, { size: TICKET_SALES.trancheSize })}</span>
                <span className="font-semibold">{format.money(quote.perTranche)}</span>
              </p>
              <p className="text-xs text-muted-foreground">{fill(sell.tranchesLabel, { count: quote.tranches })}</p>
            </div>
          </div>
          <div className="rounded-3xl border border-border/50 bg-card/60 p-6">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="size-4 text-primary" />
              {sell.revenueLabel}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{format.money(quote.organizationRevenue)}</p>
            <p className="mt-2 text-sm text-muted-foreground">{sell.revenueNote}</p>
          </div>
          <p className="flex items-start gap-2 rounded-2xl border border-border/50 bg-card/60 p-4 text-sm text-muted-foreground">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            {sell.verification}
          </p>
        </aside>
      </div>
    </div>
  );
}
