import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { LANDING_CONTENT } from "@/components/modules/landing";
import { BreadcrumbJsonLd, FaqJsonLd, LocalBusinessJsonLd, OrganizationJsonLd, buildThematicMetadata, siteUrl } from "@/components/modules/seo";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";

const TITLE = "Tarifs Jikū — Invitations et billetterie d'événement en Guinée";
const DESCRIPTION =
  "Gratuit jusqu'à 100 invités par an. Ensuite, un prix unique par événement, sans abonnement : 150 000 GNF jusqu'à 300 invités, 300 000 GNF jusqu'à 600, 500 000 GNF jusqu'à 1 000.";

export const metadata: Metadata = buildThematicMetadata({
  path: SEO_ROUTES.TARIFS,
  title: TITLE,
  description: DESCRIPTION,
});

/**
 * Dedicated pricing page (JIKU-63) answering "combien coûte Jikū" directly in
 * the opening paragraph, reusing the same tier data the landing page's
 * pricing section shows (component/modules/landing/content.ts) so the two
 * surfaces can never drift out of sync.
 */
export default function TarifsPage() {
  const { pricing, faq } = LANDING_CONTENT.fr;
  const pricingFaq = faq.items.filter((item) =>
    ["Combien ça coûte", "abonnement", "événement"].some((marker) => item.question.includes(marker)),
  );
  const faqItems = pricingFaq.length > 0 ? pricingFaq : faq.items.slice(0, 3);
  const url = siteUrl();

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-900">
      <OrganizationJsonLd siteUrl={url} />
      <LocalBusinessJsonLd siteUrl={url} />
      <BreadcrumbJsonLd items={[{ name: "Accueil", url }, { name: "Tarifs", url: `${url}${SEO_ROUTES.TARIFS}` }]} />
      <FaqJsonLd items={faqItems} />

      <header className="border-b border-border/30 px-6 py-4">
        <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 text-sm font-semibold">
          <JikūLogo variant="mark" className="size-5" />
          Jikū
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-muted-foreground">
          <Link href={ROUTES.HOME} className="hover:text-foreground">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Tarifs</span>
        </nav>

        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Tarifs Jikū : gratuit jusqu&apos;à 100 invités, puis un prix unique par événement
        </h1>

        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Jikū est gratuit jusqu&apos;à 100 invités cumulés sur votre compte, sur une année glissante — de quoi
          organiser un premier mariage, baptême ou séminaire sans rien payer. Au-delà, vous réglez un montant
          unique pour l&apos;événement, selon son nombre d&apos;invités : 150 000 GNF jusqu&apos;à 300 invités,
          300 000 GNF jusqu&apos;à 600, 500 000 GNF jusqu&apos;à 1 000. Aucun abonnement mensuel, aucun engagement
          — vous payez pour l&apos;événement que vous organisez, une seule fois, et toutes les fonctionnalités
          (invitations e-mail et WhatsApp, billets QR, check-in hors-ligne, marque blanche) sont incluses à
          chaque niveau.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pricing.tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-6 ${tier.highlighted ? "border-primary bg-primary/5" : "border-border/50"}`}
            >
              {tier.highlighted ? (
                <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  {pricing.highlightLabel}
                </span>
              ) : null}
              <p className="text-sm font-medium text-muted-foreground">{tier.name}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">{tier.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {pricing.upToTemplate.replace("{guests}", tier.guests)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-border/50 p-6">
          <p className="font-medium">{pricing.everyEventIncludesTitle}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {pricing.everyEventIncludes.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 shrink-0 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{pricing.note}</p>

        <div className="mt-12 rounded-xl border border-primary/15 bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-semibold">Prêt à créer votre événement ?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Créez un compte gratuit et commencez avec jusqu&apos;à 100 invités sans frais.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-full px-8">
            <Link href={ROUTES.REGISTER}>
              Commencer gratuitement
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
