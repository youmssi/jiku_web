"use client";

import { useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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
  const t = useTranslations("admin.whatsapp");
  const format = useFormatter();
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
      if (!result.ok) toast.error(result.error);
      else {
        toast.success(t("priceSaved"));
        router.refresh();
      }
    });
  }

  function toggleOverride(nextActive: boolean) {
    const reason = overrideReason.trim();
    if (nextActive && !reason) {
      toast.error(t("reasonRequired"));
      return;
    }
    start(async () => {
      const result = await setWhatsAppOverrideAction(nextActive, reason);
      if (!result.ok) toast.error(result.error);
      else {
        setOverrideReason("");
        toast.success(nextActive ? t("activated") : t("deactivated"));
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("pricingTitle")}</CardTitle>
          <CardDescription>{t("pricingText")}</CardDescription>
        </CardHeader>
        <CardContent>
          {pricing.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircle />
                </EmptyMedia>
                <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
                <EmptyDescription>{t("emptyText")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("category")}</TableHead>
                  <TableHead>{t("cost")}</TableHead>
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
                        {t("save")}
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
          <CardTitle>{t("overrideTitle")}</CardTitle>
          <CardDescription>{t("overrideText")}</CardDescription>
        </CardHeader>
        <CardContent>
          {override.active ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge>{t("active")}</Badge>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("activatedBy", {
                    reason: override.reason ?? t("noReason"),
                    by: override.activatedBy ?? "admin",
                    date: override.activatedAt
                      ? format.dateTime(new Date(override.activatedAt), { dateStyle: "short", timeStyle: "short" })
                      : "",
                  })}
                </p>
              </div>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => toggleOverride(false)}
              >
                {t("deactivate")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-64 flex-1">
                <p className="text-sm text-muted-foreground">{t("inactive")}</p>
                <Input
                  className="mt-2"
                  placeholder={t("reasonPlaceholder")}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              </div>
              <Button
                disabled={pending || !overrideReason.trim()}
                onClick={() => toggleOverride(true)}
              >
                {t("activate")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function useProspectColumns(): ColumnDef<DataTableFeatures, ProspectLead>[] {
  const t = useTranslations("admin.prospects");
  const format = useFormatter();
  return [
  {
    accessorKey: "businessName",
    header: t("business"),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.businessName}</span>
    ),
  },
  {
    accessorKey: "contactName",
    header: t("contact"),
  },
  {
    accessorKey: "phone",
    header: t("phone"),
  },
  {
    accessorKey: "sector",
    header: t("sector"),
  },
  {
    accessorKey: "createdAt",
    header: t("date"),
    cell: ({ row }) =>
      format.dateTime(new Date(row.original.createdAt), { dateStyle: "short" }),
  },
  {
    accessorKey: "status",
    header: t("status"),
    filterFn: "includesString",
    cell: ({ row }) =>
      row.original.status === "CONTACTED" ? (
        <Badge variant="outline">{t("contacted")}</Badge>
      ) : (
        <Badge>{t("new")}</Badge>
      ),
  },
  {
    id: "actions",
    header: t("actions"),
    enableSorting: false,
    cell: ({ row }) =>
      row.original.status !== "CONTACTED" ? (
        <MarkContactedButton prospect={row.original} />
      ) : null,
  },
];
}

/** Pistes d'accès anticipé (JIKU-98) : rappeler dans l'ordre d'arrivée. */
export function ProspectsTable({ prospects }: { prospects: ProspectLead[] }) {
  const t = useTranslations("admin.prospects");
  const columns = useProspectColumns();
  if (prospects.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserPlus />
          </EmptyMedia>
          <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("emptyText")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={prospects}
      searchColumn="businessName"
      searchPlaceholder={t("search")}
    />
  );
}

function MarkContactedButton({ prospect }: { prospect: ProspectLead }) {
  const t = useTranslations("admin.prospects");
  const router = useRouter();
  const [pending, start] = useTransition();

  function contact() {
    start(async () => {
      const result = await markProspectContactedAction(prospect.id);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success(t("marked", { name: prospect.businessName }));
        router.refresh();
      }
    });
  }

  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={contact}>
      {t("markContacted")}
    </Button>
  );
}

/** Diagnostic de la chaîne d'erreurs (JIKU-97) : déclenche un 500 de test. */
export function DiagnosticsPanel() {
  const t = useTranslations("admin.diagnostics");
  const [pending, start] = useTransition();
  const [requestId, setRequestId] = useState<string | null>(null);

  function run() {
    start(async () => {
      const result = await triggerDiagnosticsAction();
      if (result.ok) {
        setRequestId(result.data.requestId);
        toast.success(t("triggered"));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t.rich("text", { code: (chunks) => <code>{chunks}</code> })}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={run} disabled={pending} variant="outline">
          {pending ? t("running") : t("run")}
        </Button>
        {requestId ? (
          <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
            {t("requestId", { id: requestId })}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
