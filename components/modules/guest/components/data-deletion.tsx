"use client";

import { useState, useTransition } from "react";
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
import { requestErasureAction } from "@/components/modules/guest/services/rsvp";

/**
 * Guest self-service data deletion (JIKU-36). Behind an explicit, irreversible
 * confirmation so it cannot be triggered by a single accidental tap.
 */
export function DataDeletion({ token, erased }: { token: string; erased: boolean }) {
  const [done, setDone] = useState(erased);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="mt-6 text-xs text-muted-foreground">
        Your personal data has been deleted from this event. This cannot be undone.
      </p>
    );
  }

  function onConfirm() {
    startTransition(async () => {
      const { error } = await requestErasureAction(token);
      if (error) {
        toast.error(error);
        return;
      }
      setDone(true);
      toast.success("Your personal data has been deleted.");
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
            Request deletion of my data
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your personal data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your name, email and phone number from this
              event. It cannot be undone. The organizer keeps only an anonymous record
              that a guest was invited.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my data</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} disabled={isPending}>
              {isPending ? "Deleting…" : "Delete my data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
