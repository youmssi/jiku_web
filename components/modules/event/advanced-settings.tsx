"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ADVANCED_ID = "event-advanced-settings";

const AdvancedContext = createContext<{ open: boolean; toggle: () => void }>({ open: true, toggle: () => {} });

/**
 * The rarely used event settings (a client's branding, ticket rules, quorum)
 * stay folded under one "Advanced options" disclosure (JIKU-251), so a first
 * event shows only what every event needs. They open by themselves when one
 * of them is already in use.
 */
export function AdvancedSettings({ initialOpen, children }: { initialOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(initialOpen);

  return <AdvancedContext.Provider value={{ open, toggle: () => setOpen((value) => !value) }}>{children}</AdvancedContext.Provider>;
}

export function AdvancedToggle() {
  const t = useTranslations("events.settings");
  const { open, toggle } = useContext(AdvancedContext);
  return (
    <Button type="button" variant="ghost" className="self-start" aria-expanded={open} aria-controls={ADVANCED_ID} onClick={toggle}>
      {t("advanced")}
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
