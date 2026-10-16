"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { declineRsvpAction } from "@/components/modules/invitation/invitation.service";
import { TransferTicketDialog } from "@/components/modules/invitation/transfer-ticket-dialog";

/**
 * What a confirmed guest rarely needs, kept quiet under the ticket: handing
 * the place to someone else, or cancelling. Cancelling asks first, since the
 * ticket stops working at the door.
 */
export function TicketSecondaryActions({
  token,
  transferAllowed,
  transferDeadline,
}: {
  token: string;
  /** Display flag only: the backend re-checks the event setting and the deadline. */
  transferAllowed: boolean;
  transferDeadline: string | null;
}) {
  const t = useTranslations("guest.rsvp");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function cancel() {
    startTransition(async () => {
      const result = await declineRsvpAction(token);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      trackEvent("rsvp_declined");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2">
      {transferAllowed ? <TransferTicketDialog token={token} deadline={transferDeadline} /> : null}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="link" className="text-muted-foreground" disabled={isPending}>
            {isPending ? t("updating") : t("cantMakeIt")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("cancelDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelKeep")}</AlertDialogCancel>
            <AlertDialogAction onClick={cancel}>{t("cancelConfirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
