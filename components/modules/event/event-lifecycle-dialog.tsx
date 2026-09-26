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
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { askRating } from "@/components/modules/feedback";
import { trackEvent } from "@/lib/analytics";
import { ROUTES } from "@/lib/constants";
import { cancelEventAction, deleteEventAction, publishEventAction } from "./event.service";

export type EventLifecycleAction = "publish" | "cancel" | "delete";

/**
 * The confirmation behind every irreversible step of an event's life, shared by
 * the events list and the event header so the wording and the consequences
 * never differ between the two. Cancelling offers to notify the guests;
 * deleting leaves the event's pages, so it returns to the events list.
 */
export function EventLifecycleDialog({
  eventId,
  action,
  onOpenChange,
}: {
  eventId: string;
  action: EventLifecycleAction | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("events.lifecycle");
  const tCommon = useTranslations("common.actions");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notifyGuests, setNotifyGuests] = useState(true);

  function close(open: boolean) {
    if (!open) setNotifyGuests(true);
    onOpenChange(open);
  }

  function run() {
    if (!action) return;
    const kind = action;
    startTransition(async () => {
      const result =
        kind === "publish"
          ? await publishEventAction(eventId)
          : kind === "cancel"
            ? await cancelEventAction(eventId, notifyGuests)
            : await deleteEventAction(eventId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (kind === "publish") {
        trackEvent("event_published");
        askRating("event_published");
      }
      toast.success(t(`${kind}.done`));
      close(false);
      if (kind === "delete") {
        router.push(ROUTES.EVENTS);
      }
      router.refresh();
    });
  }

  return (
    <AlertDialog open={action !== null} onOpenChange={close}>
      {action ? (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`${action}.title`)}</AlertDialogTitle>
            <AlertDialogDescription>{t(`${action}.description`)}</AlertDialogDescription>
          </AlertDialogHeader>
          {action === "cancel" ? (
            <Field orientation="horizontal">
              <Checkbox
                id="notify-guests"
                checked={notifyGuests}
                onCheckedChange={(checked) => setNotifyGuests(checked === true)}
              />
              <FieldLabel htmlFor="notify-guests" className="font-normal">
                {t("cancel.notify")}
              </FieldLabel>
            </Field>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant={action === "publish" ? "default" : "destructive"}
              onClick={(event) => {
                event.preventDefault();
                run();
              }}
              disabled={pending}
            >
              {pending ? t("working") : t(`${action}.confirm`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      ) : null}
    </AlertDialog>
  );
}
