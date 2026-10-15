"use client";

import { CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supportEmail, supportMailto, supportWhatsAppLink } from "@/lib/support";

/**
 * Persistent support contact (JIKU-27B). Rendered by the organizer layout so it is
 * reachable from every organizer page. It opens a small menu linking to a real,
 * monitored email (and WhatsApp, when configured) — no ticketing system at MVP.
 */
export function SupportButton() {
  const whatsApp = supportWhatsAppLink();
  const t = useTranslations("common.support");

  return (
    <div className="fixed right-4 bottom-4 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="secondary" aria-label={t("open")} className="shadow-md max-md:size-11 max-md:rounded-full max-md:p-0">
            <CircleHelp className="md:hidden" aria-hidden />
            <span className="max-md:sr-only">{t("open")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-60">
          <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={supportMailto()}>{t("email", { email: supportEmail() })}</a>
          </DropdownMenuItem>
          {whatsApp ? (
            <DropdownMenuItem asChild>
              <a href={whatsApp} target="_blank" rel="noopener noreferrer">
                {t("whatsapp")}
              </a>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
