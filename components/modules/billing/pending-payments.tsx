"use client";

import { useState, useTransition } from "react";
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
import { ActivationInstructions } from "./activation-instructions";
import { cancelRequestAction, transferSentAction } from "./billing.service";
import type { ManualPaymentInstructions } from "./schema";

/**
 * Every transfer request still waiting, in one place at the top of billing
 * (JIKU-307), so a request never disappears on reload and none is forgotten.
 */
export function PendingPayments({
  requests,
  canManage,
}: {
  requests: ManualPaymentInstructions[];
  canManage: boolean;
}) {
  const t = useTranslations("billing.requests");
  const router = useRouter();
  if (requests.length === 0) return null;
  return (
    <section aria-labelledby="pending-payments-title" className="flex flex-col gap-3">
      <div>
        <h2 id="pending-payments-title" className="text-lg font-semibold">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("intro")}</p>
      </div>
      {requests.map((request) => (
        <PendingRequest key={request.paymentId} request={request} canManage={canManage} onChange={() => router.refresh()} />
      ))}
    </section>
  );
}

/**
 * One waiting request with what the organizer can do about it (JIKU-307):
 * say the transfer is sent, or cancel it after a confirmation.
 */
export function PendingRequest({
  request,
  canManage,
  onChange,
}: {
  request: ManualPaymentInstructions;
  canManage: boolean;
  /** Called with the request as it now stands, once an action succeeded. */
  onChange: (updated: ManualPaymentInstructions) => void;
}) {
  const t = useTranslations("billing.requests");
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function run(action: typeof transferSentAction, done: string) {
    startTransition(async () => {
      const result = await action(request.paymentId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(done);
      setConfirming(false);
      onChange(result.data);
    });
  }

  return (
    <ActivationInstructions instructions={request}>
      {canManage ? (
        <>
          {request.transferDeclaredAt ? null : (
            <Button className="max-md:h-11" onClick={() => run(transferSentAction, t("sentDone"))} disabled={pending}>
              {pending ? t("marking") : t("markSent")}
            </Button>
          )}
          <AlertDialog open={confirming} onOpenChange={setConfirming}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="max-md:h-11" disabled={pending}>
                {t("cancel")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("cancelTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{t("cancelText", { reference: request.reference })}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("keep")}</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={pending}
                  onClick={(event) => {
                    event.preventDefault();
                    run(cancelRequestAction, t("cancelled"));
                  }}
                >
                  {t("cancelConfirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </ActivationInstructions>
  );
}
