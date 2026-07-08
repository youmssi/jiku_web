"use client";

import { ArrowDown } from "lucide-react";
import { CalendarCheck, Upload, Mail, Scan } from "lucide-react";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { useOnScreen } from "@/hooks/use-on-screen";

// ─── Step data ────────────────────────────────────────────────────
interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Create your event",
    description: "Set up your event details, configure settings like transfer rules, and customize your branding — all in a few clicks.",
  },
  {
    number: "02",
    title: "Import your guests",
    description: "Upload your guest list via CSV or add guests individually. Jikū validates every row and flags duplicates before you send.",
  },
  {
    number: "03",
    title: "Send invitations",
    description: "Send beautifully branded invitations via email, WhatsApp, or both. Track delivery status and resend failed ones automatically.",
  },
  {
    number: "04",
    title: "Check guests in",
    description: "Use the QR scanner or search to check guests in — online or offline. The PWA works on any device, even without internet.",
  },
];

const STEP_ICONS = [CalendarCheck, Upload, Mail, Scan] as const;
const STEP_GRADIENTS = [
  "from-primary/20 via-primary/10 to-transparent",
  "from-blue-500/20 via-blue-500/10 to-transparent",
  "from-emerald-500/20 via-emerald-500/10 to-transparent",
  "from-amber-500/20 via-amber-500/10 to-transparent",
] as const;

// ─── Step Card ────────────────────────────────────────────────────
function StepCard({ step, index }: { step: Step; index: number }) {
  const { ref, visible } = useOnScreen(0.15);
  const Icon = STEP_ICONS[index];
  const isLast = index === STEPS.length - 1;

  return (
    <div
      ref={ref}
      className="group relative"
      style={{
        transition: `all 0.7s ease ${index * 120}ms`,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Step card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-6 transition-all duration-500 hover:border-primary/20 hover:shadow-lg">
        {/* Gradient background */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${STEP_GRADIENTS[index]} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

        <div className="relative z-10">
          {/* Icon + number */}
          <div className="mb-4 flex items-center justify-between">
            <div className={`flex size-14 items-center justify-center rounded-2xl text-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${
              index === 0 ? "bg-primary/15" :
              index === 1 ? "bg-blue-500/15" :
              index === 2 ? "bg-emerald-500/15" :
              "bg-amber-500/15"
            }`}>
              <Icon className="size-6" />
            </div>
            <span className="text-3xl font-bold tracking-tighter text-foreground/10">
              {step.number}
            </span>
          </div>

          <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </p>
        </div>
      </div>

      {/* Connector */}
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

// ─── How It Works Section ─────────────────────────────────────────
export function HowItWorksSection() {
  const { ref, visible } = useOnScreen(0.1);

  return (
    <section id="how-it-works" className="border-t border-border/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div
          ref={ref}
          className="mx-auto max-w-2xl text-center transition-all duration-700"
          style={{
            transform: visible ? "translateY(0)" : "translateY(24px)",
            opacity: visible ? 1 : 0,
          }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm shadow-primary/5">
            <JikūLogo variant="mark" className="size-3.5" />
            Simple workflow
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            From guest list to check-in in minutes
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Four simple steps to run your event, whether it&apos;s an intimate
            gathering or a large conference.
          </p>
        </div>

        {/* Steps grid */}
        <div className="mt-16 grid gap-6 lg:grid-cols-4 lg:gap-0">
          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
