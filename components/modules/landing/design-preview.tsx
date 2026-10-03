import { ArrowRight, BellRing, QrCode, ScanLine, Send } from "lucide-react";
import { CardStack, CountUp, LazyBackground, MotionProvider, OccasionShowcase, SpotlightCard } from "@/components/effects";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { cardFontVariables } from "@/lib/card-display-fonts";
import { CardSample } from "./card-sample";
import { LANDING_CONTENT, type LandingCardSample, type LandingLocale } from "./content";

// Prototype of the premium marketing direction (JIKU-221), kept out of search
// results. Every background uses the brand's neutrals only; colour comes from
// the invitation cards, which follow each occasion.

const PEARL: [string, string, string] = ["#FAFAFA", "#E4E4E7", "#F4F4F5"];
const SILVER: [string, string, string] = ["#F4F4F5", "#E4E4E7", "#F4F4F5"];
const PEARL_FALLBACK =
  "radial-gradient(70% 60% at 15% 10%, #f4f4f5 0%, transparent 60%), radial-gradient(60% 60% at 90% 85%, #e4e4e7 0%, transparent 55%), #fafafa";

interface Occasion {
  label: string;
  card: LandingCardSample;
}

const COPY: Record<
  LandingLocale,
  {
    hero: string;
    gallery: string;
    numbers: string;
    sections: string;
    lead: string;
    sentence: string;
    occasions: Occasion[];
    stack: { heading: string; text: string; label: string };
    facts: { value: number; label: string }[];
    bento: { title: string; text: string }[];
    cta: string;
  }
