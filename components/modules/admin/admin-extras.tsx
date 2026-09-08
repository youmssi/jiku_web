"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  markProspectContactedAction,
  setWhatsAppOverrideAction,
  triggerDiagnosticsAction,
  updateWhatsAppPricingAction,
} from "@/components/modules/admin/admin.service";
import type {
  ProspectLead,
  WhatsAppOverrideStatus,
  WhatsAppPricingInfo,
} from "@/components/modules/admin/schema";

/** Tarifs WhatsApp par catégorie + surcharge de contenu (JIKU-61). */
export function WhatsAppAdmin({
  pricing,
  override,
}: {
  pricing: WhatsAppPricingInfo[];
  override: WhatsAppOverrideStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [costs, setCosts] = useState<Record<string, string>>(() =>
    Object.fromEntries(pricing.map((p) => [p.category, String(p.costUsdMinor)])),
  );
  const [overrideReason, setOverrideReason] = useState("");

  function saveCost(category: string) {
    const raw = costs[category];
    const value = Number.parseInt(raw ?? "", 10);
    if (!Number.isFinite(value) || value < 0) return;
    start(async () => {
      const result = await updateWhatsAppPricingAction(category, value);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Tarif mis à jour.");
        router.refresh();
      }
    });
  }

  function toggleOverride(nextActive: boolean) {
    const reason = overrideReason.trim();
    if (nextActive && !reason) {
      toast.error("Indiquez le motif de la surcharge.");
      return;
    }
    start(async () => {
      const result = await setWhatsAppOverrideAction(nextActive, reason);
      if (result.error) toast.error(result.error);
      else {
        setOverrideReason("");
        toast.success(nextActive ? "Surcharge activée." : "Surcharge désactivée.");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Tarifs par catégorie (USD, minor)</h2>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Catégorie</th>
                <th className="px-4 py-2">Coût (USD minor)</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {pricing.map((price) => (
                <tr key={price.category}>
                  <td className="px-4 py-2 font-medium">{price.category}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      min={0}
                      className="w-36"
                      value={costs[price.category] ?? ""}
                      onChange={(e) =>
                        setCosts((current) => ({ ...current, [price.category]: e.target.value }))
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => saveCost(price.category)}>
                      Enregistrer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Surcharge de contenu (santé/urgence)</h2>
        <div className="rounded-xl border p-4">
          {override.active ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge>Active</Badge>
                <p className="mt-1 text-sm text-muted-foreground">
                  {override.reason ?? "Aucun motif"} — {override.activatedBy ?? "admin"} le{" "}
                  {override.activatedAt
                    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(
                        new Date(override.activatedAt),
                      )
                    : ""}
                </p>
              </div>
              <Button variant="outline" disabled={pending} onClick={() => toggleOverride(false)}>
                Désactiver
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-64 flex-1">
                <p className="text-sm text-muted-foreground">Inactive.</p>
                <Input
                  className="mt-2"
                  placeholder="Motif de la surcharge (ex. incident WhatsApp)"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              </div>
              <Button disabled={pending || !overrideReason.trim()} onClick={() => toggleOverride(true)}>
                Activer
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/** Pistes d'accès anticipé (JIKU-98) : rappeler dans l'ordre d'arrivée. */
export function ProspectsTable({ prospects }: { prospects: ProspectLead[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function contact(id: string, businessName: string) {
    start(async () => {
      const result = await markProspectContactedAction(id);
      if (result.error) toast.error(result.error);
      else {
        toast.success(`« ${businessName} » marquée comme contactée.`);
        router.refresh();
      }
    });
  }

  if (prospects.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune piste pour le moment.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-2">Entreprise</th>
            <th className="px-4 py-2">Contact</th>
            <th className="px-4 py-2">Téléphone</th>
            <th className="px-4 py-2">Secteur</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {prospects.map((prospect) => (
            <tr key={prospect.id}>
              <td className="px-4 py-2 font-medium">{prospect.businessName}</td>
              <td className="px-4 py-2">{prospect.contactName}</td>
              <td className="px-4 py-2">{prospect.phone}</td>
              <td className="px-4 py-2">{prospect.sector}</td>
              <td className="px-4 py-2">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(prospect.createdAt))}
              </td>
              <td className="px-4 py-2">
                {prospect.status === "CONTACTED" ? <Badge variant="outline">Contactée</Badge> : <Badge>Nouvelle</Badge>}
              </td>
              <td className="px-4 py-2">
                {prospect.status !== "CONTACTED" ? (
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => contact(prospect.id, prospect.businessName)}>
                    Marquer contactée
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Diagnostic de la chaîne d'erreurs (JIKU-97) : déclenche un 500 de test. */
export function DiagnosticsPanel() {
  const [pending, start] = useTransition();
  const [requestId, setRequestId] = useState<string | null>(null);

  function run() {
    start(async () => {
      const result = await triggerDiagnosticsAction();
      if (result.requestId) {
        setRequestId(result.requestId);
        toast.success("Exception de test déclenchée — retrouvez ce requestId dans le traqueur.");
      } else {
        toast.error(result.error ?? "Aucune erreur remontée.");
      }
    });
  }

  return (
    <div className="max-w-xl rounded-xl border p-5">
      <p className="text-sm text-muted-foreground">
        Déclenche une exception volontaire (500). Le <code>requestId</code> renvoyé doit apparaître dans le
        traqueur d&apos;erreurs — c&apos;est la preuve que la chaîne de remontée fonctionne de bout en bout.
      </p>
      <Button onClick={run} disabled={pending} className="mt-4" variant="outline">
        {pending ? "Déclenchement…" : "Déclencher l'erreur de test"}
      </Button>
      {requestId ? (
        <p className="mt-3 break-all font-mono text-xs text-muted-foreground">requestId : {requestId}</p>
      ) : null}
    </div>
  );
}
