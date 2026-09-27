"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES, saleRoute } from "@/lib/constants";

/**
 * The event's public sale link, to share wherever the organizer sells: built
 * on its organization's username, so without one it explains where to set it.
 */
export function SaleLinkCard({ username, eventId }: { username: string | null; eventId: string }) {
  const t = useTranslations("events.orders.link");
  const [copied, setCopied] = useState(false);

  if (!username) {
    return (
      <div className="rounded-xl border p-4 text-sm">
        <p className="font-medium">{t("title")}</p>
        <p className="mt-1 text-muted-foreground">{t("noUsername")}</p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href={`${ROUTES.SETTINGS}?tab=organization`}>{t("setUsername")}</Link>
        </Button>
      </div>
    );
  }

  const path = saleRoute(username, eventId);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm font-medium">{t("title")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
      <div className="mt-3 flex gap-2">
        <Input readOnly value={path} aria-label={t("title")} className="font-mono text-xs" />
        <Button type="button" variant="outline" size="icon" onClick={copy} aria-label={t("copy")}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </Button>
        <Button asChild variant="outline" size="icon" aria-label={t("open")}>
          <a href={path} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden />
          </a>
        </Button>
      </div>
    </div>
  );
}
