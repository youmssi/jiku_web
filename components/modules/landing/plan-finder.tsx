"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { RadioGroup } from "@/components/ui/radio-group";
import { Link } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";
import { ROUTES } from "@/lib/constants";
import { FREE_TIER, quoteForGuests, quoteForSales, quoteForService, type ServicePlanId } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { FinderOption, SimulatorContent, SimulatorNeed } from "./simulator-content";
import { fill, ticketPriceField, type PriceFormat } from "./simulator-format";

/** What the questionnaire hands to the calculator: the tab to open, pre-filled. */
export interface FinderResult {
  need: SimulatorNeed;
  planId?: ServicePlanId;
  servers?: number;
  guests?: number;
  tickets?: number;
}

type Need = SimulatorNeed | "both";
type Servers = "one" | "few" | "many";
type Features = "email" | "whatsapp" | "sites" | "custom";
type Guests = "100" | "300" | "600" | "1000" | "more";
type Sales = "small" | "medium" | "large";

interface Answers {
  need?: Need;
  servers?: Servers;
  features?: Features;
  guests?: Guests;
  sales?: Sales;
}

type StepKey = keyof Answers;

const SERVER_COUNT: Record<Servers, number> = { one: 1, few: 3, many: 12 };
const GUEST_COUNT: Record<Guests, number> = { "100": 100, "300": 250, "600": 500, "1000": 900, more: 1_500 };
const TICKET_COUNT: Record<Sales, number> = { small: 100, medium: 400, large: 1_000 };

function stepsFor(need: Need | undefined): StepKey[] {
  if (need === "serve" || need === "both") return ["need", "servers", "features"];
  if (need === "invite") return ["need", "guests"];
  if (need === "sell") return ["need", "sales"];
  return ["need", "servers", "features"];
}

function planFor(servers: Servers, features: Features): ServicePlanId {
  if (features === "custom") return "enterprise";
  if (features === "sites" || servers === "many") return "organisation";
  if (servers === "few") return "teams";
  return features === "whatsapp" ? "soloPlus" : "solo";
}

function resultFor(answers: Answers): FinderResult | null {
  const { need } = answers;
  if ((need === "serve" || need === "both") && answers.servers && answers.features) {
    return {
      need: "serve",
      planId: planFor(answers.servers, answers.features),
      servers: SERVER_COUNT[answers.servers],
    };
  }
  if (need === "invite" && answers.guests) return { need: "invite", guests: GUEST_COUNT[answers.guests] };
  if (need === "sell" && answers.sales) return { need: "sell", tickets: TICKET_COUNT[answers.sales] };
  return null;
}

/**
 * A three-question plan finder. Each answer moves on by itself; the last one
 * shows the recommended model with its price and opens the matching tab of the
 * calculator, pre-filled, so a visitor never has to know the pricing vocabulary
 * to get a figure.
 */
