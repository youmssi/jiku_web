import { FileText } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { billingInvoiceDocumentRoute } from "@/lib/constants";
import { useLocale, useTranslations } from "next-intl";
import { formatAmount } from "@/lib/currency";
import { formatLocalDateTime } from "@/lib/datetime";
import { CreditNoteButton } from "@/components/modules/billing/invoice-actions";
import type { InvoiceSummary } from "./schema";

/**
 * Issued invoices and credit notes (JIKU-69), the documents a company's
 * accounts department can actually process, as opposed to the plain-text
 * payment receipt beside them.
 *
 * A credit note is labelled and shown with its negative total rather than
 * hidden, because the pair is what reconciles: an accountant needs to see both
 * the original and its correction.
 */
export function InvoicesTable({ invoices }: { invoices: InvoiceSummary[] }) {
  const t = useTranslations("billing.invoices");
  const locale = useLocale();
  if (invoices.length === 0) {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>
          <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("emptyText")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("number")}</TableHead>
            <TableHead>{t("type")}</TableHead>
            <TableHead>{t("issued")}</TableHead>
            <TableHead>{t("total")}</TableHead>
            <TableHead>{t("document")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>
                {invoice.documentType === "CREDIT_NOTE" ? t("creditNote") : t("invoice")}
              </TableCell>
              <TableCell>{formatLocalDateTime(invoice.issuedAt)}</TableCell>
              <TableCell>{formatAmount(invoice.totalMinor, invoice.currency, locale)}</TableCell>
              <TableCell>
                <a
                  href={billingInvoiceDocumentRoute(invoice.id)}
                  className="text-primary underline underline-offset-4"
                >
                  {t("pdf")}
                </a>
              </TableCell>
              <TableCell>
                {invoice.documentType === "INVOICE" ? (
                  <CreditNoteButton invoiceId={invoice.id} />
                ) : (
                  <span className="text-muted-foreground">{t("none")}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
