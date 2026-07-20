"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  changeMemberRoleAction,
  inviteMemberAction,
  removeMemberAction,
  revokeInvitationAction,
} from "./members.service";
import {
  ASSIGNABLE_ROLES,
  INVITABLE_ROLES,
  inviteMemberSchema,
  type InvitationView,
  type InviteMemberInput,
  type MemberView,
} from "./schema";

interface MembersViewProps {
  members: MemberView[];
  invitations: InvitationView[];
  /** The signed-in user, so the view doesn't offer self-removal. */
  currentUserId: string;
}

/** Team management (JIKU-50): invite, pending invitations, roles, removal. */
export function MembersView({ members, invitations, currentUserId }: MembersViewProps) {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>, done: string) {
    setError(null);
    setNotice(null);
    const result = await action();
    if (result.ok) {
      setNotice(done);
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>That didn&apos;t work</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {notice ? (
        <Alert>
          <AlertTitle>{notice}</AlertTitle>
        </Alert>
      ) : null}

      <InviteForm onError={setError} onInvited={() => setNotice("Invitation sent.")} />

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Owners manage everything; admins run operations and the team; members
            operate events.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{member.email}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
              <Select
                value={member.role}
                onValueChange={(role) =>
                  void run(() => changeMemberRoleAction(member.userId, role), "Role updated.")
                }
              >
                <SelectTrigger className="w-32" size="sm" aria-label={`Role of ${member.email}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      <span className="capitalize">{role.toLowerCase()}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {member.userId !== currentUserId ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${member.email}`}>
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove {member.email}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        They&apos;ll immediately lose access to this organization. You can invite them
                        again later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          void run(() => removeMemberAction(member.userId), "Member removed.")
                        }
                      >
                        Remove member
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <span className="w-9 text-center text-xs text-muted-foreground">you</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
          <CardDescription>
            Invitations expire after a few days; re-inviting the same address sends a
            fresh link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {invitations.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No pending invitations.</p>
          ) : (
            invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="capitalize">{invitation.role.toLowerCase()}</span> · expires{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void run(() => revokeInvitationAction(invitation.id), "Invitation revoked.")
                  }
                >
                  Revoke
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InviteForm({
  onInvited,
  onError,
}: {
  onInvited: () => void;
  onError: (message: string) => void;
}) {
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
      onInvited();
    } else {
      onError(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite someone</CardTitle>
        <CardDescription>They&apos;ll receive an email link to join this organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="invite-email"
                  type="email"
                  autoComplete="off"
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
              <Field className="sm:w-36">
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
