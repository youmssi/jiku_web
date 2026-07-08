"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck, Mail, Scan, Upload } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Create your event",
    description:
      "Set up your event details, configure settings like transfer rules, and customize your branding — all in a few clicks.",
  },
  {
    number: "02",
    title: "Import your guests",
    description:
      "Upload your guest list via CSV or add guests individually. Jikū validates every row and flags duplicates before you send.",
  },
  {
    number: "03",
    title: "Send invitations",
    description:
      "Send beautifully branded invitations via email, WhatsApp, or both. Track delivery status and resend failed ones automatically.",
  },
  {
    number: "04",
    title: "Check guests in",
    description:
      "Use the QR scanner or search to check guests in — online or offline. The PWA works on any device, even without internet.",
  },
];

const STEP_ICONS = [CalendarCheck, Upload, Mail, Scan] as const;

function StepCard({ step, index }: { step: Step; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Icon = STEP_ICONS[index];

  return (
    <div
      ref={ref}
      className={`group relative flex flex-col items-start gap-4 transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Step number & icon */}
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Icon className="size-6" />
        </div>
        <span className="text-3xl font-bold tracking-tighter text-muted-foreground/20">
          {step.number}
        </span>
      </div>

      {/* Connector line */}
      {index < STEPS.length - 1 && (
        <div className="absolute left-7 top-14 hidden h-16 w-px bg-gradient-to-b from-primary/20 to-transparent lg:block" />
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{step.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadingVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div
          ref={headingRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            headingVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            Simple workflow
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            From guest list to check-in in minutes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Four simple steps to run your event, whether it&apos;s an intimate
            gathering or a large conference.
          </p>
        </div>

        {/* Steps grid */}
        <div className="mt-16 grid gap-12 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
