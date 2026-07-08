"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { ROUTES, PRIVACY_ROUTE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "App",
    links: [
      { label: "Sign in", href: ROUTES.LOGIN },
      { label: "Create account", href: ROUTES.REGISTER },
      { label: "Offline page", href: "/offline" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: PRIVACY_ROUTE },
    ],
  },
] as const;

export function FooterSection() {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <footer className="border-t border-border/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Top: Brand + Newsletter */}
        <div className="mb-12 grid gap-10 lg:grid-cols-2">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <JikūLogo variant="mark" className="size-6 text-foreground" />
              <span className="text-lg font-semibold tracking-tight">Jikū</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              White-label event invitation, ticketing, RSVP, and check-in
              platform. Built for organizers who care about their brand.
            </p>
          </div>

          {/* Newsletter */}
          <div className="space-y-3 lg:text-right">
            <p className="text-sm font-medium">Stay in the loop</p>
            <p className="text-xs text-muted-foreground">
              Product updates, tips, and event industry insights.
            </p>
            <form
              className="flex max-w-sm gap-2 lg:ml-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const email = (e.currentTarget.elements.namedItem("newsletter-email") as HTMLInputElement)?.value;
                if (email) {
                  setSubscribed(true);
                  setTimeout(() => setSubscribed(false), 3000);
                }
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                name="newsletter-email"
                type="email"
                placeholder="your@email.com"
                className="h-10 rounded-full border-border/50 bg-card/50 text-sm"
                required
                aria-label="Email address for newsletter"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-full shrink-0 bg-foreground text-background hover:bg-foreground/90"
              >
                {subscribed ? (
                  <Check className="size-4" />
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Middle: Link groups */}
        <div className="grid gap-8 sm:grid-cols-3">
          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h4>
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
            &copy; {new Date().getFullYear()} Jikū. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href={PRIVACY_ROUTE} className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <span className="text-border/40">·</span>
            <span>
              Crafted with care in Africa
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
