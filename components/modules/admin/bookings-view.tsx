"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, CalendarX2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatLocalDateTime } from "@/lib/datetime";
import { cancelBookingAction, refundBookingAction } from "./admin.service";
import { formatAmount, StatusBadge } from "./admin-ui";
import type { AdminBooking } from "./schema";
import {
  refundBookingSchema,
  type RefundBookingFormValues,
} from "./schema";

// The statuses the backend's BookingStatus actually produces. AWAITING_BALANCE
// was never part of the state machine (the balance is a declaration kind, not a
// booking status) and listing it here made the desk 400 on every click.
const STATUS_FILTERS = [
  "AWAITING_DEPOSIT",
  "DEPOSIT_PAID",
  "FULLY_PAID",
  "CANCELLED",
  "REFUNDED",
] as const;

const COLUMNS: ColumnDef<DataTableFeatures, AdminBooking>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="size-3.5" />
      </Button>
    ),
    cell: ({ row }) => formatLocalDateTime(row.original.createdAt),
  },
  {
    accessorKey: "customerName",
    header: "Client",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.customerName}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.customerEmail}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "eventType",
    header: "Événement",
    cell: ({ row }) => (
      <span>
        {row.original.eventType} —{" "}
        {new Date(row.original.eventDate).toLocaleDateString("fr-FR")}
      </span>
    ),
  },
  {
    accessorKey: "guestCountEstimate",
    header: "Invités",
  },
  {
    accessorKey: "tier",
    header: "Palier",
  },
  {
    accessorKey: "depositAmountMinor",
    header: "Acompte",
    cell: ({ row }) =>
      formatAmount(row.original.depositAmountMinor, row.original.currency),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "account",
    header: "Compte",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.tenantId ? `${row.original.tenantId.slice(0, 8)}…` : "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => <BookingRowActions booking={row.original} />,
  },
];

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

      {bookings.length === 0 ? (
        <Empty className="mt-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarX2 />
            </EmptyMedia>
            <EmptyTitle>No bookings</EmptyTitle>
            <EmptyDescription>
              {`Aucune réservation ${active.toLowerCase()}.`}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <DataTable columns={COLUMNS} data={bookings} />
      )}
    </div>
  );
}

function BookingRowActions({ booking }: { booking: AdminBooking }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  function onCancel() {
    setIsPending(true);
    cancelBookingAction(booking.id).then((result) => {
      setConfirmOpen(false);
      setIsPending(false);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Réservation annulée.");
      router.refresh();
    });
  }

  if (booking.status === "CANCELLED") {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRefundOpen(true)}
          disabled={isPending}
        >
          Rembourser
        </Button>
        <RefundDialog
          booking={booking}
          open={refundOpen}
          onOpenChange={setRefundOpen}
        />
      </>
    );
  }

  if (booking.status === "REFUNDED") {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
      >
        Annuler
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Annuler la réservation de {booking.customerName} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Le remboursement dû est calculé selon le nombre de jours restant
              avant l&apos;événement (100 % au-delà de 60 jours, 50 % entre 30
              et 60 jours, 0 % en dessous de 30 jours). Le virement lui-même
              reste manuel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Retour</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={onCancel}
              disabled={isPending}
            >
              {isPending ? "Annulation…" : "Confirmer l'annulation"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RefundDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: AdminBooking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<RefundBookingFormValues>({
    resolver: zodResolver(refundBookingSchema),
    defaultValues: {
      amountMinor: booking.depositAmountMinor,
      reason: "",
    },
  });

  async function onSubmit(values: RefundBookingFormValues) {
    const result = await refundBookingAction(booking.id, {
      amountMinor: values.amountMinor,
      reason: values.reason.trim(),
    });
    if (!result.ok) {
      toast.error(
        result.error ?? "Le remboursement n'a pas pu être enregistré.",
      );
      return;
    }
    toast.success(
      `Remboursement de ${formatAmount(result.refund.amountMinor, result.refund.currency)} enregistré — avoir ${result.refund.creditNoteNumber ?? "—"}`,
    );
    reset();
    onOpenChange(false);
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Enregistrer le remboursement de {booking.customerName}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Le virement Mobile Money est manuel : renseignez ici le montant
            réellement restitué et son motif. Un avoir (credit note) est émis et
            le client est notifié.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="amountMinor"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Montant (minor)</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={1}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Acompte :{" "}
                    {formatAmount(booking.depositAmountMinor, booking.currency)}{" "}
                    — défaut conseillé selon la politique d&apos;annulation.
                  </FieldDescription>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="reason"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Motif (obligatoire)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={2}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isSubmitting}>Retour</AlertDialogCancel>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement…" : "Confirmer le remboursement"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
