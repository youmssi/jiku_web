import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ROUTES, PRIVACY_ROUTE } from "@/lib/constants";

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
      { label: "Register", href: ROUTES.REGISTER },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: PRIVACY_ROUTE },
    ],
  },
] as const;

export function FooterSection() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span className="text-lg font-semibold tracking-tight">Jikū</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              White-label event invitation, ticketing, RSVP, and check-in
              platform.
            </p>
          </div>

          {/* Link groups */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className="space-y-4">
              <h4 className="text-sm font-medium">{group.title}</h4>
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

        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Jikū. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
