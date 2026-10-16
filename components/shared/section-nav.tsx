"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventSubNavItem } from "@/components/shared/organizer-nav";
import { cn } from "@/lib/utils";

const LINK =
  "relative inline-flex h-11 shrink-0 items-center gap-1.5 px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring [&_svg]:size-4";
const CURRENT = "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-foreground";

/**
 * The sections of one event or service (JIKU-251, JIKU-252). Each section is
 * its own URL, so this is navigation: links marking the current page, not an
 * ARIA tab set. On a phone the first [primaryOnPhone] sections stay in sight
 * and the others open from "More", underlined (and naming the section for
 * screen readers) when the current page is one of them.
 */
export function SectionNav({
  items,
  id,
  label,
  primaryOnPhone = items.length,
}: {
  items: EventSubNavItem[];
  id: string;
  label: string;
  primaryOnPhone?: number;
}) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const active = items.find((item) => item.match(pathname, id)) ?? items[0];
  const secondary = items.slice(primaryOnPhone);
  const activeSecondary = secondary.find((item) => item.labelKey === active.labelKey);

  return (
    <nav aria-label={label} className="-mx-4 flex items-center border-b px-4">
      <ul className="flex min-w-0 flex-1 overflow-x-auto">
        {items.map((item, index) => {
          const Icon = item.icon;
          const current = item.labelKey === active.labelKey;
          return (
            <li key={item.labelKey} className={cn(index >= primaryOnPhone && "max-md:hidden")}>
              <Link href={item.href(id)} aria-current={current ? "page" : undefined} className={cn(LINK, current && CURRENT)}>
                <Icon aria-hidden className="max-md:hidden" />
                {t(`nav.${item.labelKey}`)}
              </Link>
            </li>
          );
        })}
      </ul>
      {secondary.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn("relative h-11 shrink-0 gap-1 md:hidden", activeSecondary && CURRENT)}
              aria-label={activeSecondary ? `${t("sidebar.more")} · ${t(`nav.${activeSecondary.labelKey}`)}` : undefined}
            >
              {t("sidebar.more")}
              <ChevronDown aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {secondary.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.labelKey} asChild>
                  <Link href={item.href(id)} aria-current={item.labelKey === active.labelKey ? "page" : undefined}>
                    <Icon aria-hidden />
                    {t(`nav.${item.labelKey}`)}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </nav>
  );
}
