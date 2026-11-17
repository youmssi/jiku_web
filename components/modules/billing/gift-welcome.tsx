"use client";

import { useEffect, useState } from "react";
import { GiftIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/lib/constants";
import { fetchGiftsAction } from "./billing.service";
import { useGiftText } from "./gift-text";
import type { Gift } from "./schema";

/** Gifts already shown on this browser; "Later" never asks twice for the same gift. */
const SEEN_KEY = "jiku.gifts.seen";

function seenGifts(): string[] {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function markSeen(ids: string[]) {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...seenGifts(), ...ids])].slice(-50)));
  } catch {
    // Private browsing or blocked storage: the dialog may come back, nothing breaks.
  }
}

/**
 * "You received a gift" (JIKU-315): on the first visit after the desk offers
 * one, a dialog with its note, what it gives and its deadline. "Activate now"
 * opens its activation in billing; "Later" leaves it waiting there.
 */
export function GiftWelcome({ canManage }: { canManage: boolean }) {
  const t = useTranslations("billing.gifts");
  const format = useFormatter();
  const describe = useGiftText();
  const router = useRouter();
  const [gift, setGift] = useState<Gift | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchGiftsAction().then((gifts) => {
      if (cancelled) return;
      const seen = seenGifts();
      setGift(gifts.find((candidate) => candidate.status === "OFFERED" && !seen.includes(candidate.id)) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!gift) return null;

  function close() {
    if (gift) markSeen([gift.id]);
    setGift(null);
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? null : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GiftIcon className="size-6" aria-hidden />
          </span>
          <DialogTitle>{t("welcomeTitle")}</DialogTitle>
          <DialogDescription>{describe(gift)}</DialogDescription>
        </DialogHeader>
        {gift.message ? <p className="rounded-md bg-muted/60 p-3 text-center text-sm italic">« {gift.message} »</p> : null}
        <p className="text-center text-sm text-muted-foreground">
          {t("welcomeText", { date: format.dateTime(new Date(gift.claimBy), { dateStyle: "long" }) })}
        </p>
        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={close}>
            {t("later")}
          </Button>
          {canManage ? (
            <Button
              onClick={() => {
                const id = gift.id;
                close();
                router.push(`${ROUTES.BILLING}?gift=${encodeURIComponent(id)}#gifts`);
              }}
            >
              {t("activateNow")}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
