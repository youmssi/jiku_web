import { publicFetch, serverFetch } from "@/lib/api-server";
import { DayLineConsole } from "@/components/modules/dayline/day-line-console";
import type { DayLineView } from "@/components/modules/dayline/schema";

/**
 * Entrées serveur de la console de ligne du jour. La première ligne du jour est
 * rendue par le serveur (pas de flash vide), puis la console la rafraîchit toutes
 * les 10 s. L'organisateur est authentifié par sa session ; le personnel par le
 * lien signé porté dans le chemin.
 */
export async function DayLineOrganizerView({ serviceId }: { serviceId: string }) {
  const response = await serverFetch(`/services/${serviceId}/day-line`);
  if (!response.ok) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <h2 className="text-xl font-semibold">Ligne du jour indisponible</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {response.status === 404
            ? "Ce service est introuvable ou ne vous appartient pas."
            : "Impossible de charger la ligne du jour. Réessayez dans un instant."}
        </p>
      </div>
    );
  }
  const view = (await response.json()) as DayLineView;
  return <DayLineConsole auth={{ kind: "organizer", serviceId }} initial={view} />;
}

export async function DayLineStaffView({ token }: { token: string }) {
  const response = await publicFetch(`/line/${token}`);
  if (!response.ok) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h2 className="text-xl font-semibold text-zinc-100">Lien de comptoir indisponible</h2>
          <p className="mt-2 text-zinc-400">
            {response.status === 404
              ? "Ce lien a été révoqué ou n'est plus valide. Demandez-en un nouveau à l'organisateur."
              : "Impossible de charger la ligne du jour. Réessayez dans un instant."}
          </p>
        </div>
      </div>
    );
  }
  const view = (await response.json()) as DayLineView;
  return <DayLineConsole auth={{ kind: "staff", token }} initial={view} />;
}
