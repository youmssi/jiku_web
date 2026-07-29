import { StateMessage } from "@/components/shared/state-message";
import { formatAmount } from "@/lib/currency";
import { fetchBookingPayee, fetchBookingStatus } from "@/components/modules/booking/booking.service";
import { DeclarePaymentForm } from "@/components/modules/booking/declare-payment-form";

const OPERATOR_LABELS: Record<string, string> = {
  ORANGE_MONEY: "Orange Money",
  MTN_MOMO: "MTN MoMo",
};

/** Step-by-step Mobile Money instructions, then the transaction-reference declaration form. */
export async function PaymentInstructionsView({ id, token }: { id: string; token: string }) {
  const [status, payee] = await Promise.all([fetchBookingStatus(id, token), fetchBookingPayee(id, token)]);

  if (!status) {
    return <StateMessage title="Réservation introuvable" description="Ce lien est invalide ou a expiré." />;
  }

  const kind = status.status === "AWAITING_DEPOSIT" ? "DEPOSIT" : "BALANCE";
  const amountMinor = kind === "DEPOSIT" ? status.depositAmountMinor : status.balanceAmountMinor;
  const nothingDue = status.status === "FULLY_PAID" || status.status === "CANCELLED" || status.status === "REFUNDED";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Instructions de paiement</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {kind === "DEPOSIT"
            ? "Réglez votre acompte pour verrouiller votre date."
            : "Réglez votre solde avant le jour J."}
        </p>
      </div>

      {nothingDue ? (
        <StateMessage
          title="Rien à régler"
          description={`Le statut de votre réservation est : ${status.status}.`}
        />
      ) : (
        <>
          <ol className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-5 text-sm">
            <li>
              <strong>1.</strong> Déposez {formatAmount(amountMinor, status.currency)} sur l&apos;un des comptes ci-dessous.
              <ul className="mt-2 flex flex-col gap-1 pl-4">
                {payee?.orangeMoneyNumber ? (
                  <li>
                    {OPERATOR_LABELS.ORANGE_MONEY} : <span className="font-mono">{payee.orangeMoneyNumber}</span>
                    {payee.payeeName ? ` (${payee.payeeName})` : ""}
                  </li>
                ) : null}
                {payee?.mtnMomoNumber ? (
                  <li>
                    {OPERATOR_LABELS.MTN_MOMO} : <span className="font-mono">{payee.mtnMomoNumber}</span>
                    {payee.payeeName ? ` (${payee.payeeName})` : ""}
                  </li>
                ) : null}
              </ul>
            </li>
            <li>
              <strong>2.</strong> Notez l&apos;identifiant de transaction (ID) affiché après le dépôt.
            </li>
            <li>
              <strong>3.</strong> Renseignez-le ci-dessous. Nous validons et vous recevons une confirmation sous 1
              heure en journée.
            </li>
          </ol>

          <DeclarePaymentForm id={id} token={token} kind={kind} amountMinor={amountMinor} currency={status.currency} />
        </>
      )}
    </div>
  );
}
