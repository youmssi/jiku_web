import type { ReactNode } from "react";

export { formatAmount } from "@/lib/currency";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  SUCCEEDED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  CONVERTED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  EXPIRING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  INTERRUPTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  EXPIRED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ENDED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  RENEWED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  VERIFIED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  REFUNDED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  FULLY_PAID: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  DEPOSIT_PAID: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  AWAITING_DEPOSIT: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  AWAITING_BALANCE: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  // Reused-screenshot fraud pattern (JIKU-55) — deliberately the loudest color
  // in the palette so it can never be mistaken for an ordinary pending state.
  DUPLICATE: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

export function AdminTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-max text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-2">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ span, label }: { span: number; label: string }) {
  return (
    <tr>
      <td colSpan={span} className="px-4 py-6 text-center text-sm text-muted-foreground">
        {label}
      </td>
    </tr>
  );
}
