"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMemberAction } from "./members.service";
import { INVITABLE_ROLES, inviteMemberSchema, type InviteMemberInput } from "./schema";

/**
 * Invite-a-teammate flow, in a dialog so it doesn't compete for space with the
 * members table. They'll receive an email link to join this organization.
 */
export function InviteMemberDialog({
  onInvited,
  onError,
}: {
  onInvited: () => void;
  onError: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    mode: "onTouched",
    defaultValues: { email: "", role: "MEMBER" },
  });

  async function onSubmit(values: InviteMemberInput) {
    const result = await inviteMemberAction(values);
    if (result.ok) {
      reset();
      setOpen(false);
      onInvited();
    } else {
      onError(result.error);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-3.5" data-icon="inline-start" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite someone</DialogTitle>
          <DialogDescription>They&apos;ll receive an email link to join this organization.</DialogDescription>
        </DialogHeader>
        <form id="invite-member-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="invite-email"
                  type="email"
                  autoComplete="off"
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="invite-role" aria-label="Role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVITABLE_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        <span className="capitalize">{role.toLowerCase()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="invite-member-form" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
