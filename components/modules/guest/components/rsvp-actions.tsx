"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  confirmRsvpAction,
  declineRsvpAction,
} from "@/components/modules/guest/services/rsvp";

interface RsvpActionsProps {
  token: string;
  status: string;
  primaryColor: string;
  ticketCode: string | null;
}

export function RsvpActions({ token, status, primaryColor, ticketCode }: RsvpActionsProps) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  function act(action: "confirm" | "decline") {
    startTransition(async () => {
      const result =
        action === "confirm" ? await confirmRsvpAction(token) : await declineRsvpAction(token);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setCurrent(action === "confirm" ? "CONFIRMED" : "DECLINED");
      toast.success(action === "confirm" ? "You're confirmed — see you there!" : "You've declined.");
    });
  }

  if (current === "CONFIRMED") {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-green-700 dark:text-green-400">
          You&apos;re confirmed. See you there!
        </p>
        {ticketCode ? (
          <p className="rounded-md bg-muted px-3 py-2 font-mono text-sm">Ticket: {ticketCode}</p>
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
