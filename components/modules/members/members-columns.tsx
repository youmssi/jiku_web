"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocalDateTime } from "@/components/shared/use-local-date-time";
import { Badge } from "@/components/ui/badge";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import { Button } from "@/components/ui/button";
import { MemberRowActions } from "./member-row-actions";
import type { MemberRow } from "./schema";

const columnHelper = createColumnHelper<DataTableFeatures, MemberRow>();

function ColumnLabel({ name }: { name: "member" | "role" | "status" }) {
  const t = useTranslations("settings.members.columns");
  return t(name);
}

function MemberCell({ member }: { member: MemberRow }) {
  const t = useTranslations("settings.members.columns");
  const formatDate = useLocalDateTime(true);
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">{member.email}</p>
      <p className="text-xs text-muted-foreground">
        {member.kind === "member"
          ? t("joined", { date: formatDate(member.joinedAt) })
          : t("invitedOn", { date: formatDate(member.createdAt), expires: formatDate(member.expiresAt) })}
      </p>
    </div>
  );
}

function StatusBadge({ kind }: { kind: MemberRow["kind"] }) {
  const t = useTranslations("settings.members.columns");
  return kind === "member" ? (
    <Badge variant="secondary">{t("active")}</Badge>
  ) : (
    <Badge variant="outline">{t("pending")}</Badge>
  );
}

export function buildMembersColumns(currentUserId: string, roleLabel: (role: string) => string) {
  return columnHelper.columns([
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ColumnLabel name="member" />
          <ArrowUpDown className="ml-2 size-3.5" />
        </Button>
      ),
      filterFn: "includesString",
      cell: ({ row }) => <MemberCell member={row.original} />,
    }),
    columnHelper.accessor("role", {
      header: () => <ColumnLabel name="role" />,
      cell: ({ row }) => <span className="text-sm">{roleLabel(row.original.role)}</span>,
    }),
    columnHelper.display({
      id: "status",
      header: () => <ColumnLabel name="status" />,
      cell: ({ row }) => <StatusBadge kind={row.original.kind} />,
    }),
    columnHelper.display({
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => <MemberRowActions row={row.original} currentUserId={currentUserId} />,
    }),
  ]);
}
