"use client";

import { useEffect, useRef, useState } from "react";
import {
  Mail,
  MessageSquare,
  QrCode,
  Palette,
  BarChart3,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FEATURES: Feature[] = [
  {
    title: "Multi-channel invitations",
    description:
      "Send beautifully branded invitations via email and WhatsApp. Track delivery status and resend failed ones automatically.",
    icon: Mail,
  },
  {
    title: "Smart RSVP tracking",
    description:
      "Guests confirm or decline with one tap. See real-time attendance numbers and send reminders to pending guests.",
    icon: Users,
  },
  {
    title: "Digital tickets & QR codes",
    description:
      "Every confirmed guest gets a unique, cryptographically signed QR ticket. Tamper-proof and scan-ready at the door.",
    icon: QrCode,
  },
  {
    title: "Offline-capable check-in",
    description:
      "Works even when the venue network drops. Syncs guest lists locally and queues check-ins for background upload.",
    icon: MessageSquare,
  },
  {
    title: "White-label branding",
    description:
      "Your logo, your colors, your domain. Guests see your brand — not ours — on every invitation, ticket, and page.",
    icon: Palette,
  },
  {
    title: "Live event dashboard",
    description:
      "Monitor invitations sent, RSVPs received, and guests checked in — all updating in real time from a single screen.",
    icon: BarChart3,
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Icon = feature.icon;

  return (
    <Card
      ref={ref}
      className={`group border-border/50 transition-all duration-700 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Icon className="size-6" />
        </div>
        <CardTitle className="mb-2 text-lg">{feature.title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export function FeaturesSection() {
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
    <section id="features" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div
          ref={headingRef}
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            headingVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            Everything you need
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Run your event from start to finish
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From the first invitation to the last check-in, Jikū handles every
            step so you can focus on hosting.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
