"use client";

import { useEffect, useState } from "react";
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
import { ADMIN_NAV_GROUPS } from "@/components/modules/admin/admin-nav";
import { ORGANIZER_NAV_ITEMS } from "@/components/shared/organizer-nav";

const GROUPS_BY_VARIANT = {
  organizer: [{ label: "Go to", items: ORGANIZER_NAV_ITEMS }],
  admin: ADMIN_NAV_GROUPS,
};

export type NavCommandPaletteVariant = keyof typeof GROUPS_BY_VARIANT;

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
  const groups = GROUPS_BY_VARIANT[variant];
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
        <span className="hidden sm:inline">Jump to…</span>
        <Kbd>⌘K</Kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Command palette"
        description="Jump to any page"
      >
        <CommandInput placeholder="Jump to a page…" />
        <CommandList>
          <CommandEmpty>No matching page.</CommandEmpty>
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
