"use client";

import { useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Mail, MessageSquareHeart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePathname, useRouter } from "@/i18n/navigation";
import { updateFeedbackStatusAction } from "./admin.service";
import { FEEDBACK_STATUSES, type FeedbackEntry, type FeedbackPage, type RatingSummary } from "./schema";

const KINDS = ["ALL", "COMPLAINT", "PROBLEM", "QUESTION", "IDEA"] as const;

const KIND_TONE: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
  COMPLAINT: "destructive",
  PROBLEM: "default",
  QUESTION: "secondary",
  IDEA: "outline",
};

/**
 * The desk's feedback inbox (JIKU-133): ratings per moment on top, then the
 * messages to triage, complaints first when filtered. Filters live in the URL
 * so a link to "new complaints" can be shared.
 */
export function FeedbackInbox({
  page,
  ratings,
  kind,
  status,
}: {
  page: FeedbackPage;
  ratings: RatingSummary[];
  kind?: string;
  status?: string;
}) {
  const t = useTranslations("admin.feedbackInbox");
  const common = useTranslations("admin.common");
  const router = useRouter();
  const pathname = usePathname();

  function filter(next: { kind?: string; status?: string }) {
    const params = new URLSearchParams();
    const nextKind = next.kind ?? kind;
    const nextStatus = next.status ?? status;
    if (nextKind && nextKind !== "ALL") params.set("kind", nextKind);
    if (nextStatus && nextStatus !== "ALL") params.set("status", nextStatus);
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`);
  }

  const messages = page.items.filter((item) => item.kind !== "RATING");

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ratings.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noRatings")}</p>
        ) : (
          ratings.map((rating) => (
            <Card key={rating.moment} size="sm">
              <CardHeader>
                <CardDescription>
                  {t.has(`moments.${rating.moment}` as never)
                    ? t(`moments.${rating.moment}` as never)
                    : rating.moment.replaceAll("_", " ")}
                </CardDescription>
                <CardTitle className="text-2xl">
                  {rating.average === null ? "—" : rating.average.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground"> / 5</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {t("ratings", { responses: rating.responses, dismissed: rating.dismissed })}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          type="single"
          variant="outline"
          value={kind ?? "ALL"}
          onValueChange={(value) => value && filter({ kind: value })}
        >
          {KINDS.map((value) => (
            <ToggleGroupItem key={value} value={value} className="px-3 text-xs">
              {value === "ALL" ? t("all") : t(`kinds.${value}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <NativeSelect
          aria-label={common("status")}
          value={status ?? "ALL"}
          onChange={(event) => filter({ status: event.target.value })}
        >
          <NativeSelectOption value="ALL">{t("everyStatus")}</NativeSelectOption>
          {FEEDBACK_STATUSES.map((value) => (
            <NativeSelectOption key={value} value={value}>
              {t(`statuses.${value}`)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <span className="text-sm text-muted-foreground">{t("total", { count: page.total })}</span>
      </div>

      {messages.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareHeart />
            </EmptyMedia>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((entry) => (
            <FeedbackCard key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FeedbackCard({ entry }: { entry: FeedbackEntry }) {
  const t = useTranslations("admin.feedbackInbox");
  const common = useTranslations("admin.common");
  const format = useFormatter();
  const router = useRouter();
  const [status, setStatus] = useState(entry.status);
  const [note, setNote] = useState(entry.adminNote ?? "");
  const [pending, start] = useTransition();
  const changed = status !== entry.status || note !== (entry.adminNote ?? "");

  function save() {
    start(async () => {
      const result = await updateFeedbackStatusAction(entry.id, status, note);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(common("saved"));
      router.refresh();
    });
  }

  return (
    <li className="rounded-2xl border p-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant={KIND_TONE[entry.kind] ?? "outline"}>{t.has(`kinds.${entry.kind}` as never) ? t(`kinds.${entry.kind}` as never) : entry.kind}</Badge>
        <span className="font-medium">{entry.organizationName ?? "—"}</span>
        <span className="text-muted-foreground">· {format.dateTime(new Date(entry.createdAt), { dateStyle: "medium", timeStyle: "short" })}</span>
        {entry.page ? <span className="text-muted-foreground">· {entry.page}</span> : null}
      </div>
      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{entry.message}</p>
      {entry.contactEmail ? (
        <a href={`mailto:${entry.contactEmail}`} className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Mail className="size-3.5" />
          {entry.contactEmail}
        </a>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-start">
        <NativeSelect aria-label={common("status")} value={status} onChange={(event) => setStatus(event.target.value)}>
          {FEEDBACK_STATUSES.map((value) => (
            <NativeSelectOption key={value} value={value}>
              {t(`statuses.${value}`)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={1}
          maxLength={2000}
          placeholder={t("note")}
          aria-label={t("note")}
        />
        <Button size="sm" disabled={!changed || pending} onClick={save}>
          {common("save")}
        </Button>
      </div>
    </li>
  );
}
