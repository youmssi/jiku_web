"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "./admin.service";

/**
 * The one dialog shape every back-office action uses (JIKU-46): a confirmation
 * with a mandatory free-text field (note, reason, or transaction reference)
 * submitted to a server action. Keeping it shared means every destructive
 * action gets the same confirm-with-context discipline.
 */
export function ActionDialog({
  trigger,
  title,
  description,
  fieldLabel,
  confirmLabel,
  destructive = false,
  onConfirm,
}: {
  trigger: string;
  title: string;
  description: string;
  fieldLabel: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: (value: string) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!value.trim()) {
      toast.error(`${fieldLabel} is required.`);
      return;
    }
    startTransition(async () => {
      const { error } = await onConfirm(value.trim());
      if (error) {
        toast.error(error);
        return;
      }
      toast.success(`${title} — done.`);
      setValue("");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={destructive ? "destructive" : "outline"}>
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="action-dialog-field">{fieldLabel}</Label>
          <Input
            id="action-dialog-field"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={submit}
            disabled={isPending}
          >
            {isPending ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
