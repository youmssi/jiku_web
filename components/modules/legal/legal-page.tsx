import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LEGAL_UPDATED } from "./company";
import { LEGAL_DOCUMENTS, LEGAL_LABELS, LEGAL_PATHS } from "./legal-content";
import type { LegalBlock, LegalDocumentId } from "./legal-types";

const ORDER: readonly LegalDocumentId[] = ["legal", "terms", "privacy"];

/** One legal document with its table of contents and links to the other two. */
export function LegalPage({ id, locale }: { id: LegalDocumentId; locale: Locale }) {
  const documents = LEGAL_DOCUMENTS[locale];
  const document = documents[id];
  const labels = LEGAL_LABELS[locale];
  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(LEGAL_UPDATED));
  const otherLocale: Locale = locale === "fr" ? "en" : "fr";

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-900">
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2.5" aria-label={labels.home}>
            <JikūLogo variant="mark" className="size-7" />
            <span className="font-semibold tracking-tight">Jikū</span>
          </Link>
          <Link
            href={LEGAL_PATHS[id]}
            locale={otherLocale}
            aria-label={labels.switchLabel}
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {labels.switchLocale}
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-12 px-6 py-14 lg:grid-cols-[14rem_1fr]">
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start print:hidden">
          <nav aria-label={labels.related} className="space-y-1">
            {ORDER.map((other) => (
              <Link
                key={other}
                href={LEGAL_PATHS[other]}
                aria-current={other === id ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-1.5 text-sm transition-colors",
                  other === id
                    ? "bg-muted font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {documents[other].title}
              </Link>
            ))}
          </nav>
          <nav aria-label={labels.contents} className="hidden lg:block">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {labels.contents}
            </p>
            <ul className="mt-2 space-y-1">
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="max-w-3xl">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{document.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {labels.updated} {updated}
          </p>
          <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">{document.intro}</p>
          <div className="mt-10 space-y-10">
            {document.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-lg font-semibold tracking-tight">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {section.body.map((block, index) => (
                    <Block key={index} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <p>{block}</p>;
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-border">
      {block.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
