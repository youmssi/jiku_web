"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
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

function useColumns(): ColumnDef<DataTableFeatures, AuditEntry>[] {
  const t = useTranslations("admin.audit");
  return [
  {
    accessorKey: "createdAt",
    header: t("when"),
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatLocalDateTime(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: t("action"),
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.action}</span>
    ),
  },
  {
    accessorKey: "target",
    header: t("target"),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.target}
      </span>
    ),
  },
  {
    accessorKey: "note",
    header: t("note"),
    cell: ({ row }) => (
      <span className="block max-w-64 truncate text-muted-foreground">
        {row.original.note ?? "—"}
      </span>
    ),
  },
  {
    id: "admin",
    header: t("admin"),
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.adminId.slice(0, 8)}…
      </span>
    ),
  },
];
}

export function AuditView({ audit }: { audit: AuditPage }) {
  const t = useTranslations("admin.audit");
  const columns = useColumns();
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
          placeholder={t("filter")}
          className="max-w-sm font-mono"
        />
        <Button type="submit" variant="outline">
          {t("filterButton")}
        </Button>
      </form>

      {audit.entries.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ScrollText />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <DataTable columns={columns} data={audit.entries} />
          <p className="text-xs text-muted-foreground">
            {t("total", { count: audit.total })}
          </p>
        </>
      )}
    </div>
  );
}
