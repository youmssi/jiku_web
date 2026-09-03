"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteTicketTypeAction, saveTicketTypeAction } from "./event.service";
import { TICKET_TYPE_COLORS, type TicketTypeResponse } from "./schema";

type Draft = {
  label: string;
  colorHex: string;
  maxCapacity: string;
};

const EMPTY: Draft = { label: "", colorHex: TICKET_TYPE_COLORS[0], maxCapacity: "" };

/**
 * Catégories d'accès d'un événement (JIKU-93).
 *
 * Un événement n'en a pas besoin par défaut — le bloc s'ouvre donc vide, en
 * disant à quoi il sert. Dès qu'une catégorie existe, chaque invité peut y être
 * rattaché, son billet la porte, et le portier la voit au scan.
 *
 * Le plafond est facultatif et distinct de la capacité de l'événement : les deux
 * s'appliquent ensemble, la plus contraignante gagne.
 */
export function TicketTypesSettings({
  eventId,
  initial,
}: {
  eventId: string;
  initial: TicketTypeResponse[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setDraft(EMPTY);
    setEditing(null);
  }

  function save() {
    startTransition(async () => {
      const result = await saveTicketTypeAction(eventId, editing, {
        label: draft.label.trim(),
        colorHex: draft.colorHex,
        maxCapacity: draft.maxCapacity ? Number(draft.maxCapacity) : null,
        position: editing
          ? (initial.find((t) => t.id === editing)?.position ?? 0)
          : initial.length,
      });
      if (result.ok) {
        toast.success(editing ? "Catégorie mise à jour." : "Catégorie ajoutée.");
        reset();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function remove(typeId: string) {
    startTransition(async () => {
      const result = await deleteTicketTypeAction(eventId, typeId);
      if (result.ok) {
        toast.success("Catégorie supprimée.");
        if (editing === typeId) reset();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function edit(type: TicketTypeResponse) {
    setEditing(type.id);
    setDraft({
      label: type.label,
      colorHex: type.colorHex,
      maxCapacity: type.maxCapacity?.toString() ?? "",
    });
  }

  const invalide = draft.label.trim().length === 0;

  return (
    <section className="mt-10 rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Catégories d&apos;accès</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Séparez vos invités en catégories — VIP, presse, standard — avec leur propre
        plafond. Le billet porte sa catégorie et le portier la voit au scan. Laissez
        vide si tous vos invités entrent de la même façon.
      </p>

      {initial.length > 0 ? (
        <ul className="mt-6 space-y-2">
          {initial.map((type) => {
            const complet = type.maxCapacity !== null && type.confirmedCount >= type.maxCapacity;
            return (
              <li
                key={type.id}
                className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
              >
                <span
                  aria-hidden
                  className="size-4 shrink-0 rounded-full"
                  style={{ backgroundColor: type.colorHex }}
                />
                <span className="font-medium">{type.label}</span>
                <span className="text-muted-foreground">
                  {type.maxCapacity === null
                    ? `${type.confirmedCount} confirmé${type.confirmedCount > 1 ? "s" : ""} · sans plafond`
                    : `${type.confirmedCount} / ${type.maxCapacity} confirmés`}
                </span>
                {complet ? (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    Complète
                  </span>
                ) : null}
                <span className="ml-auto flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => edit(type)}
                    disabled={isPending}
                  >
                    Modifier
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(type.id)}
                    disabled={isPending}
                  >
                    Supprimer
                  </Button>
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div className="space-y-2">
          <Label htmlFor="typeLabel">Nom de la catégorie</Label>
          <Input
            id="typeLabel"
            value={draft.label}
            onChange={(event) => setDraft({ ...draft, label: event.target.value })}
            placeholder="VIP"
            maxLength={120}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="typeCapacity">Plafond</Label>
          <Input
            id="typeCapacity"
            type="number"
            min={0}
            value={draft.maxCapacity}
            onChange={(event) => setDraft({ ...draft, maxCapacity: event.target.value })}
            placeholder="Illimité"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label>Couleur</Label>
        <div className="flex flex-wrap gap-2">
          {TICKET_TYPE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Couleur ${color}`}
              aria-pressed={draft.colorHex === color}
              onClick={() => setDraft({ ...draft, colorHex: color })}
              className={`size-8 rounded-full border-2 transition ${
                draft.colorHex === color ? "border-foreground" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={save} disabled={isPending || invalide}>
          {isPending
            ? "Enregistrement…"
            : editing
              ? "Enregistrer la catégorie"
              : "Ajouter la catégorie"}
        </Button>
        {editing ? (
          <Button type="button" variant="ghost" onClick={reset} disabled={isPending}>
            Annuler
          </Button>
        ) : null}
      </div>
    </section>
  );
}
