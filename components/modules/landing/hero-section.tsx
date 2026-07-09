"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { useOnScreen } from "@/hooks/use-on-screen";
import { ROUTES } from "@/lib/constants";
import type { LandingContent } from "./content";

// ─── Character-by-character animation ─────────────────────────────
// The swap is reveal-only: the next word appears immediately with a staggered
// character rise, so the headline never sits with a blank gap (a full-page
// screenshot at any moment always shows a word).
function AnimatedWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"entering" | "visible">("visible");

  useEffect(() => {
    let reveal: ReturnType<typeof setTimeout> | undefined;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
      setPhase("entering");
      reveal = setTimeout(() => setPhase("visible"), 50);
    }, 3200);
    return () => {
      clearInterval(interval);
      clearTimeout(reveal);
    };
  }, [words.length]);

  const chars = words[index].split("");

  return (
    <span
      className="relative inline-flex overflow-hidden align-bottom"
      style={{ height: "1.05em" }}
    >
      {chars.map((char, i) => (
        <span
          key={`${index}-${i}`}
          className="inline-block transition-all duration-300"
          style={{
            opacity: phase === "entering" ? 0 : 1,
            transform: phase === "entering" ? "translateY(0.5em)" : "translateY(0)",
            transitionDelay: phase === "entering" ? "0ms" : `${i * 35}ms`,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// ─── Background grid ──────────────────────────────────────────────
function BackgroundGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
    </div>
  );
}

// ─── Gradient orbs ────────────────────────────────────────────────
function GradientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-[10%] -top-[20%] size-[50vw] max-h-[700px] max-w-[700px] rounded-full bg-primary/8 blur-[120px]" />
      <div className="absolute -bottom-[20%] -right-[10%] size-[45vw] max-h-[600px] max-w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute left-[30%] top-[60%] size-[30vw] max-h-[400px] max-w-[400px] rounded-full bg-primary/3 blur-[100px]" />
    </div>
  );
}

// ─── Product truth item (no invented metrics — capabilities only) ──
function TruthItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────
export function HeroSection({ content }: { content: LandingContent["hero"] }) {
  const { ref, visible } = useOnScreen(0.05);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden pt-20 sm:pt-24"
    >
      <BackgroundGrid />
      <GradientOrbs />

      <div className="relative mx-auto max-w-7xl px-6 py-16 text-center sm:py-24">
        {/* Eyebrow badge */}
        <div
          className={`mb-8 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm shadow-primary/5 backdrop-blur-sm transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <JikūLogo variant="mark" className="size-3.5" />
          {content.badge}
        </div>

        {/* Main headline */}
        <h1
          className={`mx-auto max-w-5xl text-balance text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-[0.95] tracking-tight transition-all delay-200 duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {content.headlinePrefix}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
            <AnimatedWord words={content.headlineWords} />
          </span>
          <br />
          <span className="text-muted-foreground/60">{content.headlineSuffix}</span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground transition-all delay-500 duration-700 sm:text-lg ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {content.subtitle}
        </p>

        {/* CTA buttons */}
        <div
          className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all delay-700 duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Button
            asChild
            size="lg"
            className="group relative h-12 overflow-hidden rounded-full px-8 text-base shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
          >
            <Link href={ROUTES.REGISTER}>
              <span className="relative z-10 flex items-center gap-2">
                {content.primaryCta}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full px-8 text-base"
          >
            <Link href="#features">
              <QrCode className="mr-2 size-4" />
              {content.secondaryCta}
            </Link>
          </Button>
        </div>

        <p
          className={`mt-6 text-sm text-muted-foreground transition-all delay-700 duration-700 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {content.ctaNote}
        </p>

        {/* Product truths row */}
        <div
          className={`mt-16 grid grid-cols-2 gap-8 border-t border-border/30 pt-12 sm:grid-cols-4 transition-all delay-[900ms] duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {content.truths.map((truth) => (
            <TruthItem key={truth.value} value={truth.value} label={truth.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
