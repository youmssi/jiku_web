"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importGuestsAction } from "@/components/modules/guest/guest.service";

export function GuestImport({ eventId }: { eventId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const outcome = await importGuestsAction(eventId, formData);
      if (!outcome.ok) {
        toast.error(outcome.error);
        return;
      }
      const result = outcome.data;
      toast.success(
        `Imported ${result.imported} guest(s) — ${result.failed} failed, ` +
          `${result.skippedDuplicates} duplicate(s).`,
      );
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    });
  }

  return (
    <form action={onSubmit} className="flex flex-wrap items-center gap-2">
      <Input
        ref={inputRef}
        type="file"
        name="file"
        accept=".csv,text/csv"
        required
        className="max-w-xs"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Importing…" : "Import CSV"}
      </Button>
    </form>
  );
}
