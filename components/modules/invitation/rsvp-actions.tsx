"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";
import { CARD_STYLE_TOKENS, type CardStyle } from "@/lib/card-style";
import {
  confirmRsvpAction,
  declineRsvpAction,
} from "@/components/modules/invitation/invitation.service";

interface RsvpActionsProps {
  token: string;
  status: string;
  style: CardStyle;
  /** Who now holds the place, once it has been handed over. */
  transferredTo: string | null;
}

/**
 * The guest's answer, the page's one job (JIKU-248): two large choices in the
 * card's style, the same as on a shared card, each answering in a single tap.
 * A yes reloads the page onto the ticket; a no can be taken back.
 */
export function RsvpActions({ token, status, style, transferredTo }: RsvpActionsProps) {
  const t = useTranslations("guest.rsvp");
  const router = useRouter();
  const tokens = CARD_STYLE_TOKENS[style];
  const radius = Math.min(tokens.radius, 18);
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  function act(action: "confirm" | "decline") {
    startTransition(async () => {
      const result = action === "confirm" ? await confirmRsvpAction(token) : await declineRsvpAction(token);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      trackEvent(action === "confirm" ? "rsvp_confirmed" : "rsvp_declined");
      if (action === "confirm") {
        router.refresh();
      } else {
        setCurrent("DECLINED");
      }
    });
  }

  // The place now belongs to someone else: nothing is left to act on.
  if (current === "TRANSFERRED") {
    return (
      <div className="flex flex-col gap-2 text-center text-sm" style={{ color: tokens.panelMuted }}>
        <p>{transferredTo ? t("transferredTo", { name: transferredTo }) : t("transferredSomeone")}</p>
        <p>{t("transferredHint")}</p>
      </div>
    );
  }

  if (current === "DECLINED") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm" style={{ color: tokens.panelMuted }}>
          {t("declined")}
        </p>
        <button
          type="button"
          onClick={() => act("confirm")}
          disabled={isPending}
          className="flex h-12 w-full items-center justify-center text-[15px] font-semibold disabled:opacity-60"
          style={{ background: tokens.panelInk, color: tokens.panel, borderRadius: radius }}
        >
          {isPending ? t("updating") : t("changeMind")}
        </button>
      </div>
    );
  }

  const choices = [
    { action: "confirm" as const, label: t("confirm"), Icon: Check, strong: true },
    { action: "decline" as const, label: t("decline"), Icon: X, strong: false },
  ];

  return (
    <fieldset className="flex flex-col gap-3" disabled={isPending}>
      <legend className="mb-3 text-sm font-semibold">{t("question")}</legend>
      <div className="grid grid-cols-2 gap-2">
        {choices.map(({ action, label, Icon, strong }) => (
          <button
            key={action}
            type="button"
            onClick={() => act(action)}
            className="flex flex-col items-center gap-2 border-[1.5px] px-2 py-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
            style={{
              borderRadius: radius,
              borderColor: strong ? tokens.panelInk : `color-mix(in srgb, ${tokens.panelInk} 14%, transparent)`,
              background: strong ? tokens.panelInk : "white",
              color: strong ? tokens.panel : tokens.panelInk,
            }}
          >
            <span
              className="flex size-8 items-center justify-center rounded-full"
              style={{ background: strong ? "rgba(255,255,255,0.18)" : tokens.soft }}
            >
              <Icon aria-hidden className="size-4" />
            </span>
            {isPending ? t("updating") : label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
