"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatLocalDateTime } from "@/lib/datetime";
import { ActionDialog } from "./action-dialog";
import {
  rejectBookingPaymentAction,
  verifyBookingPaymentAction,
} from "./admin.service";
import { formatAmount, StatusBadge } from "./admin-ui";
import type { AdminBookingPaymentDeclaration } from "./schema";

const STATUS_FILTERS = ["PENDING", "DUPLICATE", "VERIFIED", "REJECTED"] as const;

const COLUMNS: ColumnDef<DataTableFeatures, AdminBookingPaymentDeclaration>[] =
  [
    {
      accessorKey: "declaredAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-3 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Déclaré
          <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => formatLocalDateTime(row.original.declaredAt),
    },
    {
      accessorKey: "customerName",
      header: "Client",
    },
    {
      id: "booking",
      header: "Réservation",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.bookingId.slice(0, 8)}…
        </span>
      ),
    },
    {
      accessorKey: "transactionReference",
      header: "Référence",
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {row.original.transactionReference}
        </span>
      ),
    },
    {
      accessorKey: "amountMinor",
      header: "Montant",
      cell: ({ row }) =>
        formatAmount(row.original.amountMinor, row.original.currency),
    },
    {
      id: "operator",
      header: "Opérateur",
      enableSorting: false,
      cell: ({ row }) => (
        <span>
          {row.original.kind === "DEPOSIT" ? "Acompte" : "Solde"} ·{" "}
          {row.original.operator}
        </span>
      ),
    },
    {
      accessorKey: "verificationStatus",
      header: "Statut",
      cell: ({ row }) => (
        <StatusBadge status={row.original.verificationStatus} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.verificationStatus === "PENDING" ? (
          <div className="flex gap-2">
            <VerifyDeclarationButton declaration={row.original} />
            <ActionDialog
              trigger="Rejeter"
              title={`Rejeter ${row.original.transactionReference}`}
              description="Le client est notifié et peut soumettre une nouvelle déclaration."
              fieldLabel="Motif"
              confirmLabel="Rejeter"
              destructive
              onConfirm={(reason) =>
                rejectBookingPaymentAction(row.original.id, reason)
              }
            />
          </div>
        ) : (
          <span className="text-muted-foreground">
            {row.original.rejectionReason ?? "—"}
          </span>
        ),
    },
  ];

export function BookingPaymentsView({
  declarations,
}: {
  declarations: AdminBookingPaymentDeclaration[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("status") ?? "PENDING";

  function filter(status: string) {
    const params = new URLSearchParams();
    params.set("status", status);
    router.push(`${ADMIN_ROUTES.BOOKING_PAYMENTS}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={active === status ? "default" : "outline"}
            onClick={() => filter(status)}
          >
            {status}
          </Button>
        ))}
      </div>
      {active === "DUPLICATE" ? (
        <p className="rounded-lg border border-fuchsia-300 bg-fuchsia-50 p-3 text-sm text-fuchsia-900 dark:border-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200">
          Ces déclarations réutilisent une référence de transaction déjà
          enregistrée — le signe précis d&apos;une capture d&apos;écran
          recyclée. Aucune n&apos;a été validée automatiquement.
        </p>
      ) : null}

      {declarations.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptText />
            </EmptyMedia>
            <EmptyTitle>No payment declarations</EmptyTitle>
            <EmptyDescription>
              {`Aucune déclaration ${active.toLowerCase()}.`}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DataTable columns={COLUMNS} data={declarations} />
      )}
    </div>
  );
}

function VerifyDeclarationButton({
  declaration,
}: {
  declaration: AdminBookingPaymentDeclaration;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  function onVerify() {
    setIsPending(true);
    verifyBookingPaymentAction(declaration.id).then((result) => {
      setConfirmOpen(false);
      setIsPending(false);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Paiement validé — le client a été notifié.");
    });
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
      >
        Valider
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Valider {declaration.transactionReference} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ne confirmez qu&apos;après avoir vu le virement sur le compte
              receveur. Un acompte provisionne immédiatement le compte
              organisateur et un événement pré-rempli.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Retour</AlertDialogCancel>
            <Button onClick={onVerify} disabled={isPending}>
              {isPending ? "Validation…" : "Valider le paiement"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
