"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * On a phone, the main action stays in reach once the hero has scrolled away,
 * and steps aside when the closing call to action is on screen. Desktop keeps
 * the navigation's button instead.
 */
export function StickyCta({ label }: { label: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const targets = ["hero-cta", "final-cta"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (targets.length === 0) return;
    const visible = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
      const heroGone = window.scrollY > 0 && ![...visible.values()].some(Boolean);
      setShown(heroGone);
    });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/95 p-3 backdrop-blur transition-transform duration-300 sm:hidden",
        shown ? "translate-y-0" : "translate-y-full",
      )}
      aria-hidden={!shown}
    >
      <Button asChild size="lg" className="h-12 w-full rounded-full">
        <TrackedLink
          href={ROUTES.REGISTER}
          tabIndex={shown ? 0 : -1}
          eventName="cta_click"
          eventProperties={{ location: "sticky", label }}
        >
          {label}
          <ArrowRight className="ml-2 size-4" />
        </TrackedLink>
      </Button>
    </div>
  );
}
