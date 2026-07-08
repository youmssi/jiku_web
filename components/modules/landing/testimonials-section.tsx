"use client";

import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Jikū transformed how we manage our annual conference. The offline check-in saved us when the venue WiFi went down — we processed 300 guests without skipping a beat.",
    name: "Sarah Kamau",
    role: "Event Director, Nairobi Tech Summit",
    avatar: "SK",
  },
  {
    quote:
      "The WhatsApp integration is a game-changer. Our guests actually open the invitations, and the RSVP rate jumped from 40% to 85% compared to email-only.",
    name: "Amadou Diallo",
    role: "Operations Lead, Dakar Music Festival",
    avatar: "AD",
  },
  {
    quote:
      "We evaluated five platforms before choosing Jikū. The white-label branding means our corporate clients see our brand, not a third-party tool. It looks like we built it ourselves.",
    name: "Fatima Ouedraogo",
    role: "CEO, Events Pro Ouaga",
    avatar: "FO",
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
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

  return (
    <Card
      ref={ref}
      className={`group border-border/50 transition-all duration-700 hover:border-primary/30 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <CardContent className="flex flex-col gap-6 p-6">
        <Quote className="size-8 text-primary/30" />
        <blockquote className="text-sm leading-relaxed text-muted-foreground">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border border-border">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {testimonial.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{testimonial.name}</div>
            <div className="text-xs text-muted-foreground">
              {testimonial.role}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TestimonialsSection() {
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
    <section className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={headingRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            headingVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            Trusted by organizers
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by event professionals
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From intimate galas to large-scale conferences, organizers rely on
            Jikū to deliver flawless experiences.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
