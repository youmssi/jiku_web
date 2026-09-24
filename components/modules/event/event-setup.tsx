import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { loadEvent, loadPublishChecklist } from "./event.queries";
import { publishCheckHref } from "./publish-checks";

/**
 * A draft's overview: the steps between "created" and "live", in the order an
 * organizer naturally takes them, each one link away. Publishing itself stays
 * in the header, where the same checklist gates it.
 */
export async function EventSetup({ eventId }: { eventId: string }) {
  const load = await loadEvent(eventId);
  if (load.kind !== "ok") return null;
  const [checklist, t] = await Promise.all([loadPublishChecklist(load.event), getTranslations("events")]);
  const done = checklist.checks.filter((check) => check.done).length;
  const total = checklist.checks.length;

  return (
    <section aria-labelledby="setup-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 id="setup-title" className="text-lg font-medium">{t("setup.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {checklist.ready ? t("setup.ready") : t("setup.description")}
        </p>
        <div className="flex items-center gap-3">
          <Progress value={(done / total) * 100} className="max-w-xs" aria-label={t("setup.progress", { done, total })} />
          <span className="text-sm text-muted-foreground">{t("setup.progress", { done, total })}</span>
        </div>
      </div>
      <ItemGroup className="gap-2">
        {checklist.checks.map((check, index) => (
          <Item key={check.key} variant="outline">
            <ItemMedia variant="icon">
              {check.done ? (
                <CheckCircle2 className="text-primary" aria-label={t("publish.done")} />
              ) : (
                <span className="text-sm font-medium" aria-label={t("publish.todo")}>{index + 1}</span>
              )}
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {t(`publish.checks.${check.key}.title`)}
                {check.required ? null : <Badge variant="outline">{t("publish.recommended")}</Badge>}
              </ItemTitle>
              <ItemDescription>{t(`publish.checks.${check.key}.description`)}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button asChild size="sm" variant={check.done ? "ghost" : "outline"}>
                <Link href={publishCheckHref(check.key, eventId)}>
                  {check.done ? t("setup.review") : t(`publish.checks.${check.key}.cta`)}
                </Link>
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </section>
  );
}
