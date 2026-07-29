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
import { cancelBookingAction } from "./admin.service";
import { AdminTable, EmptyRow, formatAmount, StatusBadge } from "./admin-ui";
import type { AdminBooking } from "./schema";

const STATUS_FILTERS = ["AWAITING_DEPOSIT", "DEPOSIT_PAID", "AWAITING_BALANCE", "FULLY_PAID", "CANCELLED"] as const;

export function BookingsView({ bookings }: { bookings: AdminBooking[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("status") ?? "AWAITING_DEPOSIT";

  function filter(status: string) {
    const params = new URLSearchParams();
    params.set("status", status);
    router.push(`${ADMIN_ROUTES.BOOKINGS}?${params.toString()}`);
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

      <AdminTable
        headers={["Date", "Client", "Événement", "Invités", "Palier", "Acompte", "Statut", "Compte", "Actions"]}
      >
        {bookings.length === 0 ? (
          <EmptyRow span={9} label={`Aucune réservation ${active.toLowerCase()}.`} />
        ) : (
          bookings.map((booking) => <BookingRow key={booking.id} booking={booking} />)
        )}
      </AdminTable>
    </div>
  );
}

function BookingRow({ booking }: { booking: AdminBooking }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onCancel() {
    startTransition(async () => {
      const result = await cancelBookingAction(booking.id);
      setConfirmOpen(false);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Réservation annulée.");
    });
  }

  const cancellable = booking.status !== "CANCELLED" && booking.status !== "REFUNDED";

  return (
    <tr>
      <td className="px-4 py-2">{formatLocalDateTime(booking.createdAt)}</td>
      <td className="px-4 py-2">
        <div className="font-medium">{booking.customerName}</div>
        <div className="text-xs text-muted-foreground">{booking.customerEmail}</div>
      </td>
      <td className="px-4 py-2">
        {booking.eventType} — {new Date(booking.eventDate).toLocaleDateString("fr-FR")}
      </td>
      <td className="px-4 py-2">{booking.guestCountEstimate}</td>
      <td className="px-4 py-2">{booking.tier}</td>
      <td className="px-4 py-2">{formatAmount(booking.depositAmountMinor, booking.currency)}</td>
      <td className="px-4 py-2">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
        {booking.tenantId ? `${booking.tenantId.slice(0, 8)}…` : "—"}
      </td>
      <td className="px-4 py-2">
        {cancellable ? (
          <>
            <Button size="sm" variant="destructive" onClick={() => setConfirmOpen(true)} disabled={isPending}>
              Annuler
            </Button>
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler la réservation de {booking.customerName} ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Le remboursement dû est calculé selon le nombre de jours restant avant l&apos;événement
                    (100 % au-delà de 60 jours, 50 % entre 30 et 60 jours, 0 % en dessous de 30 jours). Le
                    virement lui-même reste manuel.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>Retour</AlertDialogCancel>
                  <AlertDialogAction onClick={onCancel} disabled={isPending}>
                    {isPending ? "Annulation…" : "Confirmer l'annulation"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}
