"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { ticketRoute } from "@/lib/constants";
import {
  confirmRsvpAction,
  declineRsvpAction,
} from "@/components/modules/invitation/invitation.service";
import { TransferTicketDialog } from "@/components/modules/invitation/transfer-ticket-dialog";

interface RsvpActionsProps {
  token: string;
  status: string;
  primaryColor: string;
  ticketCode: string | null;
  /**
   * Whether this guest may hand their place on right now. The backend decides
   * (event setting, deadline, confirmed, not already scanned in) and re-checks on
   * submit, so this is a display flag, never the authority.
   */
  transferAllowed: boolean;
  transferDeadline: string | null;
  /** Who now holds the place, once it has been handed over. */
  transferredTo: string | null;
}

/**
 * The guest's answer is the page's one job, mostly on a phone: full-width,
 * 48 px tall buttons, the same weight as the choices on a shared card.
 */
const ACTION = "h-12 w-full rounded-full px-6 text-base sm:w-auto";

export function RsvpActions({
  token,
  status,
  primaryColor,
  ticketCode,
  transferAllowed,
  transferDeadline,
  transferredTo,
}: RsvpActionsProps) {
  const t = useTranslations("guest.rsvp");
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  function act(action: "confirm" | "decline") {
    startTransition(async () => {
      const result =
        action === "confirm" ? await confirmRsvpAction(token) : await declineRsvpAction(token);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      trackEvent(action === "confirm" ? "rsvp_confirmed" : "rsvp_declined");
      setCurrent(action === "confirm" ? "CONFIRMED" : "DECLINED");
      toast.success(action === "confirm" ? t("confirmedToast") : t("declinedToast"));
    });
  }

  // Terminal state: the place now belongs to someone else, so there is nothing
  // left to act on — only an explanation of what happened.
  if (current === "TRANSFERRED") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-muted-foreground">
          {transferredTo ? t("transferredTo", { name: transferredTo }) : t("transferredSomeone")}
        </p>
        <p className="text-muted-foreground text-sm">
          {t("transferredHint")}
        </p>
      </div>
    );
  }

  if (current === "CONFIRMED") {
    return (
      <div className="flex w-full flex-col items-center gap-3">
        <p className="text-green-700 dark:text-green-400">
          {t("confirmed")}
        </p>
        {ticketCode ? (
          <Button asChild style={{ backgroundColor: primaryColor }} className={cn(ACTION, "text-white")}>
            <Link href={ticketRoute(token)}>{t("viewTicket")}</Link>
          </Button>
        ) : null}
        {transferAllowed ? (
          <TransferTicketDialog token={token} deadline={transferDeadline} />
        ) : null}
        <Button variant="outline" className={ACTION} onClick={() => act("decline")} disabled={isPending}>
          {isPending ? t("updating") : t("cantMakeIt")}
        </Button>
      </div>
    );
  }

  if (current === "DECLINED") {
    return (
      <div className="flex w-full flex-col items-center gap-3">
        <p className="text-muted-foreground">{t("declined")}</p>
        <Button
          style={{ backgroundColor: primaryColor }}
          className={cn(ACTION, "text-white")}
          onClick={() => act("confirm")}
          disabled={isPending}
        >
          {isPending ? t("updating") : t("changeMind")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
      <Button
        style={{ backgroundColor: primaryColor }}
        className={cn(ACTION, "text-white")}
        onClick={() => act("confirm")}
        disabled={isPending}
      >
        {isPending ? t("confirming") : t("confirm")}
      </Button>
      <Button variant="outline" className={ACTION} onClick={() => act("decline")} disabled={isPending}>
        {t("decline")}
      </Button>
    </div>
  );
}
