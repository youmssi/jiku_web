import Link from "next/link";
import { StateMessage } from "@/components/shared/state-message";
import { formatAmount } from "@/lib/currency";
import { reservationPaymentUrl } from "@/lib/constants";
import { fetchBookingStatus } from "@/components/modules/booking/booking.service";
import { EVENT_TYPE_LABELS } from "@/components/modules/booking/schema";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  AWAITING_DEPOSIT: "En attente d'acompte",
  DEPOSIT_PAID: "Date confirmée",
  AWAITING_BALANCE: "En attente du solde",
  FULLY_PAID: "Entièrement réglée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export async function BookingStatusView({ id, token }: { id: string; token: string }) {
  const status = await fetchBookingStatus(id, token);

  if (!status) {
    return <StateMessage title="Réservation introuvable" description="Ce lien est invalide ou a expiré." />;
  }

  const paymentDue = status.status === "AWAITING_DEPOSIT" || status.status === "AWAITING_BALANCE";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Votre réservation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {EVENT_TYPE_LABELS[status.eventType as keyof typeof EVENT_TYPE_LABELS] ?? status.eventType} —{" "}
          {new Date(status.eventDate).toLocaleDateString("fr-FR")}
        </p>
      </div>

      <div className="rounded-xl border p-5">
        <p className="text-sm font-medium text-muted-foreground">Statut</p>
        <p className="mt-1 text-xl font-semibold">{STATUS_LABELS[status.status] ?? status.status}</p>

        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Palier</dt>
          <dd>{status.tier}</dd>
          <dt className="text-muted-foreground">Invités estimés</dt>
          <dd>{status.guestCountEstimate}</dd>
          <dt className="text-muted-foreground">Montant total</dt>
          <dd>{formatAmount(status.totalAmountMinor, status.currency)}</dd>
          <dt className="text-muted-foreground">Acompte</dt>
          <dd>{formatAmount(status.depositAmountMinor, status.currency)}</dd>
          <dt className="text-muted-foreground">Solde</dt>
          <dd>{formatAmount(status.balanceAmountMinor, status.currency)}</dd>
          <dt className="text-muted-foreground">Solde dû le</dt>
          <dd>{new Date(status.balanceDueDate).toLocaleDateString("fr-FR")}</dd>
        </dl>
      </div>

      {paymentDue ? (
        <Link
          href={reservationPaymentUrl(id, token)}
          className="rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
        >
          Déclarer mon paiement
        </Link>
      ) : null}
    </div>
  );
}