> = {
  fr: {
    hero: "Hero — mélange A + B, fond nacré (grain)",
    gallery: "Galerie de cartes — fond argenté (aurore)",
    numbers: "Chiffres du produit",
    sections: "Effets de section",
    lead: "Une invitation à la hauteur de",
    sentence: "Une invitation à la hauteur de votre mariage, votre anniversaire, un baptême, votre séminaire ou votre gala.",
    occasions: [
      { label: "votre mariage", card: { style: "ELEGANT", event: "Mariage d'Aïcha & Karim", organizer: "Famille Barry", when: "sam. 12 déc. · 16 h", color: "#5B3A29", photo: false } },
      { label: "vos 30 ans", card: { style: "MODERN", event: "Les 30 ans d'Aïssatou", organizer: "Maison Diallo", when: "sam. 14 nov. · 19 h", color: "#7C2D12", photo: true } },
      { label: "un baptême", card: { style: "ELEGANT", event: "Baptême de Mariam", organizer: "Famille Camara", when: "dim. 6 déc. · 11 h", color: "#3F5A73", photo: false } },
      { label: "votre séminaire", card: { style: "MODERN", event: "Séminaire annuel", organizer: "Groupe Sahel", when: "jeu. 3 déc. · 9 h", color: "#27272A", photo: false } },
      { label: "votre gala", card: { style: "FESTIVE", event: "Gala de fin d'année", organizer: "Association Horizon", when: "ven. 18 déc. · 20 h", color: "#9D174D", photo: false } },
    ],
    stack: {
      heading: "Trois styles, une carte par occasion",
      text: "Élégant, Moderne ou Festif, avec votre photo et votre couleur. Faites glisser les cartes.",
      label: "Exemples de cartes d'invitation",
    },
    facts: [
      { value: 100, label: "invités gratuits" },
      { value: 3, label: "styles de carte" },
      { value: 1, label: "billet QR par « oui »" },
      { value: 0, label: "application à installer" },
    ],
    bento: [
      { title: "Envoyée sur WhatsApp", text: "Un lien, un aperçu, une réponse en un geste." },
      { title: "Un billet QR par « oui »", text: "Vérifié à l'entrée, même sans réseau." },
      { title: "Rappels automatiques", text: "La veille et le jour J, sans y penser." },
      { title: "Contrôle à la porte", text: "Un proche scanne, chaque billet ne passe qu'une fois." },
    ],
    cta: "Créez votre première carte",
  },
  en: {
    hero: "Hero — A + B mix, pearl background (grain)",
    gallery: "Card gallery — silver background (aurora)",
    numbers: "Product numbers",
    sections: "Section effects",
    lead: "An invitation worthy of",
    sentence: "An invitation worthy of your wedding, your birthday, a christening, your seminar or your gala.",
    occasions: [
      { label: "your wedding", card: { style: "ELEGANT", event: "Aïcha & Karim's wedding", organizer: "The Barry family", when: "Sat, Dec 12 · 4 PM", color: "#5B3A29", photo: false } },
      { label: "your 30th", card: { style: "MODERN", event: "Aïssatou turns 30", organizer: "Maison Diallo", when: "Sat, Nov 14 · 7 PM", color: "#7C2D12", photo: true } },
      { label: "a christening", card: { style: "ELEGANT", event: "Mariam's christening", organizer: "The Camara family", when: "Sun, Dec 6 · 11 AM", color: "#3F5A73", photo: false } },
      { label: "your seminar", card: { style: "MODERN", event: "Annual seminar", organizer: "Sahel Group", when: "Thu, Dec 3 · 9 AM", color: "#27272A", photo: false } },
      { label: "your gala", card: { style: "FESTIVE", event: "Year-end gala", organizer: "Horizon Association", when: "Fri, Dec 18 · 8 PM", color: "#9D174D", photo: false } },
    ],
    stack: {
      heading: "Three styles, one card per occasion",
      text: "Elegant, Modern or Festive, with your photo and your colour. Drag the cards.",
      label: "Invitation card examples",
    },
    facts: [
      { value: 100, label: "guests free" },
      { value: 3, label: "card styles" },
      { value: 1, label: "QR ticket per “yes”" },
      { value: 0, label: "apps to install" },
    ],
    bento: [
      { title: "Sent on WhatsApp", text: "One link, a preview, an answer in one tap." },
      { title: "A QR ticket per “yes”", text: "Checked at the door, even offline." },
      { title: "Automatic reminders", text: "The day before and on the day, hands-free." },
      { title: "Door check", text: "A friend scans; each ticket gets in once." },
    ],
    cta: "Create your first card",
  },
};

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
  const cards = copy.occasions.map((occasion) => (
    <CardSample key={occasion.label} sample={occasion.card} invites={content.hero.card.invites} url={siteUrl} size="lg" className="size-full shadow-2xl shadow-black/15" />
  ));
  const stackCards = copy.occasions.map((occasion) => (
    <CardSample key={occasion.label} sample={occasion.card} invites={content.hero.card.invites} url={siteUrl} size="lg" className="pointer-events-none size-full" />
  ));

  return (
    <MotionProvider>
      <main className={`bg-background ${cardFontVariables}`}>
        <Label>{copy.hero}</Label>
        <section className="relative mx-4 mt-4 overflow-hidden rounded-[2rem] border border-border/60 sm:mx-6">
          <LazyBackground kind="grainient" colors={PEARL} speed={0.12} grain={0.05} contrast={1} fallback={PEARL_FALLBACK} />
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-24">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <JikūLogo variant="mark" className="size-3.5" />
              <span className="text-shine">{content.hero.badge}</span>
            </span>
            <OccasionShowcase lead={copy.lead} occasions={copy.occasions.map((occasion) => occasion.label)} cards={cards} sentence={copy.sentence}>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground animate-blur-in [animation-delay:150ms] sm:text-lg lg:mx-0">
                {content.hero.subtitle}
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                <Button size="lg" className="h-12 rounded-full px-8 text-base shadow-xl shadow-black/15">
                  {content.hero.primaryCta}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-full bg-background/60 px-8 text-base backdrop-blur">
                  {content.hero.secondaryCta}
                </Button>
              </div>
            </OccasionShowcase>
          </div>
        </section>

        <Label>{copy.gallery}</Label>
        <section className="relative mx-4 mt-4 overflow-hidden rounded-[2rem] border border-border/60 bg-zinc-50 sm:mx-6">
          <LazyBackground kind="aurora" colors={SILVER} amplitude={0.8} blend={0.8} speed={0.5} fallback="linear-gradient(180deg, #e4e4e7 0%, #fafafa 70%)" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 lg:py-24">
            <div className="text-center md:text-left">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{copy.stack.heading}</h2>
              <p className="mt-4 text-muted-foreground sm:text-lg">{copy.stack.text}</p>
            </div>
            <div className="mx-auto aspect-[4/5] w-full max-w-[18rem] sm:max-w-[20rem]">
              <CardStack cards={stackCards} label={copy.stack.label} />
            </div>
          </div>
        </section>

        <Label>{copy.numbers}</Label>
        <section className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border mx-4 mt-4 sm:mx-auto md:grid-cols-4">
          {copy.facts.map((fact) => (
            <div key={fact.label} className="bg-background px-6 py-8 text-center">
              <p className="text-4xl font-bold tracking-tight sm:text-5xl">
                <CountUp to={fact.value} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{fact.label}</p>
            </div>
          ))}
        </section>

        <Label>{copy.sections}</Label>
        <section className="mt-6 overflow-hidden border-y border-border/60 py-5">
          <div className="flex w-max animate-marquee gap-3">
            {[...copy.occasions, ...copy.occasions, ...copy.occasions, ...copy.occasions].map((occasion, index) => (
              <span key={`${occasion.label}-${index}`} className="rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground">
                {occasion.label}
              </span>
            ))}
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-4 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {copy.bento.map((item, index) => {
            const Icon = BENTO_ICONS[index];
            return (
              <SpotlightCard key={item.title} className={index === 0 || index === 3 ? "lg:col-span-2" : undefined}>
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </SpotlightCard>
            );
          })}
        </section>
        <section className="mx-4 mb-12 rounded-[2rem] bg-primary px-6 py-16 text-center text-primary-foreground sm:mx-6">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{copy.cta}</h2>
          <Button size="lg" variant="secondary" className="mt-8 h-12 rounded-full px-8 text-base">
            {content.hero.primaryCta}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </section>
      </main>
    </MotionProvider>
  );
}
