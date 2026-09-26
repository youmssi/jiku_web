import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

const VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  CANCELLED: "destructive",
};

type KnownStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

function isKnown(status: string): status is KnownStatus {
  return status in VARIANTS;
}

/** An event's status as a badge, the same in the list, the header and the Today page. */
export function EventStatusBadge({ status }: { status: string }) {
  const t = useTranslations("events.status");
  return (
    <Badge variant={VARIANTS[status] ?? "outline"}>{isKnown(status) ? t(status) : status}</Badge>
  );
}
