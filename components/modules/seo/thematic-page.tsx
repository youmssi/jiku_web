import { ArrowRight, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { BreadcrumbJsonLd, FaqJsonLd, LocalBusinessJsonLd, OrganizationJsonLd } from "./structured-data";

export interface ThematicPageContent {
  eyebrow: string;
  title: string;
  /** Answers the target search query directly — the page's opening ~200 words. */
  intro: string;
  bullets: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  breadcrumbLabel: string;
  ctaHeading: string;
  ctaSubtext: string;
}

/**
 * Shared shell for the JIKU-63 thematic pages: a fast, content-first layout
 * (no client JS beyond the Accordion) with the structured data every one of
 * these pages needs — Organization + LocalBusiness (both platform-wide) and a
 * page-specific BreadcrumbList + FAQPage. Never emits `Event` schema — these
 * are evergreen marketing pages, not any organizer's actual event.
 */
export function ThematicPage({ content, siteUrl, path }: { content: ThematicPageContent; siteUrl: string; path: string }) {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-900">
      <OrganizationJsonLd siteUrl={siteUrl} />
      <LocalBusinessJsonLd siteUrl={siteUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: siteUrl },
          { name: content.breadcrumbLabel, url: `${siteUrl}${path}` },
        ]}
      />
      <FaqJsonLd items={content.faq} />

      <header className="border-b border-border/30 px-6 py-4">
        <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 text-sm font-semibold">
          <JikūLogo variant="mark" className="size-5" />
          Jikū
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-muted-foreground">
          <Link href={ROUTES.HOME} className="hover:text-foreground">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{content.breadcrumbLabel}</span>
        </nav>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <JikūLogo variant="mark" className="size-3.5" />
          {content.eyebrow}
        </div>

        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{content.title}</h1>

        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">{content.intro}</p>

        {content.bullets.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {content.bullets.map((bullet) => (
              <div key={bullet.title} className="flex gap-3 rounded-lg border border-border/50 p-4">
                <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{bullet.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{bullet.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-12 rounded-xl border border-primary/15 bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-semibold">{content.ctaHeading}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{content.ctaSubtext}</p>
          <Button asChild size="lg" className="mt-6 rounded-full px-8">
            <Link href={ROUTES.REGISTER}>
              Créer mon compte gratuit
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        {content.faq.length > 0 ? (
          <div className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight">Questions fréquentes</h2>
            <Accordion type="single" collapsible className="mt-6">
              {content.faq.map((item, i) => (
                <AccordionItem key={item.question} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : null}
      </main>
    </div>
  );
}
