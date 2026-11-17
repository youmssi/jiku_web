"use client";

import { useState, useTransition } from "react";
import { GiftIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { activateGiftAction } from "./billing.service";
import { useGiftText } from "./gift-text";
import type { Gift, GiftEventOption } from "./schema";

/**
 * The gifts the back office offered (JIKU-315), in billing: the ones to
 * activate first, with their deadline and the desk's note, then the ones used,
 * lapsed or withdrawn. [openGiftId] opens a gift's activation straight away,
 * as the welcome dialog's "Activate now" does.
 */
export function GiftsSection({
  gifts,
  events,
  canManage,
  openGiftId,
}: {
  gifts: Gift[];
  events: GiftEventOption[];
  canManage: boolean;
  openGiftId?: string;
}) {
  const t = useTranslations("billing.gifts");
  const format = useFormatter();
  const describe = useGiftText();
  const [activating, setActivating] = useState<Gift | null>(() =>
    canManage && openGiftId ? (gifts.find((gift) => gift.id === openGiftId && gift.status === "OFFERED") ?? null) : null,
  );

  if (gifts.length === 0) return null;
  const waiting = gifts.filter((gift) => gift.status === "OFFERED");
  const others = gifts.filter((gift) => gift.status !== "OFFERED");

  return (
    <section id="gifts" aria-labelledby="gifts-title" className="flex scroll-mt-20 flex-col gap-3">
      <div>
        <h2 id="gifts-title" className="text-lg font-semibold">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("intro")}</p>
      </div>
      {waiting.map((gift) => (
        <div key={gift.id} className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <GiftIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div className="flex flex-col gap-1">
              <p className="font-medium">{describe(gift)}</p>
              {gift.message ? <p className="text-sm italic">« {gift.message} »</p> : null}
              <p className="text-xs text-muted-foreground">
                {t("claimBy", { date: format.dateTime(new Date(gift.claimBy), { dateStyle: "long" }) })}
              </p>
            </div>
          </div>
          {canManage ? (
            <Button onClick={() => setActivating(gift)} className="sm:shrink-0">
              {t("activate")}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground sm:max-w-40">{t("askOwner")}</p>
          )}
        </div>
      ))}
      {others.length > 0 ? (
        <ul className="flex flex-col divide-y rounded-lg border">
          {others.map((gift) => (
            <li key={gift.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span>{describe(gift)}</span>
              <Badge variant={gift.status === "ACTIVATED" ? "default" : "secondary"}>
                {t(`status.${gift.status as "ACTIVATED" | "EXPIRED" | "REVOKED"}`)}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
      {activating ? <ActivateGiftDialog gift={activating} events={events} onClose={() => setActivating(null)} /> : null}
    </section>
  );
}

/** Confirms an activation, after saying exactly what it changes; asks for the event when the gift names none. */
function ActivateGiftDialog({ gift, events, onClose }: { gift: Gift; events: GiftEventOption[]; onClose: () => void }) {
  const t = useTranslations("billing.gifts");
  const describe = useGiftText();
  const router = useRouter();
  const [eventId, setEventId] = useState(gift.eventId ?? events[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const needsEvent = gift.kind === "EVENT_GUESTS" && !gift.eventId;
  const blocked = needsEvent && events.length === 0;

  function confirm() {
    startTransition(async () => {
      const result = await activateGiftAction(gift.id, needsEvent ? eventId : undefined);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("activated"));
      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("confirmTitle")}</DialogTitle>
          <DialogDescription>{t(`effect.${gift.kind as "EVENT_GUESTS" | "SERVICES_PLAN" | "ORGANIZER_PACK"}`, { gift: describe(gift) })}</DialogDescription>
        </DialogHeader>
        {needsEvent ? (
          blocked ? (
            <p className="text-sm text-muted-foreground">{t("noEvent")}</p>
          ) : (
            <Field>
              <FieldLabel htmlFor="gift-event">{t("chooseEvent")}</FieldLabel>
              <NativeSelect id="gift-event" value={eventId} onChange={(event) => setEventId(event.target.value)}>
                {events.map((option) => (
                  <NativeSelectOption key={option.id} value={option.id}>
                    {option.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          )
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("later")}
          </Button>
          <Button onClick={confirm} disabled={pending || blocked}>
            {pending ? t("activating") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
