"use client";

import {
  Mail,
  Users,
  QrCode,
  Wifi,
  Palette,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { useOnScreen } from "@/hooks/use-on-screen";

// ─── Interface ────────────────────────────────────────────────────
interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  visual: "mail" | "users" | "qr" | "wifi" | "palette" | "chart";
}

const FEATURES: Feature[] = [
  {
    title: "Multi-channel invitations",
    description: "Send beautifully branded invitations via email and WhatsApp. Track delivery status and resend failed ones automatically.",
    icon: Mail,
    visual: "mail",
  },
  {
    title: "Smart RSVP tracking",
    description: "Guests confirm or decline with one tap. See real-time attendance numbers and send reminders to pending guests.",
    icon: Users,
    visual: "users",
  },
  {
    title: "Digital tickets & QR codes",
    description: "Every confirmed guest gets a unique, cryptographically signed QR ticket. Tamper-proof and scan-ready at the door.",
    icon: QrCode,
    visual: "qr",
  },
  {
    title: "Offline-capable check-in",
    description: "Works even when the venue network drops. Syncs guest lists locally and queues check-ins for background upload.",
    icon: Wifi,
    visual: "wifi",
  },
  {
    title: "White-label branding",
    description: "Your logo, your colors, your domain. Guests see your brand — not ours — on every invitation, ticket, and page.",
    icon: Palette,
    visual: "palette",
  },
  {
    title: "Live event dashboard",
    description: "Monitor invitations sent, RSVPs received, and guests checked in — all updating in real time from a single screen.",
    icon: BarChart3,
    visual: "chart",
  },
];

// ─── Animated visuals per feature ─────────────────────────────────
function MailVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      {/* Envelope */}
      <rect x="15" y="20" width="70" height="45" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      {/* Flap */}
      <path d="M15 20 L50 45 L85 20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* Lines */}
      <line x1="25" y1="52" x2="45" y2="52" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="25" y1="58" x2="40" y2="58" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      {/* Animated dot */}
      <circle cx="50" cy="45" r="3" fill="currentColor">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function UsersVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      {/* Person A - left */}
      <circle cx="35" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M20 62 Q35 48 50 62" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      {/* Person B - right */}
      <circle cx="65" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M50 62 Q65 48 80 62" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      {/* Pulse between them */}
      <circle cx="50" cy="40" r="4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <animate attributeName="r" values="4;15;4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Check mark */}
      <path d="M44 40 L48 44 L56 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function QRVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      {/* QR code pattern - simplified */}
      <rect x="20" y="15" width="60" height="55" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      {/* QR modules */}
      {[
        [25,20],[30,20],[35,20],[40,20],[45,20],
        [25,25],[30,25],[40,25],[45,25],
        [25,30],[30,30],[35,30],[40,30],[45,30],
        [25,35],[35,35],[45,35],
        [25,40],[30,40],[35,40],[40,40],[45,40],
        [60,20],[65,20],[70,20],
        [60,25],[65,25],[70,25],
        [60,30],[70,30],
        [60,40],[70,40],
        [25,50],[30,50],[40,50],[45,50],[70,50],
        [60,55],[70,55],
        [40,55],[45,55],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" begin={`${i * 0.05}s`} repeatCount="indefinite" />
        </rect>
      ))}
      {/* Scan line */}
      <line x1="18" y1="50" x2="82" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.5">
        <animate attributeName="y1" values="18;62;18" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y2" values="18;62;18" dur="2s" repeatCount="indefinite" />
      </line>
    </svg>
  );
}

function WifiVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      {/* Device */}
      <rect x="30" y="25" width="40" height="35" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <rect x="45" y="50" width="10" height="5" rx="1" fill="currentColor" opacity="0.3" />
      {/* Signal bars */}
      <rect x="72" y="45" width="3" height="8" rx="1" fill="currentColor" opacity="0.3">
        <animate attributeName="height" values="4;8;12;8;4" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="y" values="49;45;41;45;49" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <rect x="77" y="41" width="3" height="12" rx="1" fill="currentColor" opacity="0.3">
        <animate attributeName="height" values="6;12;16;12;6" dur="1.5s" begin="0.1s" repeatCount="indefinite" />
        <animate attributeName="y" values="47;41;37;41;47" dur="1.5s" begin="0.1s" repeatCount="indefinite" />
      </rect>
      <rect x="82" y="37" width="3" height="16" rx="1" fill="currentColor" opacity="0.3">
        <animate attributeName="height" values="8;16;20;16;8" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
        <animate attributeName="y" values="45;37;33;37;45" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
      </rect>
      {/* Sync arrows */}
      <path d="M25 40 Q20 35 25 30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" values="0 25 35;360 25 35" dur="3s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function PaletteVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      {/* Palette circle */}
      <circle cx="50" cy="40" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      {/* Color swatches */}
      <circle cx="50" cy="22" r="7" fill="currentColor" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="68" cy="34" r="7" fill="currentColor" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin="0.3s" repeatCount="indefinite" />
      </circle>
      <circle cx="62" cy="56" r="7" fill="currentColor" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" begin="0.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="38" cy="56" r="7" fill="currentColor" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" begin="0.9s" repeatCount="indefinite" />
      </circle>
      <circle cx="32" cy="34" r="7" fill="currentColor" opacity="0.35">
        <animate attributeName="opacity" values="0.35;0.75;0.35" dur="2s" begin="1.2s" repeatCount="indefinite" />
      </circle>
      {/* Brush stroke */}
      <path d="M15 65 Q30 55 45 62 Q60 69 75 58 Q85 52 90 55" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25">
        <animate attributeName="opacity" values="0.25;0.5;0.25" dur="2.5s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function ChartVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      {/* Grid lines */}
      <line x1="15" y1="20" x2="15" y2="65" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="15" y1="65" x2="85" y2="65" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      {/* Animated bars */}
      <rect x="25" y="50" width="8" height="15" rx="1.5" fill="currentColor" opacity="0.4">
        <animate attributeName="height" values="10;15;20;15;10" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="y" values="55;50;45;50;55" dur="1.5s" repeatCount="indefinite" />
      </rect>
      <rect x="38" y="40" width="8" height="25" rx="1.5" fill="currentColor" opacity="0.6">
        <animate attributeName="height" values="15;25;35;25;15" dur="1.5s" begin="0.1s" repeatCount="indefinite" />
        <animate attributeName="y" values="50;40;30;40;50" dur="1.5s" begin="0.1s" repeatCount="indefinite" />
      </rect>
      <rect x="51" y="45" width="8" height="20" rx="1.5" fill="currentColor" opacity="0.5">
        <animate attributeName="height" values="12;20;28;20;12" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
        <animate attributeName="y" values="53;45;37;45;53" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
      </rect>
      <rect x="64" y="35" width="8" height="30" rx="1.5" fill="currentColor" opacity="0.7">
        <animate attributeName="height" values="18;30;40;30;18" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
        <animate attributeName="y" values="47;35;25;35;47" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
      </rect>
      {/* Trend line */}
      <polyline points="25,55 38,35 51,42 64,28 77,32" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
      </polyline>
    </svg>
  );
}

function AnimatedVisual({ type }: { type: Feature["visual"] }) {
  switch (type) {
    case "mail": return <MailVisual />;
    case "users": return <UsersVisual />;
    case "qr": return <QRVisual />;
    case "wifi": return <WifiVisual />;
    case "palette": return <PaletteVisual />;
    case "chart": return <ChartVisual />;
  }
}

// ─── Feature Card ─────────────────────────────────────────────────
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const { ref, visible } = useOnScreen(0.1);
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-6 transition-all duration-700 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5"
      style={{
        transitionDelay: `${index * 80}ms`,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Top icon & visual */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
          <Icon className="size-6" />
        </div>
        <div className="size-14 text-primary/30 transition-all duration-300 group-hover:text-primary/50">
          <AnimatedVisual type={feature.visual} />
        </div>
      </div>

      <h3 className="mb-2 text-base font-semibold tracking-tight">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
    </div>
  );
}

// ─── Features Section ─────────────────────────────────────────────
export function FeaturesSection() {
  const { ref, visible } = useOnScreen(0.1);

  return (
    <section id="features" className="border-t border-border/30 py-24">
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
            Everything you need
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Run your event from start to finish
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            From the first invitation to the last check-in, Jikū handles every
            step so you can focus on hosting.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
