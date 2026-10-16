"use client";

import { useMemo, useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUnsavedChangesGuard } from "@/components/shared";
import { replaceWeekAction } from "./services.service";
import type { ResourceAvailability, WeeklyRange } from "./schema";

/** 1 January 2024 was a Monday: day `n` (ISO, 1 = Monday) falls on 2024-01-0n. */
const FIRST_MONDAY_UTC = Date.UTC(2024, 0, 1);
const DAYS = [1, 2, 3, 4, 5, 6, 7] as const;
const NEW_RANGE = { start: "09:00", end: "18:00" };

interface Range {
  start: string;
  end: string;
}

type Week = Record<number, Range[]>;

function toWeek(rows: ResourceAvailability[]): Week {
  const week: Week = Object.fromEntries(DAYS.map((day) => [day, [] as Range[]]));
  for (const row of [...rows].sort((a, b) => a.start.localeCompare(b.start))) {
    week[row.dayOfWeek]?.push({ start: row.start.slice(0, 5), end: row.end.slice(0, 5) });
  }
  return week;
}

function sameRanges(a: Range[], b: Range[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Consecutive days with the same hours, as [first day, last day, ranges] runs. */
function runs(week: Week): [number, number, Range[]][] {
  const result: [number, number, Range[]][] = [];
  for (const day of DAYS) {
    const last = result.at(-1);
    if (last && sameRanges(last[2], week[day])) last[1] = day;
    else result.push([day, day, week[day]]);
  }
  return result;
}

function toRows(week: Week): WeeklyRange[] {
  return DAYS.flatMap((day) => week[day].map((range) => ({ dayOfWeek: day, ...range })));
}

/**
 * A person's opening hours as one week (JIKU-252), read as one line
 * ("Mon–Sat 09:00–18:00 · Sun closed") and edited on demand: each day is open
 * or closed, with one or more ranges so a lunch break is kept. The week is
 * saved in one step, and leaving with unsaved hours asks first.
 */
export function WeeklyHours({ resourceId, initial }: { resourceId: string; initial: ResourceAvailability[] }) {
  const t = useTranslations("services.hours");
  const format = useFormatter();
  const [saved, setSaved] = useState<Week>(() => toWeek(initial));
  const [week, setWeek] = useState<Week>(saved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  // A week with no hours at all opens straight in the editor: there is nothing to summarize.
  const [editing, setEditing] = useState(() => initial.length === 0);
  const shortDays = useMemo(
    () =>
      DAYS.map((day) =>
        format.dateTime(new Date(FIRST_MONDAY_UTC + (day - 1) * 86_400_000), { weekday: "short", timeZone: "UTC" }),
      ),
    [format],
  );
  const dayLabels = useMemo(
    () =>
      DAYS.map((day) =>
        format.dateTime(new Date(FIRST_MONDAY_UTC + (day - 1) * 86_400_000), { weekday: "long", timeZone: "UTC" }),
      ),
    [format],
  );
  const dirty = JSON.stringify(week) !== JSON.stringify(saved);
  const invalid = DAYS.some((day) => week[day].some((range) => !range.start || !range.end || range.start >= range.end));
  useUnsavedChangesGuard(dirty, t("leaveUnsaved"));

  function setDay(day: number, ranges: Range[]) {
    setWeek((current) => ({ ...current, [day]: ranges }));
  }

  function copyToOpenDays() {
    const source = DAYS.map((day) => week[day]).find((ranges) => ranges.length > 0);
    if (!source) return;
    setWeek((current) =>
      Object.fromEntries(DAYS.map((day) => [day, current[day].length > 0 ? source.map((range) => ({ ...range })) : []])),
    );
  }

  function save() {
    startTransition(async () => {
      const result = await replaceWeekAction(resourceId, toRows(week));
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const next = toWeek(result.data);
      setSaved(next);
      setWeek(next);
      setEditing(false);
      toast.success(t("saved"));
      router.refresh();
    });
  }

  if (!editing) {
    const summary = runs(saved)
      .map(([first, last, ranges]) => {
        const days = first === last ? shortDays[first - 1] : `${shortDays[first - 1]}–${shortDays[last - 1]}`;
        const hours = ranges.length === 0 ? t("closed").toLowerCase() : ranges.map((r) => `${r.start}–${r.end}`).join(", ");
        return `${days} ${hours}`;
      })
      .join(" · ");
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm font-medium">{summary}</p>
        <Button type="button" variant="outline" onClick={() => setEditing(true)}>
          {t("change")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <ul className="flex flex-col divide-y">
        {DAYS.map((day, index) => {
          const ranges = week[day];
          const open = ranges.length > 0;
          const switchId = `${resourceId}-day-${day}`;
          return (
            <li key={day} className="flex flex-col gap-2 py-2 sm:flex-row sm:items-start">
              <label htmlFor={switchId} className="flex min-h-11 w-40 shrink-0 items-center gap-3 text-sm font-medium capitalize">
                <Switch id={switchId} checked={open} onCheckedChange={(checked) => setDay(day, checked ? [{ ...NEW_RANGE }] : [])} />
                {dayLabels[index]}
              </label>
              {open ? (
                <div className="flex flex-1 flex-col gap-2">
                  {ranges.map((range, rangeIndex) => (
                    <div key={rangeIndex} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={range.start}
                        aria-label={t("opens", { day: dayLabels[index] })}
                        aria-invalid={range.start >= range.end}
                        onChange={(event) =>
                          setDay(day, ranges.map((r, i) => (i === rangeIndex ? { ...r, start: event.target.value } : r)))
                        }
                        className="w-36"
                      />
                      <span aria-hidden>–</span>
                      <Input
                        type="time"
                        value={range.end}
                        aria-label={t("closes", { day: dayLabels[index] })}
                        aria-invalid={range.start >= range.end}
                        onChange={(event) =>
                          setDay(day, ranges.map((r, i) => (i === rangeIndex ? { ...r, end: event.target.value } : r)))
                        }
                        className="w-36"
                      />
                      {ranges.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("removeRange", { day: dayLabels[index] })}
                          onClick={() => setDay(day, ranges.filter((_, i) => i !== rangeIndex))}
                        >
                          <X aria-hidden />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="link"
                    className="self-start px-0 max-md:px-0"
                    onClick={() => setDay(day, [...ranges, { start: ranges.at(-1)?.end ?? NEW_RANGE.start, end: NEW_RANGE.end }])}
                  >
                    <Plus aria-hidden />
                    {t("addRange")}
                  </Button>
                </div>
              ) : (
                <p className="flex min-h-11 items-center text-sm text-muted-foreground">{t("closed")}</p>
              )}
            </li>
          );
        })}
      </ul>
      {invalid ? <p className="text-sm text-destructive">{t("invalid")}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <Button type="button" variant="outline" onClick={copyToOpenDays}>
          {t("copyToOpenDays")}
        </Button>
        <div className="flex gap-2">
          {initial.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setWeek(saved);
                setEditing(false);
              }}
            >
              {t("cancel")}
            </Button>
          ) : null}
          <Button type="button" onClick={save} disabled={!dirty || invalid || pending}>
            {pending ? t("saving") : t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
