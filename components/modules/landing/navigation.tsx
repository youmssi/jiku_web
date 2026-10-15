"use client";

import { TrackedLink } from "@/components/shared";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { LandingContent } from "./content";

// ─── Language links ────────────────────────────────────────────────
// Two links rather than a switch: changing the language is navigation, not a
// setting. The next-intl Link swaps the /[locale] segment of the current URL
// and updates the locale cookie, so the proxy does not bounce the visitor back.
function LanguageLinks({
  switchLocale,
  large = false,
  onNavigate,
}: {
  switchLocale: LandingContent["nav"]["switchLocale"];
  large?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const target = switchLocale.label.toLowerCase() as Locale;
  const current: Locale = target === "fr" ? "en" : "fr";
  const base = cn("inline-flex items-center justify-center rounded-full font-semibold", large ? "min-h-11 min-w-11 text-lg" : "min-h-9 min-w-9 text-sm");

  return (
    <div className="flex items-center">
      {(["fr", "en"] as const).map((locale) =>
        locale === current ? (
          <span key={locale} aria-current="true" className={cn(base, "text-foreground")}>
            {locale.toUpperCase()}
          </span>
        ) : (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            onClick={onNavigate}
            className={cn(base, "text-muted-foreground transition-colors hover:text-foreground")}
          >
            {locale.toUpperCase()}
            <span className="sr-only">, {switchLocale.ariaLabel}</span>
          </Link>
        ),
      )}
    </div>
  );
}

export function Navigation({ content }: { content: LandingContent["nav"] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The open menu behaves as a modal dialog (JIKU-236): the page behind is
  // inert so the keyboard stays in the menu, Escape closes it, and focus goes
  // to its first link, then back to the toggle when it closes.
  useEffect(() => {
    if (!isMobileOpen) return;
    const toggle = toggleRef.current;
    const header = toggle?.closest("header");
    const outside: Element[] = [];
    for (let node: Element | null = header ?? null; node && node !== document.body; node = node.parentElement) {
      const parent = node.parentElement;
      if (parent) outside.push(...[...parent.children].filter((sibling) => sibling !== node));
    }
    document.body.style.overflow = "hidden";
    outside.forEach((element) => element.setAttribute("inert", ""));
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      outside.forEach((element) => element.removeAttribute("inert"));
      document.removeEventListener("keydown", onKeyDown);
      toggle?.focus();
    };
  }, [isMobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 z-50 transition-all duration-500 ${
        isScrolled ? "top-4 px-4" : "top-0 px-0"
      }`}
    >
      <nav
        aria-label={content.label}
        className={`mx-auto flex items-center justify-between transition-all duration-500 ${
          isScrolled || isMobileOpen
            ? "h-14 max-w-6xl rounded-2xl border border-border/30 bg-background/80 px-6 shadow-lg shadow-black/5 backdrop-blur-xl"
            : "h-20 max-w-7xl bg-transparent px-6"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <JikūLogo
            variant="mark"
            className={`text-foreground transition-all duration-500 ${
              isScrolled ? "size-6" : "size-7"
            }`}
          />
          <span
            className={`font-semibold tracking-tight transition-all duration-500 ${
              isScrolled ? "text-base" : "text-lg"
            }`}
          >
            Jikū
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {content.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-4 md:flex">
          <LanguageLinks switchLocale={content.switchLocale} />
          <Button variant="ghost" asChild className="h-9 rounded-full px-4 text-sm">
            <Link href={ROUTES.LOGIN}>{content.signIn}</Link>
          </Button>
          <Button className="h-9 rounded-full px-4 text-sm shadow-sm" asChild>
            <TrackedLink eventName="cta_click" eventProperties={{ location: "nav" }} href={ROUTES.REGISTER}>{content.register}</TrackedLink>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          ref={toggleRef}
          className="relative z-50 size-11 md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? content.menuClose : content.menuOpen}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-menu"
        >
          {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {/* Mobile menu overlay */}
      {isMobileOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label={content.label}
          className="fixed inset-0 z-40 flex flex-col bg-background pt-24 md:hidden"
        >
          <nav className="flex flex-col gap-6 px-8 pb-8">
            {content.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="text-3xl font-semibold tracking-tight text-foreground transition-colors hover:text-muted-foreground"
              >
                {link.label}
              </Link>
            ))}
            <LanguageLinks switchLocale={content.switchLocale} large onNavigate={() => setIsMobileOpen(false)} />
            <hr className="my-4 border-border/50" />
            <Button variant="outline" asChild className="h-12 w-full justify-center rounded-full text-base">
              <Link href={ROUTES.LOGIN} onClick={() => setIsMobileOpen(false)}>
                {content.signIn}
              </Link>
            </Button>
            <Button asChild className="h-12 w-full justify-center rounded-full text-base">
              <TrackedLink eventName="cta_click" eventProperties={{ location: "nav_mobile" }} href={ROUTES.REGISTER} onClick={() => setIsMobileOpen(false)}>
                {content.register}
              </TrackedLink>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
