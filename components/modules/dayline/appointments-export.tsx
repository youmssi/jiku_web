"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const MAX_DAYS = 92;
const DAY_MS = 86_400_000;

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Downloads a service's appointments over a period as CSV, with the clients'
 * answers (JIKU-191). `"use client"`: the period is picked in the page and the
 * link follows it; the file itself streams from the server.
 */
export function AppointmentsExport({ serviceId }: { serviceId: string }) {
  const t = useTranslations("operator.line.export");
  const today = new Date();
  const [from, setFrom] = useState(isoDay(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(isoDay(today));
  const span = (Date.parse(to) - Date.parse(from)) / DAY_MS;
  const valid = Number.isFinite(span) && span >= 0 && span <= MAX_DAYS;
  const href = `/api/services/${encodeURIComponent(serviceId)}/appointments/export?from=${from}&to=${to}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Field className="w-auto">
            <FieldLabel htmlFor="export-from">{t("from")}</FieldLabel>
            <Input id="export-from" type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} />
          </Field>
          <Field className="w-auto">
            <FieldLabel htmlFor="export-to">{t("to")}</FieldLabel>
            <Input id="export-to" type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} />
          </Field>
          {valid ? (
            <Button asChild variant="outline">
              <a href={href} download>
                <Download className="size-4" aria-hidden />
                {t("action")}
              </a>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              <Download className="size-4" aria-hidden />
              {t("action")}
            </Button>
          )}
        </div>
        {!valid ? <FieldError>{t("tooLong")}</FieldError> : null}
      </CardContent>
    </Card>
  );
}
