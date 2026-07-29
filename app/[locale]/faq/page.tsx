import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { LANDING_CONTENT } from "@/components/modules/landing";
import { BreadcrumbJsonLd, FaqJsonLd, LocalBusinessJsonLd, OrganizationJsonLd, buildThematicMetadata, siteUrl } from "@/components/modules/seo";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";

const TITLE = "FAQ Jikū — Invitations, billets QR et check-in : vos questions";
const DESCRIPTION =
  "Faut-il une application ? Le check-in marche-t-il hors-ligne ? Comment les invitations WhatsApp sont-elles envoyées ? Réponses aux questions les plus posées sur Jikū.";

export const metadata: Metadata = buildThematicMetadata({
  path: SEO_ROUTES.FAQ,
  title: TITLE,
  description: DESCRIPTION,
});

/**
 * Dedicated FAQ page (JIKU-63), reusing the same question/answer content the
 * landing page's FAQ section shows so the two surfaces never drift apart.
 */
export default function FaqPage() {
  const { faq } = LANDING_CONTENT.fr;
  const url = siteUrl();

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-900">
      <OrganizationJsonLd siteUrl={url} />
      <LocalBusinessJsonLd siteUrl={url} />
      <BreadcrumbJsonLd items={[{ name: "Accueil", url }, { name: "FAQ", url: `${url}${SEO_ROUTES.FAQ}` }]} />
      <FaqJsonLd items={faq.items} />

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
          <span className="text-foreground">FAQ</span>
        </nav>

        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Questions fréquentes sur Jikū
        </h1>

        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Jikū gère l&apos;envoi des invitations par e-mail et WhatsApp, la confirmation de présence, les billets
          QR signés et le check-in le jour de l&apos;événement — sans que vos invités aient besoin d&apos;installer
          une application. Voici les réponses aux questions qu&apos;on nous pose le plus souvent, sur le
          fonctionnement hors-ligne du check-in, l&apos;envoi WhatsApp, la marque blanche, les tarifs et la
          protection des données de vos invités.
        </p>

        <Accordion type="single" collapsible className="mt-12">
          {faq.items.map((item, i) => (
            <AccordionItem key={item.question} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  );
}
