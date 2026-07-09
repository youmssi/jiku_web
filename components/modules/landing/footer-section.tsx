import Link from "next/link";
import { JikūLogo } from "@/components/ui/jiku-logo";
import { PRIVACY_ROUTE } from "@/lib/constants";
import type { LandingContent } from "./content";

export function FooterSection({ content }: { content: LandingContent["footer"] }) {
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
        <div className="grid gap-8 sm:grid-cols-3">
          {content.groups.map((group) => (
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
            &copy; {new Date().getFullYear()} Jikū. {content.copyright}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href={PRIVACY_ROUTE} className="hover:text-foreground transition-colors">
              {content.privacy}
            </Link>
            <span className="text-border/40">·</span>
            <span>{content.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
