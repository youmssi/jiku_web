import { formatLocalDateTime } from "@/lib/datetime";
import type { QuorumView } from "./schema";

/**
 * État du quorum d'une assemblée générale (JIKU-94).
 *
 * Une AG est nulle sans quorum, et le quorum se compte aujourd'hui à la main,
 * dans la contestation. Cette carte est donc lue à un moment précis — juste
 * avant un vote — par quelqu'un qui doit pouvoir dire « nous y sommes » sans
 * interpréter des chiffres.
 *
 * D'où deux partis pris :
 *  - l'état se lit **sans lire les nombres** : couleur et libellé d'abord ;
 *  - si des départs font retomber le compte, la date de première atteinte reste
 *    affichée. Les deux informations sont vraies et l'une ne remplace pas
 *    l'autre.
 */
export function QuorumCard({ quorum }: { quorum: QuorumView }) {
  const percent = quorum.required > 0 ? Math.round((quorum.current / quorum.required) * 100) : 0;
  const manquants = Math.max(0, quorum.required - quorum.current);

  return (
    <section
      className={`rounded-xl border p-6 ${
        quorum.reached
          ? "border-green-600/30 bg-green-600/5"
          : "border-amber-500/30 bg-amber-500/5"
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quorum
        </h2>
        <span
          className={`text-sm font-semibold ${
            quorum.reached
              ? "text-green-700 dark:text-green-400"
              : "text-amber-700 dark:text-amber-400"
          }`}
        >
          {quorum.reached ? "✓ Atteint" : "Non atteint"}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tabular-nums">
        {quorum.current}
        <span className="text-muted-foreground"> / {quorum.required}</span>
      </p>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            quorum.reached ? "bg-green-600" : "bg-amber-500"
          }`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {quorum.reached
          ? `${percent} % des présents requis`
          : `Il manque ${manquants} ${manquants > 1 ? "présents" : "présent"}`}
      </p>

      {quorum.reachedAt ? (
        <p className="mt-2 text-sm">
          <span className="text-muted-foreground">Atteint le </span>
          <span className="font-medium">{formatLocalDateTime(quorum.reachedAt)}</span>
          {!quorum.reached ? (
            // Le quorum a été atteint puis est retombé : les deux faits comptent,
            // et c'est le premier qui fera foi dans un procès-verbal.
            <span className="text-muted-foreground"> — des participants sont repartis depuis</span>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}
