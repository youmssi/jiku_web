"use client";

import { useTransition } from "react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { MessageCircle, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { markFollowUpDoneAction } from "@/components/modules/admin/admin.service";
import type { FollowUpEntry, FollowUpOverview } from "@/components/modules/admin/schema";

/** Who to call this week and how far new organizations get (JIKU-202). */
export function FollowUps({ overview }: { overview: FollowUpOverview }) {
  const t = useTranslations("admin.followUps");
  const { funnel, entries } = overview;
  const steps = [
    { key: "signedUp", value: funnel.signedUp },
    { key: "firstEventOrService", value: funnel.firstEventOrService },
    { key: "firstSend", value: funnel.firstSend },
    { key: "firstPayment", value: funnel.firstPayment },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted-foreground">{t("intro")}</p>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">{t("funnel.title", { days: funnel.windowDays })}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {steps.map((step) => (
            <Card key={step.key} className="py-4">
              <CardContent className="flex flex-col gap-1 px-4">
                <span className="text-2xl font-semibold tabular-nums">{step.value}</span>
                <span className="text-xs text-muted-foreground">{t(`funnel.${step.key}`)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      {entries.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PhoneCall />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.organization")}</TableHead>
              <TableHead>{t("columns.contact")}</TableHead>
              <TableHead>{t("columns.reason")}</TableHead>
              <TableHead>{t("columns.since")}</TableHead>
              <TableHead>{t("columns.consent")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <FollowUpRow key={`${entry.tenantId}-${entry.reason}`} entry={entry} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function FollowUpRow({ entry }: { entry: FollowUpEntry }) {
  const t = useTranslations("admin.followUps");
  const format = useFormatter();
  const now = useNow();
  const router = useRouter();
  const [pending, start] = useTransition();
  const whatsapp = entry.phone ? `https://wa.me/${entry.phone.replace(/\D/g, "")}` : null;

  function markDone() {
    start(async () => {
      const result = await markFollowUpDoneAction(entry.tenantId, entry.reason);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("marked", { name: entry.organizationName }));
      router.refresh();
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{entry.organizationName}</TableCell>
      <TableCell>
        <div className="flex flex-col text-sm">
          {entry.ownerName ? <span>{entry.ownerName}</span> : null}
          {entry.ownerEmail ? (
            <a href={`mailto:${entry.ownerEmail}`} className="text-muted-foreground underline-offset-4 hover:underline">
              {entry.ownerEmail}
            </a>
          ) : null}
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:underline"
            >
              <MessageCircle className="size-3.5" aria-hidden />
              {t("whatsapp")}
            </a>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{t(`reasons.${entry.reason}`)}</Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {format.relativeTime(new Date(entry.since), now)}
      </TableCell>
      <TableCell className="text-sm">{entry.marketingConsent ? t("consentYes") : t("consentNo")}</TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="outline" disabled={pending} onClick={markDone}>
          {t("done")}
        </Button>
      </TableCell>
    </TableRow>
  );
}
