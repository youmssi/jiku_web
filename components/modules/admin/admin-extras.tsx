"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <Card>
        <CardHeader>
          <CardTitle>Tarifs par catégorie (USD, minor)</CardTitle>
          <CardDescription>
            Cost charged per message category. Changes apply to the next send.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pricing.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircle />
                </EmptyMedia>
                <EmptyTitle>No pricing configured</EmptyTitle>
                <EmptyDescription>
                  The backend has no WhatsApp pricing categories yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Coût (USD minor)</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricing.map((price) => (
                  <TableRow key={price.category}>
                    <TableCell className="font-medium">
                      {price.category}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="w-36"
                        value={costs[price.category] ?? ""}
                        onChange={(e) =>
                          setCosts((current) => ({
                            ...current,
                            [price.category]: e.target.value,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() => saveCost(price.category)}
                      >
                        Enregistrer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Surcharge de contenu (santé/urgence)</CardTitle>
          <CardDescription>
            Temporarily intercept the health/emergency message category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {override.active ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge>Active</Badge>
                <p className="mt-1 text-sm text-muted-foreground">
                  {override.reason ?? "Aucun motif"} —{" "}
                  {override.activatedBy ?? "admin"} le{" "}
                  {override.activatedAt
                    ? new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(override.activatedAt))
                    : ""}
                </p>
              </div>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => toggleOverride(false)}
              >
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
              <Button
                disabled={pending || !overrideReason.trim()}
                onClick={() => toggleOverride(true)}
              >
                Activer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const PROSPECT_COLUMNS: ColumnDef<DataTableFeatures, ProspectLead>[] = [
  {
    accessorKey: "businessName",
    header: "Entreprise",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.businessName}</span>
    ),
  },
  {
    accessorKey: "contactName",
    header: "Contact",
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
  },
  {
    accessorKey: "sector",
    header: "Secteur",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(
        new Date(row.original.createdAt),
      ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    filterFn: "includesString",
    cell: ({ row }) =>
      row.original.status === "CONTACTED" ? (
        <Badge variant="outline">Contactée</Badge>
      ) : (
        <Badge>Nouvelle</Badge>
      ),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.status !== "CONTACTED" ? (
        <MarkContactedButton prospect={row.original} />
      ) : null,
  },
];

/** Pistes d'accès anticipé (JIKU-98) : rappeler dans l'ordre d'arrivée. */
export function ProspectsTable({ prospects }: { prospects: ProspectLead[] }) {
  if (prospects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserPlus />
          </EmptyMedia>
          <EmptyTitle>No prospects yet</EmptyTitle>
          <EmptyDescription>Aucune piste pour le moment.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <DataTable
      columns={PROSPECT_COLUMNS}
      data={prospects}
      searchColumn="businessName"
      searchPlaceholder="Search by business name…"
    />
  );
}

function MarkContactedButton({ prospect }: { prospect: ProspectLead }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function contact() {
    start(async () => {
      const result = await markProspectContactedAction(prospect.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success(`« ${prospect.businessName} » marquée comme contactée.`);
        router.refresh();
      }
    });
  }

  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={contact}>
      Marquer contactée
    </Button>
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
        toast.success(
          "Exception de test déclenchée — retrouvez ce requestId dans le traqueur.",
        );
      } else {
        toast.error(result.error ?? "Aucune erreur remontée.");
      }
    });
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Error chain probe</CardTitle>
        <CardDescription>
          Déclenche une exception volontaire (500). Le{" "}
          <code>requestId</code> renvoyé doit apparaître dans le traqueur
          d&apos;erreurs — c&apos;est la preuve que la chaîne de remontée
          fonctionne de bout en bout.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={run} disabled={pending} variant="outline">
          {pending ? "Déclenchement…" : "Déclencher l'erreur de test"}
        </Button>
        {requestId ? (
          <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
            requestId : {requestId}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
