"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ScrollText } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatLocalDateTime } from "@/lib/datetime";
import type { AuditEntry, AuditPage } from "./schema";

const COLUMNS: ColumnDef<DataTableFeatures, AuditEntry>[] = [
  {
    accessorKey: "createdAt",
    header: "When",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatLocalDateTime(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.action}</span>
    ),
  },
  {
    accessorKey: "target",
    header: "Target",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.target}
      </span>
    ),
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => (
      <span className="block max-w-64 truncate text-muted-foreground">
        {row.original.note ?? "—"}
      </span>
    ),
  },
  {
    id: "admin",
    header: "Admin",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.adminId.slice(0, 8)}…
      </span>
    ),
  },
];

export function AuditView({ audit }: { audit: AuditPage }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [action, setAction] = useState(searchParams.get("action") ?? "");

  function filter(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (action.trim()) params.set("action", action.trim().toUpperCase());
    router.push(`${ADMIN_ROUTES.AUDIT}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={filter} className="flex gap-2">
        <Input
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder="Filter by action (e.g. PAYMENT_CONFIRMED)…"
          className="max-w-sm font-mono"
        />
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {audit.entries.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ScrollText />
            </EmptyMedia>
            <EmptyTitle>No audit entries</EmptyTitle>
            <EmptyDescription>No audit entries match this filter.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <DataTable columns={COLUMNS} data={audit.entries} />
          <p className="text-xs text-muted-foreground">
            {audit.total} entrie(s)
          </p>
        </>
      )}
    </div>
  );
}
