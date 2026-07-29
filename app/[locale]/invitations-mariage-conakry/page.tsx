import type { Metadata } from "next";
import { ThematicPage, type ThematicPageContent, buildThematicMetadata, siteUrl } from "@/components/modules/seo";
import { SEO_ROUTES } from "@/lib/constants";

const TITLE = "Invitations de mariage à Conakry — WhatsApp, e-mail et billets QR | Jikū";
const DESCRIPTION =
  "Envoyez vos invitations de mariage à Conakry par WhatsApp et e-mail, suivez les confirmations en temps réel et gérez le check-in le jour J avec des billets QR. Gratuit jusqu'à 100 invités.";

export const metadata: Metadata = buildThematicMetadata({
  path: SEO_ROUTES.WEDDING_CONAKRY,
  title: TITLE,
  description: DESCRIPTION,
});

const content: ThematicPageContent = {
  eyebrow: "Mariages à Conakry",
  title: "Invitations de mariage à Conakry : par WhatsApp, e-mail, avec suivi des confirmations",
  intro:
    "Organiser un mariage à Conakry veut souvent dire des centaines d'invités, entre la famille, les amis et les relations professionnelles — un carnet d'adresses trop large pour des cartons papier ou un simple message WhatsApp transféré de groupe en groupe. Jikū envoie à chaque invité un lien personnel par WhatsApp ou e-mail, avec le nom des mariés, la date, le lieu et un bouton pour confirmer sa présence en un geste. Vous voyez en direct qui a confirmé, qui a décliné et qui n'a pas encore répondu, sans relancer un par un. Le jour du mariage, chaque invité confirmé reçoit un billet avec un QR code signé, scanné à l'entrée même sans connexion internet — utile dans une salle de réception où le réseau est parfois faible. Vos invités n'installent aucune application : tout se passe dans le navigateur de leur téléphone. Gratuit jusqu'à 100 invités cumulés sur votre compte ; au-delà, un tarif unique selon la taille du mariage, sans abonnement.",
  bullets: [
    {
      title: "Invitations par WhatsApp et e-mail",
      description: "Un lien personnel par invité, envoyé via l'API officielle WhatsApp Business — jamais un message transféré de groupe en groupe.",
    },
    {
      title: "Suivi des confirmations en direct",
      description: "Voyez qui a confirmé, décliné, ou n'a pas encore répondu, sans tenir un tableau à part.",
    },
    {
      title: "Billets QR pour le jour J",
      description: "Chaque invité confirmé reçoit un billet avec QR code signé, valable pour l'entrée à la réception.",
    },
    {
      title: "Check-in même sans réseau",
      description: "La liste des invités se synchronise à l'avance ; le scan fonctionne hors-ligne et se synchronise ensuite.",
    },
  ],
  faq: [
    {
      question: "Mes invités doivent-ils installer une application pour mon mariage ?",
      answer:
        "Non. Chaque invité reçoit un lien qui ouvre une page dans le navigateur de son téléphone, où il confirme sa présence et reçoit son billet.",
    },
    {
      question: "Est-ce que je peux personnaliser l'invitation avec nos couleurs et notre nom ?",
      answer:
        "Oui, la marque blanche est incluse à chaque niveau : vos invités voient votre nom et vos couleurs, jamais Jikū.",
    },
    {
      question: "Combien coûte l'envoi d'invitations pour un mariage de 300 invités à Conakry ?",
      answer:
        "150 000 GNF pour un mariage jusqu'à 300 invités, montant unique, sans abonnement mensuel. C'est gratuit jusqu'à 100 invités.",
    },
  ],
  breadcrumbLabel: "Invitations de mariage à Conakry",
  ctaHeading: "Prêt à envoyer vos invitations de mariage ?",
  ctaSubtext: "Créez votre compte gratuit et commencez à inviter dès aujourd'hui.",
};

export default function WeddingConakryPage() {
  return <ThematicPage content={content} siteUrl={siteUrl()} path={SEO_ROUTES.WEDDING_CONAKRY} />;
}
