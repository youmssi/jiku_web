"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  changeMemberRoleAction,
  removeMemberAction,
  revokeInvitationAction,
} from "./members.service";
import { ASSIGNABLE_ROLES, type MemberRow } from "./schema";

/**
 * Row actions for the unified members table: role change and removal for an
 * active member, revoke for a still-pending invitation.
 */
export function MemberRowActions({
  row,
  currentUserId,
}: {
  row: MemberRow;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [removeOpen, setRemoveOpen] = useState(false);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, done: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? "Something went wrong.");
        return;
      }
      toast.success(done);
      router.refresh();
    });
  }

  if (row.kind === "invitation") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${row.email}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            onSelect={() => run(() => revokeInvitationAction(row.id), "Invitation revoked.")}
          >
            Revoke invitation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const isSelf = row.userId === currentUserId;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${row.email}`} disabled={isSelf}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        {!isSelf ? (
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Change role</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={row.role}
                  onValueChange={(role) =>
                    run(() => changeMemberRoleAction(row.userId, role), "Role updated.")
                  }
                >
                  {ASSIGNABLE_ROLES.map((role) => (
                    <DropdownMenuRadioItem key={role} value={role} disabled={pending}>
                      <span className="capitalize">{role.toLowerCase()}</span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setRemoveOpen(true)}>
              Remove member
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : null}
      </DropdownMenu>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {row.email}?</AlertDialogTitle>
            <AlertDialogDescription>
              They&apos;ll immediately lose access to this organization. You can invite them
              again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() => {
                run(() => removeMemberAction(row.userId), "Member removed.");
                setRemoveOpen(false);
              }}
            >
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
