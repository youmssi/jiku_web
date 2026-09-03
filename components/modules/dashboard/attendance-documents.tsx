import Link from "next/link";
import { attendanceRegisterRoute } from "@/lib/constants";

/**
 * Preuves de présence téléchargeables (JIKU-95).
 *
 * Quand un bailleur ou un employeur finance une session, le versement du solde
 * est conditionné à la preuve de présence. Le bloc n'apparaît qu'une fois
 * quelqu'un entré : proposer une feuille d'émargement vide avant l'événement
 * n'aiderait personne et laisserait croire à un document utilisable.
 */
export function AttendanceDocuments({ eventId, checkedIn }: { eventId: string; checkedIn: number }) {
  if (checkedIn === 0) {
    return null;
  }

  return (
    <section className="mt-10 rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Preuve de présence</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        La feuille d&apos;émargement liste les {checkedIn}{" "}
        {checkedIn > 1 ? "personnes entrées" : "personne entrée"}, avec l&apos;heure et le poste de
        contrôle. Les attestations nominatives se téléchargent depuis la liste des invités.
      </p>
      <Link
        href={attendanceRegisterRoute(eventId)}
        prefetch={false}
        className="mt-4 inline-flex text-sm font-medium text-primary underline underline-offset-4"
      >
        Télécharger la feuille d&apos;émargement (PDF)
      </Link>
    </section>
  );
}
