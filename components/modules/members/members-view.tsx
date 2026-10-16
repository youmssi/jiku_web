"use client";

import { useCallback, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/ui/data-table";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup } from "@/components/ui/item";
import { organizerRole } from "@/components/shared/organizer-nav";
import { InviteMemberDialog } from "./invite-member-dialog";
import { MemberRowActions } from "./member-row-actions";
import { buildMembersColumns, MemberCell, StatusBadge } from "./members-columns";
import type { InvitationView, MemberRow, MemberView } from "./schema";

/** Below this many people a search box costs more than scanning the list. */
const SEARCH_FROM = 6;

interface MembersViewProps {
  members: MemberView[];
  invitations: InvitationView[];
  /** The signed-in user, so the view doesn't offer self-removal. */
  currentUserId: string;
}

/**
 * Team management (JIKU-50): invite, pending invitations, roles, removal. One
 * list for active members and pending invitations alike, told apart by a
 * status badge, each row carrying its own actions: a card per person on a
 * phone, a table from a tablet up. What each role may do is told where a role
 * is chosen, in the invitation dialog.
 */
export function MembersView({ members, invitations, currentUserId }: MembersViewProps) {
  const t = useTranslations("settings.members");
  const tRoles = useTranslations("common.roles");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const rows: MemberRow[] = useMemo(
    () => [
      ...members.map((member): MemberRow => ({ kind: "member", ...member })),
      ...invitations.map((invitation): MemberRow => ({ kind: "invitation", ...invitation })),
    ],
    [members, invitations],
  );
  const shown = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return needle === "" ? rows : rows.filter((row) => row.email.toLocaleLowerCase().includes(needle));
  }, [rows, query]);

  const roleLabel = useCallback(
    (role: string) => {
      const key = organizerRole(role);
      return key ? tRoles(key) : role;
    },
    [tRoles],
  );
  const columns = useMemo(() => buildMembersColumns(currentUserId, roleLabel), [currentUserId, roleLabel]);

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{t("failedTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {notice ? (
        <Alert>
          <AlertTitle>{notice}</AlertTitle>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {rows.length >= SEARCH_FROM ? (
          <InputGroup className="min-w-0 flex-1 md:max-w-xs">
            <InputGroupInput
              placeholder={t("search")}
              aria-label={t("search")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        ) : null}
        <div className="ml-auto">
          <InviteMemberDialog
            onInvited={() => {
              setError(null);
              setNotice(t("invited"));
            }}
            onError={(message) => {
              setNotice(null);
              setError(message);
            }}
          />
        </div>
      </div>

      <ItemGroup className="gap-2 md:hidden">
        {shown.map((row) => (
          <Item key={`${row.kind}-${row.email}`} variant="outline" role="listitem">
            <ItemContent className="min-w-0">
              <MemberCell member={row} />
              <ItemDescription className="flex flex-wrap items-center gap-2">
                <span>{roleLabel(row.role)}</span>
                <StatusBadge kind={row.kind} />
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <MemberRowActions row={row} currentUserId={currentUserId} />
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>

      <div className="hidden md:block">
        <DataTable columns={columns} data={shown} />
      </div>
    </div>
  );
}
