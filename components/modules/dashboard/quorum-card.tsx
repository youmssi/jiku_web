import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { QuorumView } from "./schema";

/**
 * Where a general assembly stands on its quorum (JIKU-94). Read at one precise
 * moment, just before a vote, by someone who must be able to say "we have it"
 * without interpreting numbers: the state reads from the badge first. When
 * departures drop the count again, the time it was first reached stays shown;
 * both facts are true and the first is the one the minutes rely on.
 */
export function QuorumCard({ quorum }: { quorum: QuorumView }) {
  const t = useTranslations("events.overview.quorum");
  const format = useFormatter();
  const percent = quorum.required > 0 ? Math.round((quorum.current / quorum.required) * 100) : 0;
  const missing = Math.max(0, quorum.required - quorum.current);

  return (
    <Card>
      <CardHeader>
        <CardDescription>{t("title")}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">
          {quorum.current}
          <span className="text-muted-foreground"> / {quorum.required}</span>
        </CardTitle>
        <CardAction>
          <Badge variant={quorum.reached ? "default" : "secondary"}>
            {quorum.reached ? t("reached") : t("notReached")}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Progress value={Math.min(100, percent)} aria-label={t("title")} />
        <p className="text-sm text-muted-foreground">
          {quorum.reached ? t("share", { percent }) : t("missing", { count: missing })}
        </p>
        {quorum.reachedAt ? (
          <p className="text-sm">
            {t("reachedAt", { date: format.dateTime(new Date(quorum.reachedAt), { dateStyle: "medium", timeStyle: "short" }) })}
            {quorum.reached ? null : <span className="text-muted-foreground"> {t("fellBack")}</span>}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
