"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { InviteMemberDialog } from "./invite-member-dialog";
import { buildMembersColumns } from "./members-columns";
import type { InvitationView, MemberRow, MemberView } from "./schema";

interface MembersViewProps {
  members: MemberView[];
  invitations: InvitationView[];
  /** The signed-in user, so the view doesn't offer self-removal. */
  currentUserId: string;
}

/**
 * Team management (JIKU-50): invite, pending invitations, roles, removal —
 * one table for active members and pending invitations alike, told apart by
 * a status badge, each row carrying its own contextual actions.
 */
export function MembersView({ members, invitations, currentUserId }: MembersViewProps) {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const rows: MemberRow[] = useMemo(
    () => [
      ...members.map((member): MemberRow => ({ kind: "member", ...member })),
      ...invitations.map((invitation): MemberRow => ({ kind: "invitation", ...invitation })),
    ],
    [members, invitations],
  );

  const columns = useMemo(() => buildMembersColumns(currentUserId), [currentUserId]);

  return (
    <div className="flex flex-col gap-4">
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

      <p className="text-xs text-muted-foreground">
        Owners manage everything; admins run operations and the team; members operate
        events. Pending invitations are listed here too, until accepted or revoked.
      </p>

      <DataTable
        columns={columns}
        data={rows}
        toolbar={(table) => (
          <div className="flex items-center justify-between gap-2">
            <div className="relative max-w-xs flex-1">
              <Input
                placeholder="Search by email…"
                value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
                className="pr-8"
              />
              <Search className="absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <InviteMemberDialog
              onInvited={() => {
                setError(null);
                setNotice("Invitation sent.");
              }}
              onError={(message) => {
                setNotice(null);
                setError(message);
              }}
            />
          </div>
        )}
      />
    </div>
  );
}
