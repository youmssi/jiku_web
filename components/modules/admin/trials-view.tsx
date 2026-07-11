"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatLocalDateTime } from "@/lib/datetime";
import { ActionDialog } from "./action-dialog";
import { endTrialAction, grantTrialAction } from "./admin.service";
import { AdminTable, EmptyRow, StatusBadge } from "./admin-ui";
import type { AdminTrial } from "./schema";

export function TrialsView({ trials }: { trials: AdminTrial[] }) {
  return (
    <div className="flex flex-col gap-6">
      <GrantTrialForm />

      <AdminTable headers={["Granted", "Tenant", "Event", "Tier", "Expires", "Status", "Actions"]}>
        {trials.length === 0 ? (
          <EmptyRow span={7} label="No trials yet." />
        ) : (
          trials.map((trial) => (
            <tr key={trial.id}>
              <td className="px-4 py-2">{formatLocalDateTime(trial.createdAt)}</td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {trial.tenantId.slice(0, 8)}…
              </td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {trial.eventId.slice(0, 8)}…
              </td>
              <td className="px-4 py-2">{trial.tier}</td>
              <td className="px-4 py-2">{formatLocalDateTime(trial.expiresAt)}</td>
              <td className="px-4 py-2">
                <StatusBadge status={trial.status} />
              </td>
              <td className="px-4 py-2">
                {trial.status === "ACTIVE" ? (
                  <ActionDialog
                    trigger="End early"
                    title="End this trial"
                    description="The event's allowance reverts to its paid entitlement and the organizer is notified."
                    fieldLabel="Reason"
                    confirmLabel="End trial"
                    destructive
                    onConfirm={(reason) => endTrialAction(trial.id, reason)}
                  />
                ) : (
                  <span className="text-muted-foreground">{trial.endedReason ?? "—"}</span>
                )}
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}

function GrantTrialForm() {
  const [tenantId, setTenantId] = useState("");
  const [eventId, setEventId] = useState("");
  const [tier, setTier] = useState("STANDARD");
  const [expiresAt, setExpiresAt] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const { error } = await grantTrialAction({
        tenantId: tenantId.trim(),
        eventId: eventId.trim(),
        tier,
        expiresAt: new Date(expiresAt).toISOString(),
      });
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Trial granted — the organizer has been notified.");
      setTenantId("");
      setEventId("");
      setExpiresAt("");
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="grid gap-1.5">
        <Label htmlFor="trial-tenant">Tenant id</Label>
        <Input id="trial-tenant" value={tenantId} onChange={(e) => setTenantId(e.target.value)} required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="trial-event">Event id</Label>
        <Input id="trial-event" value={eventId} onChange={(e) => setEventId(e.target.value)} required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="trial-tier">Tier</Label>
        <select
          id="trial-tier"
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="STANDARD">STANDARD</option>
          <option value="PREMIUM">PREMIUM</option>
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="trial-expiry">Expires</Label>
        <Input
          id="trial-expiry"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          required
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Granting…" : "Grant trial"}
        </Button>
      </div>
    </form>
  );
}
