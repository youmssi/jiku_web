"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
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

function useColumns(): ColumnDef<DataTableFeatures, TenantDirectoryEntry>[] {
  const t = useTranslations("admin.tenants");
  const common = useTranslations("admin.common");
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("tenant")}
          <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "contactEmail",
      header: t("contact"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.contactEmail}
        </span>
      ),
    },
    {
      accessorKey: "organizerCount",
      header: t("organizers"),
    },
    {
      accessorKey: "createdAt",
      header: t("created"),
      cell: ({ row }) => formatLocalDateTime(row.original.createdAt),
    },
    {
      accessorKey: "status",
      header: common("status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: common("actions"),
      enableSorting: false,
      cell: ({ row }) =>
        row.original.status === "SUSPENDED" ? (
          <ActionDialog
            trigger={t("reactivate")}
            title={t("reactivateTitle", { name: row.original.name })}
            description={t("reactivateText")}
            fieldLabel={t("note")}
            confirmLabel={t("reactivate")}
            onConfirm={(note) => reactivateTenantAction(row.original.id, note)}
          />
        ) : (
          <ActionDialog
            trigger={t("suspend")}
            title={t("suspendTitle", { name: row.original.name })}
            description={t("suspendText")}
            fieldLabel={t("noteWhy")}
            confirmLabel={t("suspend")}
            destructive
            onConfirm={(note) => suspendTenantAction(row.original.id, note)}
          />
        ),
    },
  ];
}

export function TenantsView({ directory }: { directory: TenantDirectoryPage }) {
  const t = useTranslations("admin.tenants");
  const columns = useColumns();
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
          placeholder={t("search")}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          {t("searchButton")}
        </Button>
      </form>

      {directory.entries.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <DataTable columns={columns} data={directory.entries} />
          <p className="text-xs text-muted-foreground">
            {t("total", { count: directory.total })}
          </p>
        </>
      )}
    </div>
  );
}