export function PlanFinder({
  content,
  format,
  onApply,
}: {
  content: SimulatorContent;
  format: PriceFormat;
  onApply: (result: FinderResult) => void;
}) {
  const { finder } = content;
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);

  const steps = stepsFor(answers.need);
  const result = resultFor(answers);
  const done = result !== null && index >= steps.length;

  function answer<K extends StepKey>(key: K, value: NonNullable<Answers[K]>) {
    const next = key === "need" ? { need: value as Need } : { ...answers, [key]: value };
    setAnswers(next);
    const nextSteps = stepsFor(next.need);
    setIndex(nextSteps.indexOf(key) + 1);
    const finished = resultFor(next);
    if (finished && nextSteps.indexOf(key) === nextSteps.length - 1) {
      trackEvent("plan_found", { need: finished.need, plan: finished.planId ?? "" });
    }
  }

  function restart() {
    setAnswers({});
    setIndex(0);
  }

  return (
    <section
      aria-labelledby="plan-finder-heading"
      className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-background to-background p-6 sm:p-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="plan-finder-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            {finder.heading}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{finder.text}</p>
        </div>
        {index > 0 ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={restart}>
            <RotateCcw data-icon="inline-start" />
            {finder.restart}
          </Button>
        ) : null}
      </div>

      {done && result ? (
        <FinderOutcome content={content} result={result} both={answers.need === "both"} format={format} onApply={onApply} />
      ) : (
        <div className="mt-8">
          <div className="flex items-center gap-4">
            <p className="shrink-0 text-xs font-medium text-muted-foreground">
              {fill(finder.progress, { current: index + 1, total: steps.length })}
            </p>
            <Progress value={((index + 1) / steps.length) * 100} className="h-1.5" />
          </div>
          <FinderStep
            key={steps[index]}
            stepKey={steps[index]}
            content={content}
            value={answers[steps[index]]}
            onAnswer={(value) => answer(steps[index], value as never)}
          />
          {index > 0 ? (
            <Button variant="ghost" size="sm" className="mt-4 rounded-full" onClick={() => setIndex(index - 1)}>
              <ArrowLeft data-icon="inline-start" />
              {finder.back}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function FinderStep({
  stepKey,
  content,
  value,
  onAnswer,
}: {
  stepKey: StepKey;
  content: SimulatorContent;
  value: string | undefined;
  onAnswer: (value: string) => void;
}) {
  const question = content.finder[stepKey];
  const options = question.options as FinderOption<string>[];
  const labelId = `finder-${stepKey}`;
  const wide = options.length > 4;

  return (
    <div className="mt-6">
      <p id={labelId} className="text-lg font-semibold tracking-tight">
        {question.question}
      </p>
      <RadioGroup
        aria-labelledby={labelId}
        value={value ?? ""}
        onValueChange={onAnswer}
        className={cn("mt-4 grid gap-3 sm:grid-cols-2", wide ? "lg:grid-cols-3" : "lg:grid-cols-4")}
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            className={cn(
              "group flex flex-col gap-2 rounded-2xl border bg-card/70 p-4 text-left transition-all outline-none",
              "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
              "focus-visible:ring-3 focus-visible:ring-ring/50",
              "data-checked:border-primary data-checked:bg-primary/[0.06]",
            )}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold">{option.title}</span>
              <span
                aria-hidden
                className="flex size-4 shrink-0 items-center justify-center rounded-full border border-input group-data-checked:border-primary group-data-checked:bg-primary"
              >
                <span className="size-1.5 rounded-full bg-primary-foreground opacity-0 group-data-checked:opacity-100" />
              </span>
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">{option.description}</span>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroup>
    </div>
  );
}

function FinderOutcome({
  content,
  result,
  both,
  format,
  onApply,
}: {
  content: SimulatorContent;
  result: FinderResult;
  both: boolean;
  format: PriceFormat;
  onApply: (result: FinderResult) => void;
}) {
  const { finder, services, invite } = content;
  let title = finder.result.commission;
  let price = "";
  let caption = "";

  if (result.need === "serve" && result.planId) {
    const plan = services.plans.find((candidate) => candidate.id === result.planId);
    title = fill(finder.result.plan, { plan: plan?.name ?? "" });
    const quote = quoteForService(result.planId, result.servers ?? 1, false, format.currency);
    price = quote.monthlyTotal === null ? content.onQuote : format.money(quote.monthlyTotal);
    caption = quote.monthlyTotal === null ? plan?.audience ?? "" : services.perMonth;
  } else if (result.need === "invite") {
    const quote = quoteForGuests(result.guests ?? 0, format.currency);
    const tier = quote.tier === FREE_TIER ? invite.result.freeLabel : quote.tier;
    title = fill(finder.result.tier, { tier });
    price = quote.tier === FREE_TIER ? invite.result.freeLabel : format.money(quote.totalMinor);
    caption = quote.tier === FREE_TIER ? invite.result.freeNote : invite.result.paymentNote;
  } else {
    const ticketPrice = ticketPriceField(format.currency);
    const quote = quoteForSales(ticketPrice.toMinor(ticketPrice.initial), result.tickets ?? 0);
    price = format.money(quote.commission);
    caption = `${format.number(result.tickets ?? 0)} × ${format.money(ticketPrice.toMinor(ticketPrice.initial))}`;
  }

  return (
    <div className="mt-8 grid gap-6 rounded-3xl border border-primary/20 bg-background/80 p-6 shadow-xl shadow-primary/5 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          <Sparkles className="size-3.5" />
          {finder.result.eyebrow}
        </p>
        <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{title}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">{price}</p>
        <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
        {both ? <p className="mt-4 text-sm text-muted-foreground">{finder.result.bothNote}</p> : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
        <Button size="lg" className="rounded-full" onClick={() => onApply(result)}>
          {finder.result.seeDetail}
          <ArrowRight data-icon="inline-end" />
        </Button>
        <Button size="lg" variant="outline" className="rounded-full" asChild>
          <Link href={ROUTES.REGISTER}>{finder.result.create}</Link>
        </Button>
      </div>
    </div>
  );
}
