"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { eventGuestsRoute, eventRoute, eventSettingsRoute } from "@/lib/constants";
import { EventLifecycleDialog, type EventLifecycleAction } from "./event-lifecycle-dialog";
import type { EventListItem } from "./schema";

/**
 * Row actions for the events table: open the event or one of its tabs, and the
 * lifecycle step its status allows (publish a draft, cancel a published event,
 * delete a draft or a cancelled one), each confirmed in the shared dialog.
 */
export function EventRowActions({ event }: { event: EventListItem }) {
  const t = useTranslations("events");
  const [action, setAction] = useState<EventLifecycleAction | null>(null);
  const status = event.status ?? "DRAFT";
  const id = event.id ?? "";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">{t("actions.more")}</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={eventRoute(id)}>{t("actions.open")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={eventGuestsRoute(id)}>{t("tabs.guests")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={eventSettingsRoute(id)}>{t("tabs.settings")}</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {status === "DRAFT" ? (
            <DropdownMenuItem onSelect={() => setAction("publish")}>{t("actions.publish")}</DropdownMenuItem>
          ) : null}
          {status === "PUBLISHED" ? (
            <DropdownMenuItem variant="destructive" onSelect={() => setAction("cancel")}>
              {t("actions.cancel")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onSelect={() => setAction("delete")}>
              {t("actions.delete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <EventLifecycleDialog eventId={id} action={action} onOpenChange={(open) => !open && setAction(null)} />
    </>
  );
}
