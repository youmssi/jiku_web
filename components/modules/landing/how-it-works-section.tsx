import { ArrowDown, CalendarCheck, Upload, Mail, Scan } from "lucide-react";
import { JikūLogo } from "@/components/ui/jiku-logo";
import type { LandingContent } from "./content";

const STEP_ICONS = [CalendarCheck, Upload, Mail, Scan] as const;
const STEP_GRADIENTS = [
  "from-primary/20 via-primary/10 to-transparent",
  "from-blue-500/20 via-blue-500/10 to-transparent",
  "from-emerald-500/20 via-emerald-500/10 to-transparent",
  "from-amber-500/20 via-amber-500/10 to-transparent",
] as const;
const STEP_ICON_BACKGROUNDS = [
  "bg-primary/15",
  "bg-blue-500/15",
  "bg-emerald-500/15",
  "bg-amber-500/15",
] as const;

function StepCard({
  title,
  description,
  index,
  isLast,
}: {
  title: string;
  description: string;
  index: number;
  isLast: boolean;
}) {
  const Icon = STEP_ICONS[index];

  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-6 transition-all duration-500 hover:border-primary/20 hover:shadow-lg">
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${STEP_GRADIENTS[index]} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div
              className={`flex size-14 items-center justify-center rounded-2xl text-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${STEP_ICON_BACKGROUNDS[index]}`}
            >
              <Icon className="size-6" />
            </div>
            <span className="text-3xl font-bold tracking-tighter text-foreground/10">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>

      {!isLast && (
        <div className="hidden lg:flex justify-center py-4">
          <div className="flex h-10 w-px items-center justify-center bg-gradient-to-b from-primary/30 via-primary/20 to-transparent">
            <ArrowDown className="size-4 text-primary/40 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}

export function HowItWorksSection({ content }: { content: LandingContent["howItWorks"] }) {
  return (
    <section id="how-it-works" className="border-t border-border/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm shadow-primary/5">
            <JikūLogo variant="mark" className="size-3.5" />
            {content.badge}
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {content.heading}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {content.subheading}
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-4 lg:gap-0">
          {content.steps.map((step, i) => (
            <StepCard
              key={step.title}
              title={step.title}
              description={step.description}
              index={i}
              isLast={i === content.steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
