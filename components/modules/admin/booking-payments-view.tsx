"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatLocalDateTime } from "@/lib/datetime";
import { ActionDialog } from "./action-dialog";
import { rejectBookingPaymentAction, verifyBookingPaymentAction } from "./admin.service";
import { AdminTable, EmptyRow, formatAmount, StatusBadge } from "./admin-ui";
import type { AdminBookingPaymentDeclaration } from "./schema";

const STATUS_FILTERS = ["PENDING", "DUPLICATE", "VERIFIED", "REJECTED"] as const;

export function BookingPaymentsView({ declarations }: { declarations: AdminBookingPaymentDeclaration[] }) {
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
          Ces déclarations réutilisent une référence de transaction déjà enregistrée — le signe précis d&apos;une
          capture d&apos;écran recyclée. Aucune n&apos;a été validée automatiquement.
        </p>
      ) : null}

      <AdminTable
        headers={["Déclaré", "Client", "Réservation", "Référence", "Montant", "Opérateur", "Statut", "Actions"]}
      >
        {declarations.length === 0 ? (
          <EmptyRow span={8} label={`Aucune déclaration ${active.toLowerCase()}.`} />
        ) : (
          declarations.map((declaration) => (
            <DeclarationRow key={declaration.id} declaration={declaration} />
          ))
        )}
      </AdminTable>
    </div>
  );
}

function DeclarationRow({ declaration }: { declaration: AdminBookingPaymentDeclaration }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onVerify() {
    startTransition(async () => {
      const result = await verifyBookingPaymentAction(declaration.id);
      setConfirmOpen(false);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Paiement validé — le client a été notifié.");
    });
  }

  return (
    <tr className={declaration.verificationStatus === "DUPLICATE" ? "bg-fuchsia-50/60 dark:bg-fuchsia-950/30" : undefined}>
      <td className="px-4 py-2">{formatLocalDateTime(declaration.declaredAt)}</td>
      <td className="px-4 py-2">{declaration.customerName}</td>
      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{declaration.bookingId.slice(0, 8)}…</td>
      <td className="px-4 py-2 font-mono font-medium">{declaration.transactionReference}</td>
      <td className="px-4 py-2">{formatAmount(declaration.amountMinor, declaration.currency)}</td>
      <td className="px-4 py-2">{declaration.kind === "DEPOSIT" ? "Acompte" : "Solde"} · {declaration.operator}</td>
      <td className="px-4 py-2">
        <StatusBadge status={declaration.verificationStatus} />
      </td>
      <td className="px-4 py-2">
        {declaration.verificationStatus === "PENDING" ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setConfirmOpen(true)} disabled={isPending}>
              Valider
            </Button>
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Valider {declaration.transactionReference} ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ne confirmez qu&apos;après avoir vu le virement sur le compte receveur. Un acompte
                    provisionne immédiatement le compte organisateur et un événement pré-rempli.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>Retour</AlertDialogCancel>
                  <AlertDialogAction onClick={onVerify} disabled={isPending}>
                    {isPending ? "Validation…" : "Valider le paiement"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <ActionDialog
              trigger="Rejeter"
              title={`Rejeter ${declaration.transactionReference}`}
              description="Le client est notifié et peut soumettre une nouvelle déclaration."
              fieldLabel="Motif"
              confirmLabel="Rejeter"
              destructive
              onConfirm={(reason) => rejectBookingPaymentAction(declaration.id, reason)}
            />
          </div>
        ) : (
          <span className="text-muted-foreground">
            {declaration.rejectionReason ?? "—"}
          </span>
        )}
      </td>
    </tr>
  );
}
