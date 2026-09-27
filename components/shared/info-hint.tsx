"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Help on demand (JIKU-188): a small ⓘ that opens the explanation on tap,
 * instead of a sentence under every field. A popover rather than a tooltip, so
 * it works on a phone.
 */
export function InfoHint({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        aria-label={label}
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info aria-hidden className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-64 text-sm" side="top">
        {children}
      </PopoverContent>
    </Popover>
  );
}
