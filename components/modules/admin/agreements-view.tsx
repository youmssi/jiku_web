"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatLocalDateTime } from "@/lib/datetime";
import { ActionDialog } from "./action-dialog";
import { createAgreementAction, interruptAgreementAction, renewAgreementAction } from "./admin.service";
import { AdminTable, EmptyRow, formatAmount, StatusBadge } from "./admin-ui";
import { TenantCombobox } from "./tenant-combobox";
import type { AdminAgreement, AdminTierCatalog, TenantDirectoryEntry } from "./schema";

export function AgreementsView({
  agreements,
  catalog,
}: {
  agreements: AdminAgreement[];
  catalog: AdminTierCatalog;
}) {
  return (
    <div className="flex flex-col gap-6">
      <CreateAgreementForm currency={catalog.currency} />

      <AdminTable
        headers={["Tenant", "Kind", "Period", "Renewal", "Amount", "Status", "Notes", "Actions"]}
      >
        {agreements.length === 0 ? (
          <EmptyRow span={8} label="No agreements yet." />
        ) : (
          agreements.map((agreement) => (
            <tr key={agreement.id}>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {agreement.tenantId.slice(0, 8)}…
              </td>
              <td className="px-4 py-2">{agreement.kind}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                {formatLocalDateTime(agreement.periodStart)} → {formatLocalDateTime(agreement.periodEnd)}
              </td>
              <td className="px-4 py-2">{formatLocalDateTime(agreement.renewalAt)}</td>
              <td className="px-4 py-2">
                {agreement.amountMinor != null && agreement.currency
                  ? formatAmount(agreement.amountMinor, agreement.currency)
                  : "—"}
              </td>
              <td className="px-4 py-2">
                <StatusBadge status={agreement.status} />
              </td>
              <td className="max-w-48 truncate px-4 py-2 text-muted-foreground">
                {agreement.interruptedReason ?? agreement.notes ?? "—"}
              </td>
              <td className="px-4 py-2">
                {agreement.status === "ACTIVE" ? (
                  <div className="flex gap-2">
                    <ActionDialog
                      trigger="Renew"
                      title="Renew this agreement"
                      description="Closes the current period and opens the next one, ending at the date below."
                      fieldLabel="New period end (YYYY-MM-DD)"
                      confirmLabel="Renew"
                      onConfirm={(date) => renewAgreementAction(agreement.id, toInstant(date))}
                    />
                    <ActionDialog
                      trigger="Interrupt"
                      title="Interrupt this agreement"
                      description="For an ENTERPRISE_SAAS deal this also suspends the tenant immediately."
                      fieldLabel="Reason"
                      confirmLabel="Interrupt"
                      destructive
                      onConfirm={(reason) => interruptAgreementAction(agreement.id, reason)}
                    />
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}

/** A date-only entry means end of that day, UTC. Invalid input becomes "" and the backend rejects it. */
function toInstant(date: string): string {
  const parsed = new Date(`${date.trim()}T23:59:59Z`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function CreateAgreementForm({ currency }: { currency: string }) {
  const [tenant, setTenant] = useState<TenantDirectoryEntry | null>(null);
  const [kind, setKind] = useState("ENTERPRISE_SAAS");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!tenant) {
      toast.error("Pick an organization first.");
      return;
    }
    startTransition(async () => {
      const { error } = await createAgreementAction({
        tenantId: tenant.id,
        kind,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(`${periodEnd}T23:59:59Z`).toISOString(),
        // The platform currency (GNF) has no minor unit, so the typed amount is
        // the full amount rather than centimes.
        amountMinor: amount.trim() ? Math.round(Number(amount)) : null,
        currency: amount.trim() ? currency : null,
        notes: notes.trim() || null,
      });
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Agreement recorded.");
      setTenant(null);
      setPeriodStart("");
      setPeriodEnd("");
      setAmount("");
      setNotes("");
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-6">
      <div className="grid gap-1.5">
        <Label htmlFor="agr-tenant">Organization</Label>
        <TenantCombobox id="agr-tenant" value={tenant} onChange={setTenant} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="agr-kind">Kind</Label>
        <select
          id="agr-kind"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="ENTERPRISE_SAAS">ENTERPRISE_SAAS</option>
          <option value="ON_PREMISE">ON_PREMISE</option>
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="agr-start">Starts</Label>
        <Input
          id="agr-start"
          type="date"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="agr-end">Ends</Label>
        <Input
          id="agr-end"
          type="date"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="agr-amount">Amount ({currency}, optional)</Label>
        <Input
          id="agr-amount"
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="agr-notes">Notes</Label>
        <div className="flex gap-2">
          <Input id="agr-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button type="submit" disabled={isPending}>
            {isPending ? "…" : "Create"}
          </Button>
        </div>
      </div>
    </form>
  );
}
