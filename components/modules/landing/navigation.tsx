"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { ROUTES } from "@/lib/constants";
import type { LandingContent } from "./content";

export function Navigation({ content }: { content: LandingContent["nav"] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 z-50 transition-all duration-500 ${
        isScrolled ? "top-4 px-4" : "top-0 px-0"
      }`}
    >
      <nav
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
              className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={content.switchLocale.href}
            aria-label={content.switchLocale.ariaLabel}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {content.switchLocale.label}
          </Link>
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link href={ROUTES.LOGIN}>{content.signIn}</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-sm"
            asChild
          >
            <Link href={ROUTES.REGISTER}>{content.register}</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="relative z-50 flex size-10 items-center justify-center md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? content.menuClose : content.menuOpen}
        >
          {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background pt-24 md:hidden">
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
            <Link
              href={content.switchLocale.href}
              aria-label={content.switchLocale.ariaLabel}
              onClick={() => setIsMobileOpen(false)}
              className="text-3xl font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
            >
              {content.switchLocale.label}
            </Link>
            <hr className="my-4 border-border/50" />
            <Button variant="outline" asChild className="w-full justify-center rounded-full">
              <Link href={ROUTES.LOGIN} onClick={() => setIsMobileOpen(false)}>
                {content.signIn}
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-center rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              <Link href={ROUTES.REGISTER} onClick={() => setIsMobileOpen(false)}>
                {content.register}
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
