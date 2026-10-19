"use client";

import { useTransition } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter } from "@/i18n/navigation";
import { COOKIES } from "@/lib/constants";
import { isPricingCurrency, PRICING_CURRENCIES, type PricingCurrency } from "@/lib/pricing";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * The currency the marketing pages quote prices in (JIKU-270). The page opens
 * in the visitor's country currency; a pick is remembered in a cookie and the
 * page renders again with it, so every price on it changes at once.
 */
export function CurrencySwitcher({ value, label }: { value: PricingCurrency; label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function pick(next: string) {
    if (!isPricingCurrency(next) || next === value) return;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIES.CURRENCY}=${next}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
    startTransition(() => router.refresh());
  }

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      aria-label={label}
      aria-busy={pending}
      value={value}
      onValueChange={pick}
    >
      {PRICING_CURRENCIES.map((code) => (
        <ToggleGroupItem
          key={code}
          value={code}
          className="h-11 px-4 text-sm data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:hover:bg-foreground/90 data-[state=on]:hover:text-background"
        >
          {code}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
