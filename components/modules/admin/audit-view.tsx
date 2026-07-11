"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatLocalDateTime } from "@/lib/datetime";
import { AdminTable, EmptyRow } from "./admin-ui";
import type { AuditPage } from "./schema";

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

      <AdminTable headers={["When", "Action", "Target", "Note", "Admin"]}>
        {audit.entries.length === 0 ? (
          <EmptyRow span={5} label="No audit entries match." />
        ) : (
          audit.entries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-4 py-2 whitespace-nowrap">{formatLocalDateTime(entry.createdAt)}</td>
              <td className="px-4 py-2 font-mono text-xs">{entry.action}</td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{entry.target}</td>
              <td className="max-w-64 truncate px-4 py-2 text-muted-foreground">{entry.note ?? "—"}</td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {entry.adminId.slice(0, 8)}…
              </td>
            </tr>
          ))
        )}
      </AdminTable>
      <p className="text-xs text-muted-foreground">{audit.total} entrie(s)</p>
    </div>
  );
}
