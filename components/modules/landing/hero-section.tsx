"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

function useIntersection(ref: React.RefObject<Element | null>, threshold = 0.2) {
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
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return isVisible;
}

function AnimatedWord() {
  const words = ["invitations", "ticketing", "RSVP", "check-in"];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block min-w-[8ch] text-center transition-opacity duration-300 ${
        fade ? "opacity-100" : "opacity-0"
      }`}
    >
      {words[index]}
    </span>
  );
}

function AnimatedGradient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-1/4 -top-1/4 size-[600px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-1/4 -right-1/4 size-[500px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute left-1/2 top-0 size-[400px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
    </div>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useIntersection(sectionRef, 0.1);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden pt-16"
    >
      <AnimatedGradient />

      <div className="relative mx-auto max-w-7xl px-6 py-24 text-center">
        {/* Eyebrow badge */}
        <div
          className={`mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Sparkles className="size-3.5" />
          White-label event platform
        </div>

        {/* Main headline */}
        <h1
          className={`mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight transition-all delay-200 duration-700 sm:text-5xl md:text-6xl lg:text-7xl ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          Event{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            <AnimatedWord />
          </span>
          <br />
          made simple.
        </h1>

        {/* Subtitle */}
        <p
          className={`mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground transition-all delay-500 duration-700 sm:text-xl ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          Send invitations via email and WhatsApp, manage RSVPs, issue digital
          tickets with QR codes, and check guests in — online or offline. All
          under your own brand.
        </p>

        {/* CTA buttons */}
        <div
          className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all delay-700 duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Button asChild size="lg" className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/25">
            <Link href={ROUTES.REGISTER}>
              Start free
              <ArrowRight className="ml-2 size-4" />
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
              See features
            </Link>
          </Button>
        </div>

        {/* Stats row */}
        <div
          className={`mt-16 grid grid-cols-2 gap-8 border-t border-border/40 pt-12 sm:grid-cols-4 transition-all delay-1000 duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {[
            { label: "Invitations sent", value: "50K+" },
            { label: "Events managed", value: "1.2K+" },
            { label: "Guests checked in", value: "200K+" },
            { label: "Offline rate", value: "99.9%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold tracking-tight sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
