"use client";

import { useTranslations } from "next-intl";
import { CalendarPlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/** What a guest does with their ticket besides showing it: put it in a calendar, keep a PDF. */
export function TicketActions({ calendarUrl }: { calendarUrl: string | null }) {
  const t = useTranslations("guest.ticket");
  return (
    <div className="mt-5 flex w-full max-w-sm flex-col gap-2 sm:flex-row print:hidden">
      {calendarUrl ? (
        <Button asChild variant="outline" className="flex-1">
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
            <CalendarPlus />
            {t("addToCalendar")}
          </a>
        </Button>
      ) : null}
      <Button variant="outline" className="flex-1" onClick={() => window.print()}>
        <Download />
        {t("save")}
      </Button>
    </div>
  );
}
