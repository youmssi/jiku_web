"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatLocalDateTime } from "@/lib/datetime";
import { ActionDialog } from "./action-dialog";
import { reactivateTenantAction, suspendTenantAction } from "./admin.service";
import { AdminTable, EmptyRow, StatusBadge } from "./admin-ui";
import type { TenantDirectoryPage } from "./schema";

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

      <AdminTable headers={["Tenant", "Contact", "Organizers", "Created", "Status", "Actions"]}>
        {directory.entries.length === 0 ? (
          <EmptyRow span={6} label="No tenants match." />
        ) : (
          directory.entries.map((tenant) => (
            <tr key={tenant.id}>
              <td className="px-4 py-2 font-medium">{tenant.name}</td>
              <td className="px-4 py-2 text-muted-foreground">{tenant.contactEmail}</td>
              <td className="px-4 py-2">{tenant.organizerCount}</td>
              <td className="px-4 py-2">{formatLocalDateTime(tenant.createdAt)}</td>
              <td className="px-4 py-2">
                <StatusBadge status={tenant.status} />
              </td>
              <td className="px-4 py-2">
                {tenant.status === "SUSPENDED" ? (
                  <ActionDialog
                    trigger="Reactivate"
                    title={`Reactivate ${tenant.name}`}
                    description="The tenant's organizers regain access immediately."
                    fieldLabel="Note"
                    confirmLabel="Reactivate"
                    onConfirm={(note) => reactivateTenantAction(tenant.id, note)}
                  />
                ) : (
                  <ActionDialog
                    trigger="Suspend"
                    title={`Suspend ${tenant.name}`}
                    description="Blocks organizer access and stops guest/validator links from resolving, on the very next request."
                    fieldLabel="Note (why)"
                    confirmLabel="Suspend"
                    destructive
                    onConfirm={(note) => suspendTenantAction(tenant.id, note)}
                  />
                )}
              </td>
            </tr>
          ))
        )}
      </AdminTable>
      <p className="text-xs text-muted-foreground">{directory.total} tenant(s)</p>
    </div>
  );
}
