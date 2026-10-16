"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { PRIVACY_ROUTE } from "@/lib/constants";
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
 * The guest's data, behind one quiet link (JIKU-36, JIKU-248): how it is used,
 * and self-service deletion. Deleting stays an explicit, irreversible choice in
 * the dialog, never a single accidental tap.
 */
export function DataDeletion({ token, erased }: { token: string; erased: boolean }) {
  const t = useTranslations("guest.erasure");
  const [done, setDone] = useState(erased);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return <p className="text-center text-xs text-muted-foreground">{t("done")}</p>;
  }

  function onConfirm() {
    startTransition(async () => {
      const result = await requestErasureAction(token);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {t("open")}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <Link href={PRIVACY_ROUTE} className="text-sm underline underline-offset-4">
          {t("policy")}
        </Link>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("keep")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? t("deleting") : t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
