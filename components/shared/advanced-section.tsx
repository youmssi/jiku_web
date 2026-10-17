"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ADVANCED_ID = "advanced-section";

const AdvancedContext = createContext<{ open: boolean; toggle: () => void }>({ open: true, toggle: () => {} });

/**
 * Rarely used settings folded under one "Advanced options" disclosure
 * (JIKU-251, JIKU-252), so a first event or service shows only what every one
 * needs. The section opens by itself when one of its settings is in use.
 */
export function AdvancedSettings({ initialOpen, children }: { initialOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(initialOpen);

  return <AdvancedContext.Provider value={{ open, toggle: () => setOpen((value) => !value) }}>{children}</AdvancedContext.Provider>;
}

export function AdvancedToggle({ label }: { label: string }) {
  const { open, toggle } = useContext(AdvancedContext);
  return (
    <Button type="button" variant="ghost" className="self-start" aria-expanded={open} aria-controls={ADVANCED_ID} onClick={toggle}>
      {label}
      <ChevronDown aria-hidden className={cn("transition-transform motion-reduce:transition-none", open && "rotate-180")} />
    </Button>
  );
}

/** Content shown only while the advanced options are open. */
export function AdvancedOnly({ children, first = false }: { children: ReactNode; first?: boolean }) {
  const { open } = useContext(AdvancedContext);
  if (!open) return null;
  return first ? <div id={ADVANCED_ID} className="contents">{children}</div> : <>{children}</>;
}
