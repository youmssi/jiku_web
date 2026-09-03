import {
  Mail,
  Users,
  QrCode,
  Wifi,
  Palette,
  BarChart3,
  Layers,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import { JikūLogo } from "@/components/ui/jiku-logo";
import type { LandingContent } from "./content";

// Icons and animated visuals are positional: they pair with the content items
// in order (invitations, RSVP, tickets, categories, transfer, offline, branding,
// dashboard). Both arrays must stay the same length as `content.features.items`
// — a shorter one renders `undefined` as a component and breaks the page.
const FEATURE_ICONS: LucideIcon[] = [
  Mail,
  Users,
  QrCode,
  Layers,
  ArrowLeftRight,
  Wifi,
  Palette,
  BarChart3,
];
type VisualKind =
  | "mail"
  | "users"
  | "qr"
  | "layers"
  | "transfer"
  | "wifi"
  | "palette"
  | "chart";
const FEATURE_VISUALS: VisualKind[] = [
  "mail",
  "users",
  "qr",
  "layers",
  "transfer",
  "wifi",
  "palette",
  "chart",
];

// ─── Animated visuals per feature (SMIL — renders server-side) ────
function MailVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      <rect x="15" y="20" width="70" height="45" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M15 20 L50 45 L85 20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="25" y1="52" x2="45" y2="52" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="25" y1="58" x2="40" y2="58" stroke="currentColor" strokeWidth="1" opacity="0.15" />
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
      <circle cx="35" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M20 62 Q35 48 50 62" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="65" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M50 62 Q65 48 80 62" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="50" cy="40" r="4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <animate attributeName="r" values="4;15;4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
      <path d="M44 40 L48 44 L56 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function QRVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      <rect x="20" y="15" width="60" height="55" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      {[
        [25, 20], [30, 20], [35, 20], [40, 20], [45, 20],
        [25, 25], [30, 25], [40, 25], [45, 25],
        [25, 30], [30, 30], [35, 30], [40, 30], [45, 30],
        [25, 35], [35, 35], [45, 35],
        [25, 40], [30, 40], [35, 40], [40, 40], [45, 40],
        [60, 20], [65, 20], [70, 20],
        [60, 25], [65, 25], [70, 25],
        [60, 30], [70, 30],
        [60, 40], [70, 40],
        [25, 50], [30, 50], [40, 50], [45, 50], [70, 50],
        [60, 55], [70, 55],
        [40, 55], [45, 55],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" begin={`${i * 0.05}s`} repeatCount="indefinite" />
        </rect>
      ))}
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
      <rect x="30" y="25" width="40" height="35" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <rect x="45" y="50" width="10" height="5" rx="1" fill="currentColor" opacity="0.3" />
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
      <path d="M25 40 Q20 35 25 30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" values="0 25 35;360 25 35" dur="3s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function PaletteVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      <circle cx="50" cy="40" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
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
      <path d="M15 65 Q30 55 45 62 Q60 69 75 58 Q85 52 90 55" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25">
        <animate attributeName="opacity" values="0.25;0.5;0.25" dur="2.5s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function ChartVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      <line x1="15" y1="20" x2="15" y2="65" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <line x1="15" y1="65" x2="85" y2="65" stroke="currentColor" strokeWidth="1" opacity="0.15" />
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
      <polyline points="25,55 38,35 51,42 64,28 77,32" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
      </polyline>
    </svg>
  );
}

// Trois bandes de hauteurs différentes : des catégories qui se remplissent
// chacune à son rythme, ce que le carré VIP et la salle font réellement.
function LayersVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      <rect x="18" y="14" width="64" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <rect x="18" y="14" width="46" height="14" rx="4" fill="currentColor" opacity="0.55">
        <animate attributeName="width" values="20;46;20" dur="3.2s" repeatCount="indefinite" />
      </rect>
      <rect x="18" y="33" width="64" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <rect x="18" y="33" width="30" height="14" rx="4" fill="currentColor" opacity="0.4">
        <animate attributeName="width" values="12;30;12" dur="3.2s" begin="0.5s" repeatCount="indefinite" />
      </rect>
      <rect x="18" y="52" width="64" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <rect x="18" y="52" width="58" height="14" rx="4" fill="currentColor" opacity="0.3">
        <animate attributeName="width" values="24;58;24" dur="3.2s" begin="1s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

// Un jeton qui passe d'une personne à l'autre : la place change de main, la
// jauge de l'événement ne bouge pas.
function TransferVisual() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      <circle cx="22" cy="40" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <circle cx="78" cy="40" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path d="M36 33 H64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M58 27 L64 33 L58 39" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path d="M64 47 H36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
      <path d="M42 41 L36 47 L42 53" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.2" />
      <rect x="17" y="35" width="10" height="10" rx="2" fill="currentColor" opacity="0.7">
        <animate attributeName="x" values="17;73;17" dur="3.4s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

function AnimatedVisual({ type }: { type: VisualKind }) {
  switch (type) {
    case "layers": return <LayersVisual />;
    case "transfer": return <TransferVisual />;
    case "mail": return <MailVisual />;
    case "users": return <UsersVisual />;
    case "qr": return <QRVisual />;
    case "wifi": return <WifiVisual />;
    case "palette": return <PaletteVisual />;
    case "chart": return <ChartVisual />;
  }
}

// ─── Feature Card ─────────────────────────────────────────────────
function FeatureCard({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  const Icon = FEATURE_ICONS[index];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-6 transition-all duration-500 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
          <Icon className="size-6" />
        </div>
        <div className="size-14 text-primary/30 transition-all duration-300 group-hover:text-primary/50">
          <AnimatedVisual type={FEATURE_VISUALS[index]} />
        </div>
      </div>

      <h3 className="mb-2 text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

// ─── Features Section ─────────────────────────────────────────────
export function FeaturesSection({ content }: { content: LandingContent["features"] }) {
  return (
    <section id="features" className="border-t border-border/30 py-24">
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

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
