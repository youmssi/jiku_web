"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateClientsPerSlotAction,
  updateReminderPolicyAction,
} from "@/components/modules/services/services.service";
import type {
  ReminderChannel,
  ServiceConfiguration,
} from "@/components/modules/services/schema";

const DEFAULT_OFFSETS = [1440, 120];

function offsetLabel(
  minutes: number,
  t: ReturnType<typeof useTranslations<"services.reminders">>,
): string {
  switch (minutes) {
    case 1440:
      return t("dayBefore");
    case 120:
      return t("twoHours");
    default:
      return t("minutesBefore", { minutes });
  }
}

/**
 * Rappels de rendez-vous (JIKU-89) : le canal et les décalages d'envoi d'un
 * service. La réservation ne capture que le téléphone, le canal proposé est donc
 * WhatsApp (désactivé par défaut). L'enregistrement est une mise à jour partielle.
 */
export function ServiceConfigurationPanel({
  serviceId,
  initial,
}: {
  serviceId: string;
  initial: ServiceConfiguration;
}) {
  const t = useTranslations("services.reminders");
  const [channel, setChannel] = useState<ReminderChannel>(
    initial.reminderChannel,
  );
  const [offsets, setOffsets] = useState<number[]>(
    initial.reminderOffsetsMinutes,
  );
  const [isSaving, startSave] = useTransition();

  const remindersActive = channel === "WHATSAPP";

  function save() {
    startSave(async () => {
      const result = await updateReminderPolicyAction(serviceId, {
        reminderChannel: channel,
        reminderOffsetsMinutes: offsets.length > 0 ? offsets : DEFAULT_OFFSETS,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOffsets(result.data.reminderOffsetsMinutes);
      toast.success(t("saved"));
    });
  }

  function changeOffset(index: number, raw: string) {
    const value = Number.parseInt(raw, 10);
    if (Number.isNaN(value) || value <= 0) {
      return;
    }
    setOffsets((current) =>
      current.map((offset, i) => (i === index ? value : offset)),
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10">
      <h1 className="text-2xl font-semibold">{t("settingsTitle")}</h1>
      <GroupSessionSettings serviceId={serviceId} initial={initial} />
      <section>
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>

        <div className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label>{t("enable")}</Label>
            <div className="max-w-xs">
              <Select
                value={channel}
                onValueChange={(value: ReminderChannel) => setChannel(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="NONE">{t("off")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {remindersActive && (
            <div className="flex flex-col gap-3">
              <Label>{t("offsets")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("offsetsText")}
              </p>
              {offsets.map((offset, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-48 text-sm">{offsetLabel(offset, t)}</div>
                  <div className="w-36">
                    <Input
                      type="number"
                      min={1}
                      value={offset}
                      aria-label={t("minutesLabel")}
                      onChange={(event) =>
                        changeOffset(index, event.target.value)
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOffsets((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                  >
                    {t("remove")}
                  </Button>
                </div>
              ))}
              <div className="mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setOffsets((current) => [...current, DEFAULT_OFFSETS[1]])
                  }
                >
                  {t("addOffset")}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-2">
            <Button
              onClick={save}
              disabled={isSaving || (remindersActive && offsets.length === 0)}
            >
              {isSaving ? t("saving") : t("save")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Group sessions (JIKU-174): how many clients one slot takes together, up to
 * the plan's cap. A plan that serves one client at a time says which plans
 * include group sessions instead of offering a field it would refuse.
 */
function GroupSessionSettings({
  serviceId,
  initial,
}: {
  serviceId: string;
  initial: ServiceConfiguration;
}) {
  const t = useTranslations("services.group");
  const [clients, setClients] = useState(String(initial.clientsPerSlot));
  const [saved, setSaved] = useState(initial.clientsPerSlot);
  const [isSaving, startSave] = useTransition();
  const max = initial.maxClientsPerSlot;
  const value = Number.parseInt(clients, 10);
  const valid = Number.isInteger(value) && value >= 1 && value <= max;

  function save() {
    startSave(async () => {
      const result = await updateClientsPerSlotAction(serviceId, value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSaved(result.data.clientsPerSlot);
      setClients(String(result.data.clientsPerSlot));
      toast.success(t("saved"));
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
      {max <= 1 ? (
        <p className="mt-4 rounded-lg border bg-muted/40 p-3 text-sm">
          {t("single")}
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="clients-per-slot">{t("label")}</Label>
            <Input
              id="clients-per-slot"
              type="number"
              min={1}
              max={max}
              className="w-32"
              value={clients}
              aria-invalid={!valid}
              onChange={(event) => setClients(event.target.value)}
            />
          </div>
          <Button
            onClick={save}
            disabled={isSaving || !valid || value === saved}
          >
            {isSaving ? t("saving") : t("save")}
          </Button>
          <p className="basis-full text-xs text-muted-foreground">
            {t("limit", { max })}
          </p>
        </div>
      )}
    </section>
  );
}
