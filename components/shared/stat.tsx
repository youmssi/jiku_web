"use client";

import { Link } from "@/i18n/navigation";

/**
 * One KPI tile: a label, a big number, and an optional tone/link. Shared by the
 * organizer dashboard and the admin back-office overview strips so every "at a
 * glance" number in the app reads the same way.
 */
export function Stat({
  label,
  value,
  tone = "default",
  href,
}: {
  label: string;
  value: number | string;
  tone?: "default" | "positive" | "urgent" | "muted";
  href?: string;
}) {
  const valueClass =
    tone === "positive"
      ? "text-green-600 dark:text-green-400"
      : tone === "urgent"
        ? "text-red-600 dark:text-red-400"
        : tone === "muted"
          ? "text-muted-foreground"
          : "";
  const content = (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
  if (!href) {
    return content;
  }
  return (
    <Link href={href} className="rounded-xl transition-colors hover:bg-muted/50">
      {content}
    </Link>
  );
}
