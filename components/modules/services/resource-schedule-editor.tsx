"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addAvailabilityAction,
  addUnavailabilityAction,
  listAvailabilityAction,
  listUnavailabilityAction,
  removeAvailabilityAction,
  removeUnavailabilityAction,
} from "@/components/modules/services/services.service";
import type {
  ResourceAvailability,
  ResourceUnavailability,
  ServiceResource,
} from "@/components/modules/services/schema";

const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/**
 * Éditeur d'horaires d'une ressource (JIKU-84) : les disponibilités hebdomadaires
 * (jour + plage horaire locale au fuseau de la ressource) définissent quand elle
 * est proposée ; les indisponibilités (congés, maintenance, maladie) priment sur
 * ces horaires. Seuls les créneaux où tout est disponible sont réservables.
 */
export function ResourceScheduleEditor({ resource }: { resource: ServiceResource }) {
  const [availability, setAvailability] = useState<ResourceAvailability[]>([]);
  const [unavailability, setUnavailability] = useState<ResourceUnavailability[]>([]);
  const [day, setDay] = useState("1");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [unavFrom, setUnavFrom] = useState("");
  const [unavTo, setUnavTo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([listAvailabilityAction(resource.id), listUnavailabilityAction(resource.id)]).then(
      ([availabilityResult, unavailabilityResult]) => {
        if (!active) return;
        if (availabilityResult.ok) setAvailability(availabilityResult.data);
        else toast.error(availabilityResult.error);
        if (unavailabilityResult.ok) setUnavailability(unavailabilityResult.data);
        else toast.error(unavailabilityResult.error);
      },
    );
    return () => {
      active = false;
    };
  }, [resource.id]);

  async function addAvailability() {
    const dayOfWeek = Number.parseInt(day, 10);
    if (dayOfWeek < 1 || dayOfWeek > 7 || !start || !end) return;
    setSaving(true);
    const result = await addAvailabilityAction(resource.id, dayOfWeek, start, end);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setAvailability((current) => [...current.filter((a) => a.id !== result.data.id), result.data]);
    toast.success("Horaire ajouté.");
  }

  async function removeAvailability(id: string) {
    setSaving(true);
    const result = await removeAvailabilityAction(resource.id, id);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setAvailability((current) => current.filter((a) => a.id !== id));
  }

  async function addUnavailability() {
    if (!unavFrom || !unavTo) return;
    const fromIso = new Date(unavFrom).toISOString();
    const toIso = new Date(unavTo).toISOString();
    setSaving(true);
    const result = await addUnavailabilityAction(resource.id, fromIso, toIso);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setUnavailability((current) => [...current.filter((u) => u.id !== result.data.id), result.data]);
    setUnavFrom("");
    setUnavTo("");
    toast.success("Fermeture enregistrée.");
  }

  async function removeUnavailability(id: string) {
    setSaving(true);
    const result = await removeUnavailabilityAction(resource.id, id);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setUnavailability((current) => current.filter((u) => u.id !== id));
  }

  return (
    <div className="mt-3 rounded-lg border bg-muted/20 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Horaires hebdomadaires
      </p>
      {availability.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucun horaire — la ressource n&apos;est jamais proposée.</p>
      ) : (
        <ul className="space-y-1 text-xs">
          {availability.map((slot) => (
            <li key={slot.id} className="flex items-center justify-between gap-3">
              <span>
                {DAY_LABELS[slot.dayOfWeek - 1] ?? slot.dayOfWeek} · {slot.start.slice(0, 5)}–
                {slot.end.slice(0, 5)}
              </span>
              <Button size="sm" variant="ghost" disabled={saving} onClick={() => removeAvailability(slot.id)}>
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAY_LABELS.map((label, index) => (
              <SelectItem key={index + 1} value={String(index + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Field>
          <FieldLabel htmlFor={`${resource.id}-start`}>Début</FieldLabel>
          <Input id={`${resource.id}-start`} type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${resource.id}-end`}>Fin</FieldLabel>
          <Input id={`${resource.id}-end`} type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
        <Button size="sm" disabled={saving} onClick={addAvailability}>
          Ajouter
        </Button>
      </div>

      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Fermetures (congés, maintenance)
      </p>
      {unavailability.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucune fermeture.</p>
      ) : (
        <ul className="space-y-1 text-xs">
          {unavailability.map((slot) => (
            <li key={slot.id} className="flex items-center justify-between gap-3">
              <span>
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(
                  new Date(slot.startsAt),
                )}{" "}
                –{" "}
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(
                  new Date(slot.endsAt),
                )}
                {slot.reason ? ` (${slot.reason})` : ""}
              </span>
              <Button size="sm" variant="ghost" disabled={saving} onClick={() => removeUnavailability(slot.id)}>
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <Field>
          <FieldLabel htmlFor={`${resource.id}-unav-from`}>Du</FieldLabel>
          <Input
            id={`${resource.id}-unav-from`}
            type="datetime-local"
            value={unavFrom}
            onChange={(e) => setUnavFrom(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${resource.id}-unav-to`}>Au</FieldLabel>
          <Input
            id={`${resource.id}-unav-to`}
            type="datetime-local"
            value={unavTo}
            onChange={(e) => setUnavTo(e.target.value)}
          />
        </Field>
        <Button size="sm" disabled={saving || !unavFrom || !unavTo} onClick={addUnavailability}>
          Ajouter
        </Button>
      </div>
    </div>
  );
}
