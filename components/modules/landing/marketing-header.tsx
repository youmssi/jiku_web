import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/** What the header of a standalone marketing page says, in one locale. */
export interface MarketingNavContent {
  home: string;
  signIn: string;
  createAccount: string;
  /** The other language: the link keeps this page and changes only the locale. */
  switchLocale: { label: string; locale: "fr" | "en"; ariaLabel: string };
}

/**
 * The sticky header of the standalone marketing pages (use cases, birthday
 * card, invitation texts): the logo back home, the other language for the
 * same page at [path], and the two account buttons.
 */
export function MarketingHeader({ nav, path }: { nav: MarketingNavContent; path: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href={ROUTES.HOME} className="inline-flex items-center gap-2.5">
          <JikūLogo variant="mark" className="size-7" />
          <span className="font-semibold tracking-tight">Jikū</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href={path}
            locale={nav.switchLocale.locale}
            aria-label={nav.switchLocale.ariaLabel}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {nav.switchLocale.label}
          </Link>
          <Button variant="ghost" className="hidden h-9 rounded-full px-4 text-sm min-[380px]:inline-flex" asChild>
            <Link href={ROUTES.LOGIN}>{nav.signIn}</Link>
          </Button>
          <Button className="h-9 rounded-full px-4 text-sm" asChild>
            <Link href={ROUTES.REGISTER}>{nav.createAccount}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
