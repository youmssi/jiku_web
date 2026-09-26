"use client";

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
    <div className="fixed bottom-20 right-4 z-40 md:bottom-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="secondary" className="shadow-md">
            {t("open")}
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
