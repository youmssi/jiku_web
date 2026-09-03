import Link from "next/link";
import { billingInvoiceDocumentRoute } from "@/lib/constants";
import { formatAmount } from "@/lib/currency";
import { formatLocalDateTime } from "@/lib/datetime";
import type { InvoiceSummary } from "./schema";

/**
 * Issued invoices and credit notes (JIKU-69) — the documents a company's
 * accounts department can actually process, as opposed to the plain-text
 * payment receipt beside them.
 *
 * A credit note is labelled and shown with its negative total rather than
 * hidden, because the pair is what reconciles: an accountant needs to see both
 * the original and its correction.
 */
export function InvoicesTable({ invoices }: { invoices: InvoiceSummary[] }) {
  if (invoices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No invoices yet. Issue one from a settled payment when a buyer needs a formal document.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-2">Number</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Issued</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Document</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="px-4 py-2 font-medium">{invoice.invoiceNumber}</td>
              <td className="px-4 py-2">
                {invoice.documentType === "CREDIT_NOTE" ? "Credit note" : "Invoice"}
              </td>
              <td className="px-4 py-2">{formatLocalDateTime(invoice.issuedAt)}</td>
              <td className="px-4 py-2">{formatAmount(invoice.totalMinor, invoice.currency)}</td>
              <td className="px-4 py-2">
                <Link
                  href={billingInvoiceDocumentRoute(invoice.id)}
                  className="text-primary underline underline-offset-4"
                  prefetch={false}
                >
                  Download PDF
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
