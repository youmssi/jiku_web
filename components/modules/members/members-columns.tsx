"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import { Button } from "@/components/ui/button";
import { MemberRowActions } from "./member-row-actions";
import type { MemberRow } from "./schema";

const columnHelper = createColumnHelper<DataTableFeatures, MemberRow>();

export function buildMembersColumns(currentUserId: string, roleLabel: (role: string) => string) {
  return columnHelper.columns([
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Member
          <ArrowUpDown className="ml-2 size-3.5" />
        </Button>
      ),
      filterFn: "includesString",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{member.email}</p>
            <p className="text-xs text-muted-foreground">
              {member.kind === "member"
                ? `Joined ${new Date(member.joinedAt).toLocaleDateString()}`
                : `Invited ${new Date(member.createdAt).toLocaleDateString()} · expires ${new Date(member.expiresAt).toLocaleDateString()}`}
            </p>
          </div>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: ({ row }) => <span className="text-sm">{roleLabel(row.original.role)}</span>,
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.kind === "member" ? (
          <Badge variant="secondary">Active</Badge>
        ) : (
          <Badge variant="outline">Pending</Badge>
        ),
    }),
    columnHelper.display({
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => <MemberRowActions row={row.original} currentUserId={currentUserId} />,
    }),
  ]);
}
