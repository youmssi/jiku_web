"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { creditNoteAction, issueInvoiceAction } from "@/components/modules/billing/billing.service";

/** Émet la facture d'un paiement réglé ; l'écran rechargé montre le nouveau document. */
export function IssueInvoiceButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function issue() {
    setError(null);
    start(async () => {
      const result = await issueInvoiceAction(paymentId);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Facture émise.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button size="sm" variant="outline" onClick={issue} disabled={pending}>
        {pending ? "Émission…" : "Issue invoice"}
      </Button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

/** Émet la note de crédit corrigeant une facture (documentType INVOICE uniquement). */
export function CreditNoteButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function credit() {
    start(async () => {
      const result = await creditNoteAction(invoiceId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Note de crédit émise.");
      router.refresh();
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={credit} disabled={pending}>
      {pending ? "Émission…" : "Credit note"}
    </Button>
  );
}
