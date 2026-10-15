"use client";

import { useRouter } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
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
  const t = useTranslations("settings.members.actions");
  const tRoles = useTranslations("common.roles");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [removeOpen, setRemoveOpen] = useState(false);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, done: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? t("failed"));
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
          <Button variant="ghost" size="icon" aria-label={t("label", { email: row.email })}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            onSelect={() => run(() => revokeInvitationAction(row.id), t("revoked"))}
          >
            {t("revoke")}
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
          <Button variant="ghost" size="icon" aria-label={t("label", { email: row.email })} disabled={isSelf}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        {!isSelf ? (
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>{t("changeRole")}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={row.role}
                  onValueChange={(role) =>
                    run(() => changeMemberRoleAction(row.userId, role), t("roleUpdated"))
                  }
                >
                  {ASSIGNABLE_ROLES.map((role) => (
                    <DropdownMenuRadioItem key={role} value={role} disabled={pending}>
                      {tRoles(role)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setRemoveOpen(true)}>
              {t("remove")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : null}
      </DropdownMenu>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeTitle", { email: row.email })}</AlertDialogTitle>
            <AlertDialogDescription>{t("removeDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() => {
                run(() => removeMemberAction(row.userId), t("removed"));
                setRemoveOpen(false);
              }}
            >
              {t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
