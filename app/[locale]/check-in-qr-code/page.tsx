import type { Metadata } from "next";
import { ThematicPage, type ThematicPageContent, buildThematicMetadata, siteUrl } from "@/components/modules/seo";
import { SEO_ROUTES } from "@/lib/constants";

const TITLE = "Check-in par QR code pour événements — fonctionne hors-ligne | Jikū";
const DESCRIPTION =
  "Contrôlez l'entrée de votre événement avec des billets QR signés, scannés depuis un téléphone, même sans connexion internet. Un billet ne peut jamais être validé deux fois.";

export const metadata: Metadata = buildThematicMetadata({
  path: SEO_ROUTES.CHECKIN_QR,
  title: TITLE,
  description: DESCRIPTION,
});

const content: ThematicPageContent = {
  eyebrow: "Check-in QR code",
  title: "Check-in par QR code : contrôle d'accès fiable, même sans connexion internet",
  intro:
    "À l'entrée d'un mariage, d'un séminaire ou d'une soirée, le contrôle d'accès doit être rapide et fiable, même quand la salle n'a pas de bon réseau internet — un problème fréquent dans beaucoup de lieux de réception. Le check-in Jikū fonctionne depuis le navigateur d'un simple téléphone : pas d'application à installer, pas de matériel spécial. Avant l'événement, la liste complète des invités et de leurs billets se synchronise sur l'appareil du contrôleur. Le jour J, chaque billet porte un QR code unique et signé numériquement, impossible à falsifier ou à dupliquer à partir d'une capture d'écran. Le contrôleur scanne le billet, même sans connexion internet à ce moment précis : le scan est enregistré localement puis synchronisé automatiquement dès que le réseau revient. Un billet déjà validé ne peut jamais être accepté une seconde fois, même à une autre entrée scannée par un contrôleur différent — le système compare les scans en temps réel dès que la synchronisation a lieu. Vous pouvez aussi rechercher un invité par nom directement depuis l'appareil du contrôleur si le QR code n'est pas disponible.",
  bullets: [
    {
      title: "Fonctionne sans connexion internet",
      description: "La liste des billets se synchronise à l'avance ; le scan hors-ligne se synchronise au retour du réseau.",
    },
    {
      title: "Aucune application à installer",
      description: "Le contrôleur scanne depuis le navigateur de son téléphone, sans rien télécharger.",
    },
    {
      title: "Impossible de valider un billet deux fois",
      description: "Chaque QR code est signé et à usage unique, même détecté entre plusieurs contrôleurs différents.",
    },
    {
      title: "Recherche par nom en secours",
      description: "Si un invité n'a pas son QR code sous la main, le contrôleur peut le retrouver par nom.",
    },
  ],
  faq: [
    {
      question: "Le check-in QR fonctionne-t-il vraiment sans internet le jour de l'événement ?",
      answer:
        "Oui, la liste des invités et de leurs billets est synchronisée à l'avance sur l'appareil du contrôleur ; les scans effectués hors-ligne sont enregistrés localement puis synchronisés dès que la connexion revient.",
    },
    {
      question: "Que se passe-t-il si deux contrôleurs scannent le même billet ?",
      answer:
        "Un billet validé une première fois ne peut plus être accepté ensuite, même par un contrôleur différent — les scans sont réconciliés dès que la synchronisation a lieu entre les appareils.",
    },
    {
      question: "Faut-il un matériel spécial pour scanner les billets ?",
      answer:
        "Non, un simple smartphone avec un navigateur suffit ; aucune application ni douchette de scan dédiée n'est nécessaire.",
    },
  ],
  breadcrumbLabel: "Check-in par QR code",
  ctaHeading: "Prêt à sécuriser l'entrée de votre événement ?",
  ctaSubtext: "Créez votre compte gratuit et testez le check-in dès votre premier événement.",
};

export default function CheckinQrPage() {
  return <ThematicPage content={content} siteUrl={siteUrl()} path={SEO_ROUTES.CHECKIN_QR} />;
}
