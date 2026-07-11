"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { billingReceiptRoute } from "@/lib/constants";
import { formatLocalDateTime } from "@/lib/datetime";
import { ActivationInstructions } from "./activation-instructions";
import { requestActivationAction } from "./billing.service";
import type {
  ManualPaymentInstructions,
  PaymentHistoryItem,
  TierCatalog,
  UsageAllowance,
} from "./schema";

interface BillingViewProps {
  eventId: string;
  usage: UsageAllowance;
  catalog: TierCatalog;
  payments: PaymentHistoryItem[];
  /** The event's open activation request, when one exists (JIKU-45). */
  activation: ManualPaymentInstructions | null;
}

function formatAmount(minor: number, currency: string): string {
  return `${(minor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`;
}

export function BillingView({ eventId, usage, catalog, payments, activation }: BillingViewProps) {
  const [request, setRequest] = useState<ManualPaymentInstructions | null>(activation);
  const [isPending, startTransition] = useTransition();

  function requestTier(tier: string) {
    startTransition(async () => {
      const { instructions, error } = await requestActivationAction(eventId, tier);
      if (error) {
        toast.error(error);
        return;
      }
      if (instructions) {
        setRequest(instructions);
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionHeading>This event&apos;s allowance</SectionHeading>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            {usage.tier} tier · {usage.invitedGuests} of {usage.allowance} invitations used
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                usage.withinAllowance ? "bg-green-600" : "bg-amber-500"
              }`}
              style={{
                width: `${Math.min(100, usage.allowance > 0 ? (usage.invitedGuests / usage.allowance) * 100 : 0)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {usage.remaining} invitation(s) remaining.
          </p>
        </div>
      </section>

      {request ? (
        <section>
          <SectionHeading>Your activation request</SectionHeading>
          <ActivationInstructions instructions={request} />
        </section>
      ) : (
        <section>
          <SectionHeading>Add capacity</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2">
            {catalog.tiers.map((tier) => (
              <div key={tier.name} className="flex flex-col justify-between rounded-xl border p-4">
                <div>
                  <p className="font-medium">{tier.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Up to {tier.maxGuests.toLocaleString()} invited guests
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {formatAmount(tier.priceMinor, catalog.currency)}
                  </span>
                  <Button size="sm" onClick={() => requestTier(tier.name)} disabled={isPending}>
                    {isPending ? "Requesting…" : "Request activation"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            You&apos;ll receive payment instructions (Mobile Money or bank transfer) with a
            reference; your capacity is unlocked by our team once the transfer arrives.
          </p>
        </section>
      )}

      <section>
        <SectionHeading>Payment history</SectionHeading>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Event</th>
                  <th className="px-4 py-2">Tier</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment) => (
                  <tr key={payment.paymentId}>
                    <td className="px-4 py-2">{formatLocalDateTime(payment.createdAt)}</td>
                    <td className="px-4 py-2">{payment.eventName}</td>
                    <td className="px-4 py-2">{payment.tier}</td>
                    <td className="px-4 py-2">
                      {formatAmount(payment.amountMinor, payment.currency)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          payment.status === "SUCCEEDED"
                            ? "text-green-600 dark:text-green-400"
                            : payment.status === "FAILED"
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                        }
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {payment.status === "SUCCEEDED" ? (
                        <Link
                          href={billingReceiptRoute(payment.paymentId)}
                          className="underline underline-offset-4"
                          prefetch={false}
                        >
                          Download
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}
