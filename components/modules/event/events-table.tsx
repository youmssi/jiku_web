"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ChevronRight, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DataTable } from "@/components/ui/data-table";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventRoute } from "@/lib/constants";
import { useEventColumns } from "./columns";
import { EventStatusBadge } from "./event-status-badge";
import type { EventListItem } from "./schema";

const STATUSES = ["PUBLISHED", "DRAFT", "CANCELLED"] as const;
const ALL = "ALL";

/**
 * The events list: searchable by name and filterable by status. A sortable
 * table on a wide screen; on a phone, one tappable row per event with its
 * status and date (JIKU-255), since a table there only scrolls sideways.
 */
export function EventsTable({ events }: { events: EventListItem[] }) {
  const t = useTranslations("events");
  const format = useFormatter();
  const columns = useEventColumns();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>(ALL);

  const shown = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return events.filter(
      (event) =>
        (status === ALL || event.status === status) &&
        (needle === "" || (event.name ?? "").toLocaleLowerCase().includes(needle)),
    );
  }, [events, query, status]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 py-4">
        <InputGroup className="min-w-0 flex-1 md:max-w-sm">
          <InputGroupInput
            placeholder={t("list.search")}
            aria-label={t("list.search")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-auto shrink-0 md:w-44" aria-label={t("list.columns.status")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("list.allStatuses")}</SelectItem>
            {STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`status.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ItemGroup className="gap-2 md:hidden">
        {shown.map((event) => (
          <Item key={event.id} variant="outline" asChild>
            <Link href={eventRoute(event.id ?? "")}>
              <ItemContent>
                <ItemTitle>{event.name}</ItemTitle>
                <ItemDescription className="flex flex-wrap items-center gap-2">
                  <EventStatusBadge status={event.status ?? ""} />
                  <span>
                    {event.startDateTime
                      ? format.dateTime(new Date(event.startDateTime), {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: event.timezone,
                        })
                      : t("list.columns.undated")}
                  </span>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4" aria-hidden />
              </ItemActions>
            </Link>
          </Item>
        ))}
        {shown.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">{t("list.noMatch")}</p> : null}
      </ItemGroup>

      <div className="hidden md:block">
        <DataTable columns={columns} data={shown} />
      </div>
    </div>
  );
}
