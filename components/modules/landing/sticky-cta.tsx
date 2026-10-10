"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * On a phone, the main action stays in reach once the whole hero has scrolled
 * away (not just its button, so the bar never covers the hero's card), and
 * steps aside when the closing call to action or the footer is on screen, so
 * it never covers the footer's links (JIKU-236). Desktop keeps the
 * navigation's button instead.
 */
export function StickyCta({ label }: { label: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const targets = [
      document.getElementById("hero"),
      document.getElementById("final-cta"),
      document.querySelector("footer"),
    ].filter((element): element is HTMLElement => element !== null);
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
