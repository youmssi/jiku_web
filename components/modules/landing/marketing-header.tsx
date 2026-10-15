import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/shared";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { LANDING_CONTENT } from "./content";

/** What the header of a standalone marketing page says, in one locale. */
export interface MarketingNavContent {
  home: string;
  signIn: string;
  createAccount: string;
  /** The other language: the link keeps this page and changes only the locale. */
  switchLocale: { label: string; locale: "fr" | "en"; ariaLabel: string };
}

/**
 * The sticky header of the standalone marketing pages (use cases, simulator,
 * FAQ, birthday card, invitation texts): the logo back home, the landing's
 * own navigation from 1024px up so every page offers the same way around
 * (JIKU-234), the other language for the same page at [path], and the two
 * account buttons.
 */
export function MarketingHeader({ nav, path }: { nav: MarketingNavContent; path: string }) {
  const locale = nav.switchLocale.locale === "en" ? "fr" : "en";
  const links = LANDING_CONTENT[locale].nav.links.map((link) => ({
    ...link,
    href: link.href.startsWith("#") ? `/${link.href}` : link.href,
  }));
  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href={ROUTES.HOME} className="inline-flex items-center gap-2.5">
          <JikūLogo variant="mark" className="size-7" />
          <span className="font-semibold tracking-tight">Jikū</span>
        </Link>
        <nav aria-label={LANDING_CONTENT[locale].nav.label} className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.href === path ? "page" : undefined}
              className="py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href={path}
            locale={nav.switchLocale.locale}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {nav.switchLocale.label}
            <span className="sr-only">, {nav.switchLocale.ariaLabel}</span>
          </Link>
          <Button variant="ghost" className="hidden h-9 rounded-full px-4 text-sm sm:inline-flex" asChild>
            <Link href={ROUTES.LOGIN}>{nav.signIn}</Link>
          </Button>
          <Button className="h-9 rounded-full px-4 text-sm" asChild>
            <TrackedLink eventName="cta_click" eventProperties={{ location: "header" }} href={ROUTES.REGISTER}>{nav.createAccount}</TrackedLink>
          </Button>
        </div>
      </div>
    </header>
  );
}
