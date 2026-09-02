"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveQuorumAction } from "./event.service";
import type { QuorumResponse } from "./schema";

const FRACTIONS = [
  { label: "La moitié (1/2)", numerator: 1, denominator: 2 },
  { label: "Les deux tiers (2/3)", numerator: 2, denominator: 3 },
  { label: "Les trois quarts (3/4)", numerator: 3, denominator: 4 },
] as const;

type Mode = "NONE" | "FRACTION" | "ABSOLUTE";

/**
 * Saisie de la règle de quorum d'un événement (JIKU-94).
 *
 * Bloc distinct de l'assistant de création : un quorum est une **règle
 * statutaire**, saisie une fois d'après les statuts de l'organisation, pas un
 * réglage qu'on ajuste en modifiant le lieu ou l'horaire.
 *
 * La quasi-totalité des événements n'en ont pas — le bloc s'ouvre donc sur
 * « aucun quorum » et dit à qui il s'adresse, plutôt que de se présenter comme
 * une étape à remplir.
 */
export function QuorumSettings({ eventId, initial }: { eventId: string; initial: QuorumResponse | null }) {
  const [mode, setMode] = useState<Mode>((initial?.mode as Mode) ?? "NONE");
  const [fraction, setFraction] = useState(() => {
    const match = FRACTIONS.findIndex(
      (f) => f.numerator === initial?.numerator && f.denominator === initial?.denominator,
    );
    return match >= 0 ? match : 0;
  });
  const [absolute, setAbsolute] = useState(initial?.absolute?.toString() ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const choix = FRACTIONS[fraction];
      const result = await saveQuorumAction(eventId, {
        mode,
        numerator: mode === "FRACTION" ? choix.numerator : null,
        denominator: mode === "FRACTION" ? choix.denominator : null,
        absolute: mode === "ABSOLUTE" ? Number(absolute) || null : null,
      });
      if (result.ok) {
        toast.success(mode === "NONE" ? "Quorum retiré." : "Quorum enregistré.");
      } else {
        toast.error(result.error);
      }
    });
  }

  const invalide = mode === "ABSOLUTE" && (!absolute || Number(absolute) < 1);

  return (
    <section className="mt-10 rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Quorum</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pour les assemblées générales et réunions statutaires. Jikū compte les présents
        en direct et horodate le moment où le quorum est atteint, ce qui rend la
        délibération incontestable. Laissez « aucun quorum » pour tout autre événement.
      </p>

      {initial?.reachedAt ? (
        <p className="mt-4 rounded-lg border border-green-600/30 bg-green-600/5 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Quorum déjà atteint pour cet événement. Modifier la règle maintenant ne change
          pas cette date : elle fait foi.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quorumMode">Règle</Label>
          <select
            id="quorumMode"
            value={mode}
            onChange={(event) => setMode(event.target.value as Mode)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="NONE">Aucun quorum</option>
            <option value="FRACTION">Une part des inscrits</option>
            <option value="ABSOLUTE">Un nombre de présents</option>
          </select>
        </div>

        {mode === "FRACTION" ? (
          <div className="space-y-2">
            <Label htmlFor="quorumFraction">Part requise</Label>
            <select
              id="quorumFraction"
              value={fraction}
              onChange={(event) => setFraction(Number(event.target.value))}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
            >
              {FRACTIONS.map((f, i) => (
                <option key={f.label} value={i}>
                  {f.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Le seuil s&apos;arrondit au supérieur : sur 181 membres, la moitié exige 91
              présents.
            </p>
          </div>
        ) : null}

        {mode === "ABSOLUTE" ? (
          <div className="space-y-2">
            <Label htmlFor="quorumAbsolute">Présents requis</Label>
            <Input
              id="quorumAbsolute"
              type="number"
              min={1}
              value={absolute}
              onChange={(event) => setAbsolute(event.target.value)}
              placeholder="25"
            />
          </div>
        ) : null}

        <Button onClick={save} disabled={isPending || invalide}>
          {isPending ? "Enregistrement…" : "Enregistrer le quorum"}
        </Button>
      </div>
    </section>
  );
}
