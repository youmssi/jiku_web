import type { Metadata } from "next";
import { ThematicPage, type ThematicPageContent, buildThematicMetadata, siteUrl } from "@/components/modules/seo";
import { SEO_ROUTES } from "@/lib/constants";

const TITLE = "Organiser un événement en salle à Conakry — invitations et contrôle d'accès | Jikū";
const DESCRIPTION =
  "Gérez les invitations, la capacité et le contrôle d'accès de votre événement en salle à Conakry : lien personnel par invité, billets QR, check-in hors-ligne à l'entrée.";

export const metadata: Metadata = buildThematicMetadata({
  path: SEO_ROUTES.VENUE_EVENT_CONAKRY,
  title: TITLE,
  description: DESCRIPTION,
});

const content: ThematicPageContent = {
  eyebrow: "Événements en salle à Conakry",
  title: "Organiser un événement en salle à Conakry : invitations, capacité et contrôle d'accès",
  intro:
    "Gala, soirée, lancement de produit, conférence privée ou cocktail d'entreprise : dès qu'une salle a une capacité limitée à Conakry, le vrai défi n'est pas d'inviter du monde mais de savoir précisément qui viendra et de contrôler l'entrée le jour J. Jikū envoie à chaque invité un lien personnel par WhatsApp ou e-mail pour confirmer sa présence, et vous donne une limite de capacité claire : dès que le nombre de confirmations approche la jauge de la salle, vous le voyez sur le tableau de bord avant que ce soit un problème le soir de l'événement. Chaque invité confirmé reçoit un billet avec un QR code unique et signé, impossible à dupliquer ou à réutiliser — un billet scanné une fois ne peut plus être validé une deuxième fois, même par un autre contrôleur, ce qui coupe court aux tentatives d'entrée avec une capture d'écran partagée. Le scan fonctionne aussi hors-ligne, utile dans les salles où le réseau est instable, avec synchronisation automatique dès que la connexion revient. Vos invités voient votre marque, pas Jikū.",
  bullets: [
    {
      title: "Suivi de la capacité en temps réel",
      description: "Voyez le nombre de confirmations approcher la jauge de la salle avant le jour de l'événement.",
    },
    {
      title: "Billets QR uniques et signés",
      description: "Un billet scanné ne peut jamais être validé une deuxième fois, même par un autre contrôleur.",
    },
    {
      title: "Check-in hors-ligne à l'entrée",
      description: "La liste se synchronise à l'avance ; le contrôle d'accès fonctionne même sans réseau stable.",
    },
    {
      title: "Marque blanche",
      description: "Vos invités voient le nom et les couleurs de votre organisation, jamais Jikū.",
    },
  ],
  faq: [
    {
      question: "Puis-je limiter le nombre d'invités qui peuvent confirmer leur présence ?",
      answer:
        "Oui, vous fixez la capacité de l'événement et suivez les confirmations en direct pour rester dans la limite de la salle.",
    },
    {
      question: "Comment éviter qu'un billet soit utilisé par plusieurs personnes ?",
      answer:
        "Chaque billet porte un QR code signé et à usage unique : une fois scanné et validé, il ne peut plus être accepté à une deuxième entrée, même par un contrôleur différent.",
    },
    {
      question: "Le contrôle d'accès fonctionne-t-il si la salle n'a pas de bon réseau internet ?",
      answer:
        "Oui, la liste des invités est synchronisée à l'avance sur l'appareil du contrôleur, et les scans hors-ligne se synchronisent automatiquement au retour du réseau.",
    },
  ],
  breadcrumbLabel: "Événement en salle à Conakry",
  ctaHeading: "Prêt à organiser votre événement en salle ?",
  ctaSubtext: "Créez votre compte gratuit et configurez la capacité de votre événement dès aujourd'hui.",
};

export default function VenueEventConakryPage() {
  return <ThematicPage content={content} siteUrl={siteUrl()} path={SEO_ROUTES.VENUE_EVENT_CONAKRY} />;
}
