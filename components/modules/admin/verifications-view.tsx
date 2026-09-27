"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "@/i18n/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ADMIN_ROUTES } from "@/lib/constants";
import { ActionDialog } from "./action-dialog";
import { approveVerificationAction, rejectVerificationAction, verificationDocumentsAction } from "./admin.service";
import { StatusBadge } from "./admin-ui";
import type { AdminVerification, VerificationDocumentLink } from "./schema";

const STATUS_FILTERS = ["PENDING", "APPROVED", "REJECTED"] as const;

function useColumns(): ColumnDef<DataTableFeatures, AdminVerification>[] {
  const t = useTranslations("admin.verifications");
  const common = useTranslations("admin.common");
  const types = useTranslations("settings.verification.documentTypes");
  const format = useFormatter();
  return [
    {
      id: "organization",
      header: t("organization"),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.tenantName ?? "—"}</span>
          <span className="text-xs text-muted-foreground">{t(`kinds.${row.original.kind === "COMPANY" ? "COMPANY" : "PERSONAL"}`)}</span>
        </div>
      ),
    },
    {
      id: "identity",
      header: t("identity"),
      enableSorting: false,
      cell: ({ row }) => {
        const request = row.original;
        const documentType = types.has(request.documentType as never)
          ? types(request.documentType as never)
          : request.documentType;
        return (
          <div className="flex flex-col text-sm">
            <span>{request.legalName}</span>
            <span className="text-xs text-muted-foreground">{documentType}</span>
            {request.registrationNumber ? (
              <span className="text-xs text-muted-foreground">{t("rccm", { value: request.registrationNumber })}</span>
            ) : null}
            {request.taxIdentifier ? (
              <span className="text-xs text-muted-foreground">{t("nif", { value: request.taxIdentifier })}</span>
            ) : null}
            {request.phone ? (
              <span className="text-xs text-muted-foreground">{t("phone", { value: request.phone })}</span>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "submittedAt",
      header: t("submitted"),
      cell: ({ row }) => format.dateTime(new Date(row.original.submittedAt), { dateStyle: "medium", timeStyle: "short" }),
    },
    {
      accessorKey: "status",
      header: common("status"),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={row.original.status} />
          {row.original.rejectionReason ? (
            <span className="max-w-48 text-xs text-muted-foreground">{row.original.rejectionReason}</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "actions",
      header: common("actions"),
      enableSorting: false,
      cell: ({ row }) => <RowActions request={row.original} />,
    },
  ];
}

function RowActions({ request }: { request: AdminVerification }) {
  const t = useTranslations("admin.verifications");
  const router = useRouter();
  const [approving, setApproving] = useState(false);

  async function approve() {
    setApproving(true);
    const result = await approveVerificationAction(request.id);
    setApproving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("approved"));
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {request.documentsAvailable ? <DocumentsButton request={request} /> : null}
      {request.status === "PENDING" ? (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={approving}>
                {t("approve")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("approveTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("approveText", { name: request.legalName, organization: request.tenantName ?? "—" })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={approve}>{t("approve")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ActionDialog
            trigger={t("reject")}
            title={t("rejectTitle")}
            description={t("rejectText")}
            fieldLabel={t("reason")}
            confirmLabel={t("reject")}
            destructive
            onConfirm={(reason) => rejectVerificationAction(request.id, reason)}
          />
        </>
      ) : null}
    </div>
  );
}

/** Fetches the documents' short-lived links when opened, never with the queue. */
function DocumentsButton({ request }: { request: AdminVerification }) {
  const t = useTranslations("admin.verifications");
  const [links, setLinks] = useState<VerificationDocumentLink[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    const result = await verificationDocumentsAction(request.id);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setLinks(result.data);
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={open} disabled={loading}>
        {loading ? t("opening") : t("documents")}
      </Button>
      <Dialog open={links !== null} onOpenChange={(next) => (next ? null : setLinks(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("documentsTitle", { name: request.legalName })}</DialogTitle>
            <DialogDescription>{t("documentsText")}</DialogDescription>
          </DialogHeader>
          {links && links.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.position}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    <ExternalLink className="size-4" aria-hidden />
                    {t("document", { position: link.position, type: link.contentType === "application/pdf" ? "PDF" : t("image") })}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t("documentsGone")}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * The verification queue (JIKU-175, référentiel métier §9): requests oldest
 * first, their documents behind short-lived links, and the decision. A refusal
 * needs a reason the organizer will read, and deletes the documents at once.
 */
export function VerificationsView({ requests }: { requests: AdminVerification[] }) {
  const t = useTranslations("admin.verifications");
  const columns = useColumns();
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("status") ?? "PENDING";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={active === status ? "default" : "outline"}
            onClick={() => router.push(`${ADMIN_ROUTES.VERIFICATIONS}?status=${status}`)}
          >
            {t(`filters.${status}`)}
          </Button>
        ))}
      </div>

      {requests.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldCheck />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DataTable columns={columns} data={requests} />
      )}
    </div>
  );
}
