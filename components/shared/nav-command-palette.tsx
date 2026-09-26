"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
// Deep import, not the admin module barrel: the barrel also re-exports
// server-only view components, which would drag server-only code into this
// client component's bundle — same reason the breadcrumb imports services'
// action directly too.
import { useAdminNavGroups } from "@/components/modules/admin/admin-nav";
import { ORGANIZER_NAV_ITEMS } from "@/components/shared/organizer-nav";

export type NavCommandPaletteVariant = "organizer" | "admin";

/**
 * Global ⌘K / Ctrl+K jump-to-page palette, shared by the organizer and admin
 * shells. `variant` picks which shell's own nav data to list — the same
 * source its sidebar renders, so the palette can never offer a page the
 * sidebar doesn't also have. The nav data (icons included) is imported here,
 * inside the client component, rather than passed in as a prop: nav items
 * carry live icon component references, which a Server Component can't hand
 * a Client Component as serializable prop data.
 */
export function NavCommandPalette({ variant }: { variant: NavCommandPaletteVariant }) {
  const t = useTranslations("shell");
  const adminGroups = useAdminNavGroups();
  const groups =
    variant === "organizer"
      ? [
          {
            label: t("palette.goTo"),
            items: ORGANIZER_NAV_ITEMS.map((item) => ({ ...item, label: t(`nav.${item.labelKey}`) })),
          },
        ]
      : adminGroups;
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key?.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="ml-auto gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <span className="hidden sm:inline">{t("palette.open")}</span>
        <Kbd>⌘K</Kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("palette.title")}
        description={t("palette.description")}
      >
        <CommandInput placeholder={t("palette.placeholder")} />
        <CommandList>
          <CommandEmpty>{t("palette.empty")}</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => (
                <CommandItem key={item.href} value={item.label} onSelect={() => go(item.href)}>
                  <item.icon />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
