import { Suspense } from "react";
import type { Metadata } from "next";
import { ThematicPage, type ThematicPageContent, buildThematicMetadata, siteUrl } from "@/components/modules/seo";
import { EarlyAccessForm } from "@/components/modules/prospect";
import { SEO_ROUTES } from "@/lib/constants";

const TITLE = "Prise de rendez-vous en ligne à Conakry — couture, coiffure, photo | Jikū";
const DESCRIPTION =
  "Vos clients réservent leur créneau en ligne, reçoivent un rappel WhatsApp et ne patientent plus. Rendez-vous et sans-rendez-vous sur un seul écran. Accès anticipé ouvert aux professionnels de Conakry.";

export const metadata: Metadata = buildThematicMetadata({
  path: SEO_ROUTES.APPOINTMENTS,
  title: TITLE,
  description: DESCRIPTION,
});

const content: ThematicPageContent = {
  eyebrow: "Prise de rendez-vous",
  title: "Prise de rendez-vous en ligne : vos clients réservent, vous ne gérez plus le désordre",
  intro:
    "Une couturière à Conakry passe ses journées à répondre au téléphone pour caler un essayage, puis à recevoir quand même celles qui passent sans prévenir. Une coiffeuse jongle entre les rendez-vous notés sur un cahier et les clientes assises à attendre. Un photographe note ses séances dans WhatsApp et découvre trop tard deux séances à la même heure. Jikū donne à votre activité un lien que vous partagez sur WhatsApp ou sur votre page : votre client choisit son service, voit vos créneaux réellement libres, réserve en trois taps sans créer de compte, et reçoit un rappel automatique la veille et deux heures avant. De votre côté, une seule ligne du jour affiche vos rendez-vous et les personnes venues sans rendez-vous, dans l'ordre où vous devez les prendre. Vous restez maître de tout : vous décidez si un créneau est réservé directement ou si vous confirmez d'abord, service par service. Le no-show, qui est le vrai coût d'une journée, se règle par le rappel — pas par de la discipline.",
  bullets: [
    {
      title: "Vos clients réservent sans compte",
      description:
        "Un lien, trois taps, un ticket avec QR code. Aucune application à installer, ni pour vous ni pour eux.",
    },
    {
      title: "Rendez-vous et sans-rendez-vous sur un écran",
      description:
        "Ceux qui passent sans prévenir s'intercalent dans la même ligne du jour. Un bouton « Suivant » et vous savez qui prendre.",
    },
    {
      title: "Rappel WhatsApp automatique",
      description:
        "La veille et deux heures avant. C'est ce qui fait revenir les gens, et donc ce qui remplit vos journées.",
    },
    {
      title: "Vous fixez vos règles",
      description:
        "Réservation directe ou confirmation par vous, durée, délai d'annulation, congés — service par service.",
    },
  ],
  faq: [
    {
      question: "Mes clients doivent-ils installer une application ?",
      answer:
        "Non. Ils ouvrent le lien que vous partagez, choisissent un créneau et reçoivent leur confirmation. Tout se passe dans le navigateur de leur téléphone, comme pour les invitations Jikū.",
    },
    {
      question: "Et ceux qui viennent sans rendez-vous ?",
      answer:
        "Ils sont pris en charge dans la même ligne du jour. Vous les ajoutez au comptoir en deux champs, et ils s'intercalent entre vos rendez-vous selon leur heure d'arrivée. Vous n'avez jamais deux écrans à surveiller.",
    },
    {
      question: "Est-ce que je peux confirmer moi-même avant qu'un créneau soit pris ?",
      answer:
        "Oui, et c'est le réglage par défaut. Vous choisissez, service par service, si un client réserve directement ou s'il vous envoie une demande que vous acceptez ou refusez. Une coloration ne se traite pas comme une coupe.",
    },
    {
      question: "Que se passe-t-il si je n'ai pas de connexion ?",
      answer:
        "La prise de rendez-vous par vos clients a besoin d'internet. En revanche l'accueil sur place continue de fonctionner hors connexion et se synchronise ensuite — c'est le même moteur que celui utilisé aux portes des mariages, pensé pour les coupures.",
    },
    {
      question: "Combien ça coûte ?",
      answer:
        "L'abonnement se paie par Mobile Money, au mois ou par période de trois, six ou douze mois, et dépend du nombre de personnes ou de postes que vous gérez. Aucune carte bancaire n'est demandée. Les tarifs définitifs sont communiqués aux inscrits de l'accès anticipé avant l'ouverture.",
    },
    {
      question: "Quand est-ce disponible ?",
      answer:
        "Nous ouvrons progressivement, en commençant par les professionnels inscrits à l'accès anticipé, que nous accompagnons un par un pour la configuration. Laissez vos coordonnées ci-dessus pour être parmi les premiers.",
    },
  ],
  breadcrumbLabel: "Prise de rendez-vous",
  ctaHeading: "",
  ctaSubtext: "",
};

/**
 * Page d'acquisition pour la prise de rendez-vous (JIKU-98).
 *
 * Le produit n'est pas encore livrable : l'appel à l'action est donc le formulaire
 * d'accès anticipé, pas la création de compte. La page décrit ce que le produit
 * fera, au futur assumé, et ne propose jamais de réserver un créneau qui n'existe
 * pas — c'est exactement le risque « acompte encaissé, service dégradé » du registre.
 */
export default function AppointmentsPage() {
  return (
    <ThematicPage
      content={content}
      siteUrl={siteUrl()}
      path={SEO_ROUTES.APPOINTMENTS}
      cta={
        // Le formulaire lit `?src=` pour tracer la campagne, ce qui empêcherait le
        // prérendu statique de la page. La borne Suspense garde la page statique —
        // ce qui compte pour une page d'acquisition référencée.
        <Suspense fallback={<div className="mt-12 h-96 rounded-xl border border-primary/15 bg-primary/5" />}>
          <EarlyAccessForm />
        </Suspense>
      }
    />
  );
}
