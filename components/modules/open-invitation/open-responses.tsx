"use client";

import { useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { MessageCircle, Globe, UserX } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { removeOpenResponseAction } from "./open-invitation.service";
import { OPEN_ANSWERS, type OpenAnswer, type OrganizerOpenResponse } from "./schema";

type Filter = OpenAnswer | "ALL";

/** The people who answered an open invitation (JIKU-184), by answer; the organizer can remove one. */
export function OpenResponses({ eventId, responses }: { eventId: string; responses: OrganizerOpenResponse[] }) {
  const t = useTranslations("events.openInvitation.responses");
  const format = useFormatter();
  const [filter, setFilter] = useState<Filter>("YES");
  const [removing, setRemoving] = useState<OrganizerOpenResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const shown = filter === "ALL" ? responses : responses.filter((response) => response.answer === filter);

  function remove() {
    const response = removing;
    if (!response) return;
    startTransition(async () => {
      const result = await removeOpenResponseAction(eventId, response.id);
      if (!result.ok) toast.error(result.error);
      else toast.success(t("removed", { name: response.name }));
      setRemoving(null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{t("title")}</p>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={filter}
          onValueChange={(value) => value && setFilter(value as Filter)}
          aria-label={t("filterLabel")}
        >
          {[...OPEN_ANSWERS, "ALL" as const].map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {t(`filters.${option}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {shown.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("emptyText")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col divide-y rounded-xl border">
          {shown.map((response) => (
            <li key={response.id} className="flex items-center gap-3 p-3">
              {response.channel === "WHATSAPP" ? (
                <MessageCircle aria-label={t("viaWhatsApp")} className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <Globe aria-label={t("viaWeb")} className="size-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {response.name}
                  {response.answer === "YES" && response.companions > 0 ? (
                    <span className="text-muted-foreground"> {t("plus", { count: response.companions })}</span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {response.phone} · {format.relativeTime(new Date(response.updatedAt))}
                </p>
              </div>
              <Badge variant={response.answer === "YES" ? "default" : "secondary"}>{t(`answers.${response.answer}`)}</Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("remove", { name: response.name })}
                onClick={() => setRemoving(response)}
              >
                <UserX aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={removing !== null} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeTitle", { name: removing?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t("removeText")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={remove} disabled={isPending}>
              {t("confirmRemove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
