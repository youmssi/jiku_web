import type { Metadata } from "next";
import { ThematicPage, type ThematicPageContent, buildThematicMetadata, siteUrl } from "@/components/modules/seo";
import { SEO_ROUTES } from "@/lib/constants";

const TITLE = "Invitations de baptême en Guinée — WhatsApp, e-mail et suivi des présences | Jikū";
const DESCRIPTION =
  "Envoyez vos invitations de baptême en Guinée par WhatsApp et e-mail, suivez qui a confirmé et gérez l'accueil des invités avec des billets QR. Gratuit jusqu'à 100 invités.";

export const metadata: Metadata = buildThematicMetadata({
  path: SEO_ROUTES.BAPTISM_GUINEA,
  title: TITLE,
  description: DESCRIPTION,
});

const content: ThematicPageContent = {
  eyebrow: "Baptêmes en Guinée",
  title: "Invitations de baptême en Guinée : envoi WhatsApp, suivi des présences, accueil simplifié",
  intro:
    "Un baptême rassemble souvent la famille élargie, les parrains et marraines, les voisins et les amis proches — une liste qu'il est facile de perdre de vue avec des messages WhatsApp envoyés un par un ou des cartons distribués à la main. Avec Jikū, vous importez votre liste d'invités une seule fois, et chaque personne reçoit un lien personnel par WhatsApp ou e-mail avec les informations de la cérémonie et un bouton pour confirmer sa venue. Le tableau de bord vous montre en temps réel le nombre de confirmations, utile pour prévoir la restauration et l'organisation de la réception qui suit souvent la cérémonie. Le jour du baptême, chaque invité confirmé se présente avec un billet QR scanné à l'entrée, même dans un lieu où la connexion internet est limitée. Aucune application à installer pour vos invités : tout se passe directement dans le navigateur de leur téléphone. C'est gratuit jusqu'à 100 invités cumulés sur votre compte ; au-delà, un tarif unique selon le nombre d'invités, sans abonnement.",
  bullets: [
    {
      title: "Une liste d'invités, importée une fois",
      description: "Importez votre liste (famille, parrains, marraines, amis) depuis un fichier CSV en quelques minutes.",
    },
    {
      title: "Invitations par WhatsApp et e-mail",
      description: "Chaque invité reçoit un lien personnel avec les détails de la cérémonie et un bouton de confirmation.",
    },
    {
      title: "Nombre de confirmations en direct",
      description: "Utile pour prévoir la restauration et l'organisation de la réception qui suit la cérémonie.",
    },
    {
      title: "Accueil avec billet QR",
      description: "Chaque invité confirmé présente un billet scanné à l'entrée, même sans réseau internet.",
    },
  ],
  faq: [
    {
      question: "Puis-je envoyer les invitations de baptême seulement par WhatsApp, sans e-mail ?",
      answer:
        "Oui, vous choisissez le ou les canaux activés pour votre événement — WhatsApp seul, e-mail seul, ou les deux, invité par invité si besoin.",
    },
    {
      question: "Comment savoir combien de personnes viendront à la réception ?",
      answer:
        "Le tableau de bord affiche en temps réel le nombre de confirmations, de refus et de réponses en attente, pour ajuster la restauration à l'avance.",
    },
    {
      question: "Est-ce payant pour un petit baptême familial ?",
      answer:
        "Non, c'est gratuit jusqu'à 100 invités cumulés sur votre compte sur une année glissante — largement suffisant pour la plupart des baptêmes familiaux.",
    },
  ],
  breadcrumbLabel: "Invitations de baptême en Guinée",
  ctaHeading: "Prêt à organiser les invitations de votre baptême ?",
  ctaSubtext: "Créez votre compte gratuit et importez votre liste d'invités dès aujourd'hui.",
};

export default function BaptismGuineaPage() {
  return <ThematicPage content={content} siteUrl={siteUrl()} path={SEO_ROUTES.BAPTISM_GUINEA} />;
}
