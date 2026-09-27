import { useTranslations } from "next-intl";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The organizer's verification as guests see it (référentiel métier §9):
 * "Verified organization" for a company verification, "Verified identity" for
 * a personal one, nothing when the organizer is not verified.
 */
export function VerifiedBadge({ kind, className }: { kind: string | null | undefined; className?: string }) {
  const t = useTranslations("guest.verification");
  if (kind !== "COMPANY" && kind !== "PERSONAL") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
        className,
      )}
      title={t("hint")}
    >
      <BadgeCheck aria-hidden className="size-3.5" />
      {t(kind === "COMPANY" ? "company" : "personal")}
    </span>
  );
}
