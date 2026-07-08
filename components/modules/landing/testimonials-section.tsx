"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { useOnScreen } from "@/hooks/use-on-screen";

// ─── Data ─────────────────────────────────────────────────────────
interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Jikū transformed how we manage our annual conference. The offline check-in saved us when the venue WiFi went down — we processed 300 guests without skipping a beat.",
    name: "Sarah Kamau",
    role: "Event Director, Nairobi Tech Summit",
    avatar: "SK",
    rating: 5,
  },
  {
    quote: "The WhatsApp integration is a game-changer. Our guests actually open the invitations, and the RSVP rate jumped from 40% to 85% compared to email-only.",
    name: "Amadou Diallo",
    role: "Operations Lead, Dakar Music Festival",
    avatar: "AD",
    rating: 5,
  },
  {
    quote: "We evaluated five platforms before choosing Jikū. The white-label branding means our corporate clients see our brand, not a third-party tool. It looks like we built it ourselves.",
    name: "Fatima Ouedraogo",
    role: "CEO, Events Pro Ouaga",
    avatar: "FO",
    rating: 5,
  },
];

// ─── Stars ────────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────
function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  const { ref, visible } = useOnScreen(0.15);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-7 transition-all duration-700 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
      style={{
        transitionDelay: `${index * 120}ms`,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Gradient border effect */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "linear-gradient(135deg, hsla(var(--primary), 0.08), transparent 50%, transparent)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-5">
        {/* Stars */}
        <Stars count={testimonial.rating} />

        {/* Quote */}
        <blockquote className="text-sm leading-relaxed text-muted-foreground">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/20">
          <Avatar className="size-10 border-2 border-border/30">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {testimonial.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{testimonial.name}</div>
            <div className="text-xs text-muted-foreground">{testimonial.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trust indicator row ──────────────────────────────────────────
function TrustBar() {
  return (
    <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <svg className="size-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        99.9% uptime SLA
      </span>
      <span className="inline-flex items-center gap-1.5">
        <svg className="size-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        SOC 2 compliant
      </span>
      <span className="inline-flex items-center gap-1.5">
        <svg className="size-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        GDPR compliant
      </span>
      <span className="inline-flex items-center gap-1.5">
        <svg className="size-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        256-bit encryption
      </span>
    </div>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────
export function TestimonialsSection() {
  const { ref, visible } = useOnScreen(0.1);

  return (
    <section className="border-t border-border/30 py-24">
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
            Trusted by organizers
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by event professionals
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            From intimate galas to large-scale conferences, organizers rely on
            Jikū to deliver flawless experiences.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={i} />
          ))}
        </div>

        {/* Trust indicators */}
        <TrustBar />
      </div>
    </section>
  );
}
