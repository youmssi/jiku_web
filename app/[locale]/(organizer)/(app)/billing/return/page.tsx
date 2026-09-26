import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PaymentReturn, PaymentReturnMissing, fetchPaymentStatusAction } from "@/components/modules/billing";

interface PageProps {
  searchParams: Promise<{ paymentId?: string | string[] }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("billing.online.return");
  return { title: t("metaTitle") };
}

/**
 * Where the payment provider sends the payer back (JIKU-165), with the payment
 * id in the query. The backend's own record decides what the page says, never
 * the provider's redirect.
 */
export default async function PaymentReturnPage({ searchParams }: PageProps) {
  const { paymentId } = await searchParams;
  const id = typeof paymentId === "string" ? paymentId : null;
  const payment = id ? await fetchPaymentStatusAction(id) : null;
  return payment ? <PaymentReturn initial={payment} /> : <PaymentReturnMissing />;
}
