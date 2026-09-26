"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, MoreHorizontal, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { askRating } from "@/components/modules/feedback";
import { trackEvent } from "@/lib/analytics";
import { publishEventAction } from "./event.service";
import { EventLifecycleDialog, type EventLifecycleAction } from "./event-lifecycle-dialog";
import { publishCheckHref } from "./publish-checks";
import type { PublishChecklist } from "./event.queries";

/**
 * The event header's actions. A draft gets a Publish button that opens the
 * checklist: every missing requirement links to the tab that fixes it, and the
 * event goes live from the same dialog once nothing required is missing. A
 * published event can be cancelled; a draft or a cancelled one deleted.
 */
export function EventActions({
  eventId,
  status,
  checklist,
}: {
  eventId: string;
  status: string;
  checklist: PublishChecklist | null;
}) {
  const t = useTranslations("events");
  const [action, setAction] = useState<EventLifecycleAction | null>(null);

  return (
    <div className="flex items-center gap-2">
      {status === "DRAFT" && checklist ? <PublishDialog eventId={eventId} checklist={checklist} /> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label={t("actions.more")}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
      <EventLifecycleDialog eventId={eventId} action={action} onOpenChange={(open) => !open && setAction(null)} />
    </div>
  );
}

function PublishDialog({ eventId, checklist }: { eventId: string; checklist: PublishChecklist }) {
  const t = useTranslations("events");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function publish() {
    startTransition(async () => {
      const result = await publishEventAction(eventId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      trackEvent("event_published");
      askRating("event_published");
      toast.success(t("lifecycle.publish.done"));
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Rocket data-icon="inline-start" />
          {t("actions.publish")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("publish.title")}</DialogTitle>
          <DialogDescription>
            {checklist.ready ? t("publish.ready") : t("publish.notReady")}
          </DialogDescription>
        </DialogHeader>
        <ItemGroup className="gap-2">
          {checklist.checks.map((check) => (
            <Item key={check.key} variant="outline" size="sm">
              <ItemMedia>
                {check.done ? (
                  <CheckCircle2 className="size-5 text-primary" aria-label={t("publish.done")} />
                ) : (
                  <Circle className="size-5 text-muted-foreground" aria-label={t("publish.todo")} />
                )}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {t(`publish.checks.${check.key}.title`)}
                  {check.required ? null : <Badge variant="outline">{t("publish.recommended")}</Badge>}
                </ItemTitle>
                <ItemDescription>{t(`publish.checks.${check.key}.description`)}</ItemDescription>
              </ItemContent>
              {check.done ? null : (
                <ItemActions>
                  <Button asChild size="sm" variant="outline" onClick={() => setOpen(false)}>
                    <Link href={publishCheckHref(check.key, eventId)}>{t("publish.fix")}</Link>
                  </Button>
                </ItemActions>
              )}
            </Item>
          ))}
        </ItemGroup>
        <p className="text-sm text-muted-foreground">{t("publish.consequence")}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("publish.later")}
          </Button>
          <Button onClick={publish} disabled={!checklist.ready || pending}>
            {pending ? t("lifecycle.working") : t("lifecycle.publish.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
