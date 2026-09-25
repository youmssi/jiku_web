"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { requestErasureAction } from "@/components/modules/invitation/invitation.service";

/**
 * Guest self-service data deletion (JIKU-36). Behind an explicit, irreversible
 * confirmation so it cannot be triggered by a single accidental tap.
 */
export function DataDeletion({ token, erased }: { token: string; erased: boolean }) {
  const t = useTranslations("guest.erasure");
  const [done, setDone] = useState(erased);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="mt-6 text-xs text-muted-foreground">
        {t("done")}
      </p>
    );
  }

  function onConfirm() {
    startTransition(async () => {
      const result = await requestErasureAction(token);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDone(true);
      toast.success(t("doneToast"));
    });
  }

  return (
    <div className="mt-6 border-t pt-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {t("open")}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("keep")}</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} disabled={isPending}>
              {isPending ? t("deleting") : t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
