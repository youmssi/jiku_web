"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowUpDown, Building2 } from "lucide-react";
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
import { ActionDialog } from "./action-dialog";
import { reactivateTenantAction, suspendTenantAction } from "./admin.service";
import { StatusBadge } from "./admin-ui";
import type { TenantDirectoryEntry, TenantDirectoryPage } from "./schema";

const COLUMNS: ColumnDef<DataTableFeatures, TenantDirectoryEntry>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tenant
          <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "contactEmail",
      header: "Contact",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.contactEmail}
        </span>
      ),
    },
    {
      accessorKey: "organizerCount",
      header: "Organizers",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatLocalDateTime(row.original.createdAt),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.status === "SUSPENDED" ? (
          <ActionDialog
            trigger="Reactivate"
            title={`Reactivate ${row.original.name}`}
            description="The tenant's organizers regain access immediately."
            fieldLabel="Note"
            confirmLabel="Reactivate"
            onConfirm={(note) => reactivateTenantAction(row.original.id, note)}
          />
        ) : (
          <ActionDialog
            trigger="Suspend"
            title={`Suspend ${row.original.name}`}
            description="Blocks organizer access and stops guest/validator links from resolving, on the very next request."
            fieldLabel="Note (why)"
            confirmLabel="Suspend"
            destructive
            onConfirm={(note) => suspendTenantAction(row.original.id, note)}
          />
        ),
    },
  ];

export function TenantsView({ directory }: { directory: TenantDirectoryPage }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") ?? "");

  function search(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    router.push(`${ADMIN_ROUTES.TENANTS}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={search} className="flex gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or contact email…"
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {directory.entries.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>No tenants found</EmptyTitle>
            <EmptyDescription>No tenants match this search.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <DataTable columns={COLUMNS} data={directory.entries} />
          <p className="text-xs text-muted-foreground">
            {directory.total} tenant(s)
          </p>
        </>
      )}
    </div>
  );
}
