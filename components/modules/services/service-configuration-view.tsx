"use client";

import { useState, useTransition } from "react";
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
import { updateReminderPolicyAction } from "@/components/modules/services/services.service";
import type { ReminderChannel, ServiceConfiguration } from "@/components/modules/services/schema";

const DEFAULT_OFFSETS = [1440, 120];

function offsetLabel(minutes: number): string {
  switch (minutes) {
    case 1440:
      return "La veille (J-1)";
    case 120:
      return "Deux heures avant (H-2)";
    default:
      return `${minutes} minutes avant`;
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
  const [channel, setChannel] = useState<ReminderChannel>(initial.reminderChannel);
  const [offsets, setOffsets] = useState<number[]>(initial.reminderOffsetsMinutes);
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
      toast.success("Rappels enregistrés.");
    });
  }

  function changeOffset(index: number, raw: string) {
    const value = Number.parseInt(raw, 10);
    if (Number.isNaN(value) || value <= 0) {
      return;
    }
    setOffsets((current) => current.map((offset, i) => (i === index ? value : offset)));
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Rappels de rendez-vous</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Envoyez à vos clients un rappel avant leur rendez-vous pour réduire les absences.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>Activer les rappels</Label>
          <div className="max-w-xs">
            <Select value={channel} onValueChange={(value: ReminderChannel) => setChannel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                <SelectItem value="NONE">Désactivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {remindersActive && (
          <div className="flex flex-col gap-3">
            <Label>Décalages d&apos;envoi</Label>
            <p className="text-sm text-muted-foreground">
              Un rappel est envoyé à chaque moment choisi avant le début du rendez-vous.
            </p>
            {offsets.map((offset, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-48 text-sm">{offsetLabel(offset)}</div>
                <div className="w-36">
                  <Input
                    type="number"
                    min={1}
                    value={offset}
                    aria-label="Minutes avant le rendez-vous"
                    onChange={(event) => changeOffset(index, event.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOffsets((current) => current.filter((_, i) => i !== index))}
                >
                  Retirer
                </Button>
              </div>
            ))}
            <div className="mt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOffsets((current) => [...current, DEFAULT_OFFSETS[1]])}
              >
                Ajouter un décalage
              </Button>
            </div>
          </div>
        )}

        <div className="mt-2">
          <Button onClick={save} disabled={isSaving || (remindersActive && offsets.length === 0)}>
            {isSaving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
