"use client";

import { useRef, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ServicePlanId } from "@/lib/pricing";
import type { LandingLocale } from "./content";
import { DEFAULT_TICKET_PRICE, PlanFinder, type FinderResult } from "./plan-finder";
import type { SimulatorContent, SimulatorNeed } from "./simulator-content";
import { priceFormat } from "./simulator-format";
import { InvitePanel } from "./simulator-invite";
import { SellPanel } from "./simulator-sell";
import { ServicesPanel } from "./simulator-services";

const NEEDS: SimulatorNeed[] = ["serve", "invite", "sell"];

/**
 * The pricing playground: the plan finder on top, then one tab per need. The
 * finder's answer opens its tab pre-filled, so a figure is never more than
 * three clicks away; each tab stays usable on its own for visitors who know
 * what they want.
 */
export function SimulatorCalculator({ content, locale }: { content: SimulatorContent; locale: LandingLocale }) {
  const [need, setNeed] = useState<SimulatorNeed>("serve");
  const [planId, setPlanId] = useState<ServicePlanId>("teams");
  const [servers, setServers] = useState(3);
  const [guests, setGuests] = useState(150);
  const [ticketPrice, setTicketPrice] = useState(DEFAULT_TICKET_PRICE);
  const [tickets, setTickets] = useState(300);
  const tabsRef = useRef<HTMLDivElement>(null);
  const format = priceFormat(locale, content.usdPrefix);

  function apply(result: FinderResult) {
    setNeed(result.need);
    if (result.planId) setPlanId(result.planId);
    if (result.servers) setServers(result.servers);
    if (result.guests) setGuests(result.guests);
    if (result.tickets) setTickets(result.tickets);
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-14">
      <PlanFinder content={content} locale={locale} onApply={apply} />

      <div ref={tabsRef} className="scroll-mt-24">
        <Tabs value={need} onValueChange={(value) => setNeed(value as SimulatorNeed)} className="gap-8">
          <TabsList className="mx-auto grid h-auto w-full max-w-2xl grid-cols-3 rounded-2xl p-1 sm:rounded-full">
            {NEEDS.map((value) => (
              <TabsTrigger
                key={value}
                value={value}
                className="h-full rounded-xl px-2 py-2 text-xs leading-tight whitespace-normal sm:rounded-full sm:px-4 sm:text-sm"
              >
                {content.tabs[value]}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="serve" className="text-sm">
            <ServicesPanel
              content={content}
              format={format}
              planId={planId}
              onPlanChange={setPlanId}
              servers={servers}
              onServersChange={setServers}
            />
          </TabsContent>
          <TabsContent value="invite" className="text-sm">
            <InvitePanel content={content} locale={locale} format={format} guests={guests} onGuestsChange={setGuests} />
          </TabsContent>
          <TabsContent value="sell" className="text-sm">
            <SellPanel
              content={content}
              format={format}
              price={ticketPrice}
              onPriceChange={setTicketPrice}
              count={tickets}
              onCountChange={setTickets}
            />
          </TabsContent>
        </Tabs>
        <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2 text-center text-sm text-muted-foreground">
          <MessageSquareText className="mt-0.5 size-4 shrink-0 text-primary" />
          {content.sms}
        </p>
      </div>
    </div>
  );
}
