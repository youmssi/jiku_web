import { Link } from "@/i18n/navigation";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { TrackedAnchor } from "@/components/shared";
import { supportMailto, supportWhatsAppLink } from "@/lib/support";
import { LANDING_CONTENT, type LandingContent, type LandingLocale } from "./content";

/** The site map, the legal links, a human to write to and the other language. */
export function FooterSection({
  content,
  switchLocale,
  path = "/",
}: {
  content: LandingContent["footer"];
  switchLocale: LandingContent["nav"]["switchLocale"];
  /** The page the language link opens in the other locale; the home page by default. */
  path?: string;
}) {
  const whatsApp = supportWhatsAppLink();
  return (
    <footer className="border-t border-border/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Brand */}
        <div className="mb-12 space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <JikūLogo variant="mark" className="size-6 text-foreground" />
            <span className="text-lg font-semibold tracking-tight">Jikū</span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {content.description}
          </p>
        </div>

        {/* Link groups */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {content.groups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h2>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border/20 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Jikū. {content.copyright}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <TrackedAnchor
              href={whatsApp ?? supportMailto()}
              {...(whatsApp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              eventName={whatsApp ? "whatsapp_click" : "cta_click"}
              eventProperties={{ location: "footer", label: "contact" }}
              className="inline-flex min-h-6 items-center font-medium text-foreground transition-colors hover:underline"
            >
              {content.contact}
            </TrackedAnchor>
            <span className="text-border/40">·</span>
            <Link
              href={path}
              locale={switchLocale.label === "EN" ? "en" : "fr"}
              aria-label={switchLocale.ariaLabel}
              className="inline-flex min-h-6 items-center font-medium text-foreground transition-colors hover:underline"
            >
              {switchLocale.label}
            </Link>
            <span className="text-border/40">·</span>
            <span>{content.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** The landing page's footer, on a standalone marketing page at [path] (JIKU-230). */
export function MarketingFooter({ locale, path }: { locale: LandingLocale; path: string }) {
  const content = LANDING_CONTENT[locale];
  return <FooterSection content={content.footer} switchLocale={content.nav.switchLocale} path={path} />;
}
