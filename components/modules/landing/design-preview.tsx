import { ArrowRight, BellRing, Check, QrCode, ScanLine, Send } from "lucide-react";
import { LazyGrainient, MotionProvider, RotatingWords, SpotlightCard } from "@/components/effects";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { cardFontVariables } from "@/lib/card-display-fonts";
import { CardSample } from "./card-sample";
import { LANDING_CONTENT, type LandingLocale } from "./content";

// Prototype of the premium marketing direction (JIKU-221), kept out of search
// results: two hero treatments and the section effects, on the real content,
// so the direction is chosen on the real thing before any page changes.

const WARM: [string, string, string] = ["#FFF7ED", "#FDBA74", "#F9A8D4"];
const NIGHT: [string, string, string] = ["#9D174D", "#7C2D12", "#18181B"];

const COPY = {
  fr: {
    a: "Direction A — Lumière de fête (clair)",
    b: "Direction B — Nuit de gala (sombre)",
    sections: "Effets de section",
    for: "Une seule carte pour",
    occasions: ["votre mariage", "vos 30 ans", "le baptême", "votre séminaire", "votre gala"],
    bento: [
      { title: "Envoyée sur WhatsApp", text: "Un lien, un aperçu, une réponse en un geste." },
      { title: "Un billet QR par « oui »", text: "Vérifié à l'entrée, même sans réseau." },
      { title: "Rappels automatiques", text: "La veille et le jour J, sans y penser." },
      { title: "Contrôle à la porte", text: "Un proche scanne, chaque billet ne passe qu'une fois." },
    ],
  },
  en: {
    a: "Direction A — Party light (light)",
    b: "Direction B — Gala night (dark)",
    sections: "Section effects",
    for: "One card for",
    occasions: ["your wedding", "your 30th", "the christening", "your seminar", "your gala"],
    bento: [
      { title: "Sent on WhatsApp", text: "One link, a preview, an answer in one tap." },
      { title: "A QR ticket per “yes”", text: "Checked at the door, even offline." },
      { title: "Automatic reminders", text: "The day before and on the day, hands-free." },
      { title: "Door check", text: "A friend scans; each ticket gets in once." },
    ],
  },
} as const;

const BENTO_ICONS = [Send, QrCode, BellRing, ScanLine];

function Label({ children }: { children: string }) {
  return (
    <p className="mx-auto max-w-7xl px-6 pt-10 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

export function DesignPreview({ locale, siteUrl }: { locale: LandingLocale; siteUrl: string }) {
  const content = LANDING_CONTENT[locale];
  const copy = COPY[locale];
  const [elegant, modern, festive] = content.cards.samples;

  return (
    <MotionProvider>
      <main className={`bg-background ${cardFontVariables}`}>
        <Label>{copy.a}</Label>
        <section className="relative mx-4 mt-4 overflow-hidden rounded-[2rem] border border-border/50 sm:mx-6">
          <LazyGrainient
            colors={WARM}
            lightMode
            speed={0.15}
            fallback="radial-gradient(80% 60% at 20% 10%, #fde7d3 0%, transparent 60%), radial-gradient(60% 60% at 90% 80%, #f7d9e3 0%, transparent 55%), #fffaf5"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            <div className="text-center lg:text-left">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <JikūLogo variant="mark" className="size-3.5" />
                <span className="text-shine">{content.hero.badge}</span>
              </span>
              <h1 className="animate-blur-in text-balance text-[clamp(2.3rem,6vw,4.4rem)] font-bold leading-[1.03] tracking-tight text-zinc-950">
                {content.hero.headline}
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-zinc-700 [animation-delay:150ms] animate-blur-in sm:text-lg lg:mx-0">
                {content.hero.subtitle}
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                <Button size="lg" className="h-12 rounded-full bg-zinc-950 px-8 text-base text-white shadow-xl shadow-orange-900/20 hover:bg-zinc-800">
                  {content.hero.primaryCta}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-full border-black/15 bg-white/60 px-8 text-base backdrop-blur">
                  {content.hero.secondaryCta}
                </Button>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[22rem]">
              <div className="animate-float-soft">
                <CardSample sample={modern} invites={content.hero.card.invites} url={siteUrl} size="lg" className="rotate-[-3deg] shadow-2xl shadow-orange-950/25" />
              </div>
              <div className="absolute -right-6 top-1/2 hidden flex-col gap-1.5 sm:flex">
                {content.hero.card.answers.map((answer, index) => (
                  <span
                    key={answer}
                    className={
                      index === 0
                        ? "inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
                        : "rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur"
                    }
                  >
                    {index === 0 ? <Check className="mr-1 inline size-3.5" /> : null}
                    {answer}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Label>{copy.b}</Label>
        <section className="dark relative mx-4 mt-4 overflow-hidden rounded-[2rem] bg-zinc-950 text-white sm:mx-6">
          <LazyGrainient
            colors={NIGHT}
            speed={0.12}
            grain={0.12}
            fallback="radial-gradient(70% 60% at 80% 20%, rgba(157,23,77,.55) 0%, transparent 60%), radial-gradient(60% 50% at 10% 90%, rgba(124,45,18,.5) 0%, transparent 60%), #09090b"
          />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden />
          <div className="relative mx-auto max-w-5xl px-6 py-24 text-center lg:py-32">
            <p className="text-lg font-medium text-white/70">
              {copy.for}{" "}
              <RotatingWords words={[...copy.occasions]} className="font-semibold text-white" />
            </p>
            <h2 className="animate-blur-in mx-auto mt-5 max-w-4xl text-balance text-[clamp(2.3rem,6vw,4.6rem)] font-bold leading-[1.03] tracking-tight">
              {content.hero.headline}
            </h2>
            <div className="mt-10 flex justify-center gap-3">
              <Button size="lg" className="h-12 rounded-full bg-white px-8 text-base text-zinc-950 hover:bg-white/90">
                {content.hero.primaryCta}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
            <div className="mx-auto mt-16 flex max-w-4xl items-end justify-center gap-4 sm:gap-6">
              {[elegant, modern, festive].map((sample, index) => (
                <div key={sample.event} className={index === 1 ? "w-[70%] -translate-y-6 sm:w-[42%]" : "hidden w-[30%] opacity-90 sm:block"}>
                  <CardSample sample={sample} invites={content.hero.card.invites} url={siteUrl} size={index === 1 ? "lg" : undefined} className={index === 0 ? "-rotate-6" : index === 2 ? "rotate-6" : ""} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <Label>{copy.sections}</Label>
        <section className="mt-6 overflow-hidden border-y border-border/50 py-5">
          <div className="flex w-max animate-marquee gap-3">
            {[...copy.occasions, ...copy.occasions, ...copy.occasions, ...copy.occasions].map((occasion, index) => (
              <span key={`${occasion}-${index}`} className="rounded-full border border-border/60 px-5 py-2 text-sm font-medium">
                {occasion}
              </span>
            ))}
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-4 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {copy.bento.map((item, index) => {
            const Icon = BENTO_ICONS[index];
            return (
              <SpotlightCard key={item.title} className={index === 0 || index === 3 ? "lg:col-span-2" : undefined}>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </SpotlightCard>
            );
          })}
        </section>
      </main>
    </MotionProvider>
  );
}
