"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

export function RsvpActions({
  token,
  status,
  primaryColor,
  ticketCode,
  transferAllowed,
  transferDeadline,
  transferredTo,
}: RsvpActionsProps) {
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
      setCurrent(action === "confirm" ? "CONFIRMED" : "DECLINED");
      toast.success(action === "confirm" ? "You're confirmed, see you there!" : "You've declined.");
    });
  }

  // Terminal state: the place now belongs to someone else, so there is nothing
  // left to act on — only an explanation of what happened.
  if (current === "TRANSFERRED") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-muted-foreground">
          {transferredTo
            ? `You handed this invitation to ${transferredTo}.`
            : "You handed this invitation to someone else."}
        </p>
        <p className="text-muted-foreground text-sm">
          Their own invitation is on its way, and this ticket is no longer valid at the entrance.
        </p>
      </div>
    );
  }

  if (current === "CONFIRMED") {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-green-700 dark:text-green-400">
          You&apos;re confirmed. See you there!
        </p>
        {ticketCode ? (
          <Button asChild style={{ backgroundColor: primaryColor }} className="text-white">
            <Link href={ticketRoute(token)}>View your ticket</Link>
          </Button>
        ) : null}
        {transferAllowed ? (
          <TransferTicketDialog token={token} deadline={transferDeadline} />
        ) : null}
        <Button variant="outline" onClick={() => act("decline")} disabled={isPending}>
          {isPending ? "Updating…" : "I can't make it anymore"}
        </Button>
      </div>
    );
  }

  if (current === "DECLINED") {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-muted-foreground">You&apos;ve declined this invitation.</p>
        <Button
          style={{ backgroundColor: primaryColor }}
          className="text-white"
          onClick={() => act("confirm")}
          disabled={isPending}
        >
          {isPending ? "Updating…" : "Actually, I'll come"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        style={{ backgroundColor: primaryColor }}
        className="text-white"
        onClick={() => act("confirm")}
        disabled={isPending}
      >
        {isPending ? "Confirming…" : "Confirm attendance"}
      </Button>
      <Button variant="outline" onClick={() => act("decline")} disabled={isPending}>
        Decline
      </Button>
    </div>
  );
}
