import type { Metadata } from "next";
import { ThematicPage, type ThematicPageContent, buildThematicMetadata, siteUrl } from "@/components/modules/seo";
import { SEO_ROUTES } from "@/lib/constants";

const TITLE = "Gestion de séminaire et événement d'entreprise en Guinée | Jikū";
const DESCRIPTION =
  "Invitations, confirmation de présence et badges QR pour vos séminaires et événements d'entreprise en Guinée. Export des présences pour votre reporting.";

export const metadata: Metadata = buildThematicMetadata({
  path: SEO_ROUTES.SEMINAR_GUINEA,
  title: TITLE,
  description: DESCRIPTION,
});

const content: ThematicPageContent = {
  eyebrow: "Séminaires en Guinée",
  title: "Gestion de séminaire et événement d'entreprise en Guinée : de l'invitation au reporting",
  intro:
    "Un séminaire d'entreprise ou une conférence professionnelle en Guinée implique souvent une liste de participants venus de plusieurs services, parfois de plusieurs villes, avec un besoin de preuve de présence pour le reporting interne ou pour un client. Jikū envoie une invitation par lien personnel à chaque participant, par e-mail ou WhatsApp, avec les informations de l'événement et un bouton pour confirmer sa venue. Le tableau de bord affiche en direct qui a confirmé et qui n'a pas encore répondu, utile pour relancer par service avant la date limite. Le jour du séminaire, chaque participant confirmé se présente avec un badge à QR code, scanné à l'entrée de la salle — le contrôle d'accès fonctionne aussi hors-ligne, pratique dans les lieux de conférence où le réseau est instable. Après l'événement, vous exportez la liste complète des présences réelles au format CSV pour votre reporting interne ou pour justifier la participation auprès d'un partenaire ou d'un client. Marque blanche incluse : vos participants voient le nom et les couleurs de votre organisation, jamais Jikū.",
  bullets: [
    {
      title: "Invitations par service ou par liste complète",
      description: "Importez la liste des participants une fois, en CSV, et envoyez les invitations en un clic.",
    },
    {
      title: "Confirmations suivies en direct",
      description: "Relancez facilement les participants qui n'ont pas encore répondu avant la date limite.",
    },
    {
      title: "Badges QR à l'entrée",
      description: "Un badge à QR code par participant confirmé, scanné à l'entrée de la salle de conférence.",
    },
    {
      title: "Export des présences réelles",
      description: "Téléchargez la liste des présences effectivement enregistrées au check-in, au format CSV.",
    },
  ],
  faq: [
    {
      question: "Puis-je exporter la liste des personnes réellement présentes au séminaire ?",
      answer:
        "Oui, vous exportez au format CSV la liste des invités effectivement enregistrés au check-in, distincte de la liste des simples confirmations, pour votre reporting.",
    },
    {
      question: "Le contrôle d'accès fonctionne-t-il pour plusieurs centaines de participants ?",
      answer:
        "Oui, chaque billet est scanné individuellement avec un QR code signé et à usage unique, ce qui reste fiable quel que soit le nombre de participants.",
    },
    {
      question: "Peut-on utiliser Jikū pour un événement récurrent, par exemple un séminaire trimestriel ?",
      answer:
        "Oui, chaque session est créée comme un nouvel événement avec sa propre liste d'invités et son propre suivi, sans lien entre les sessions précédentes.",
    },
  ],
  breadcrumbLabel: "Gestion de séminaire en Guinée",
  ctaHeading: "Prêt à organiser votre prochain séminaire ?",
  ctaSubtext: "Créez votre compte gratuit et importez votre liste de participants dès aujourd'hui.",
};

export default function SeminarGuineaPage() {
  return <ThematicPage content={content} siteUrl={siteUrl()} path={SEO_ROUTES.SEMINAR_GUINEA} />;
}
