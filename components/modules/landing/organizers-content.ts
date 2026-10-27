// CONTRACT — every word of the page for professional event organizers
// (JIKU-266), in both locales: wedding planners, event agencies, venues and the
// associations of expatriate communities. It is the page the launch ads and
// the sales assistant send people to. Same rules as content.ts: no invented
// numbers, no claims the product cannot evidence; every amount comes from
// `lib/pricing.ts` through `formatPrice`.

import {
  DEFAULT_CURRENCY,
  EVENT_PRICING,
  FREE_OFFER,
  ORGANIZER_PACK,
  organizerPackBreakEven,
  type PricingCurrency,
} from "@/lib/pricing";
import type { LandingCardSample, LandingLocale } from "./content";
import type { MarketingNavContent } from "./marketing-header";
import { formatPrice } from "./price-anchor";

export interface OrganizersPageContent {
  meta: { title: string; description: string; keywords: string[] };
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta: string;
  secondaryCta: string;
  /** The card drawn next to the intro. */
  sample: LandingCardSample;
  invites: string;
  steps: { heading: string; items: { title: string; text: string }[]; guide: string };
  why: { heading: string; items: { title: string; text: string }[] };
  pack: {
    heading: string;
    price: string;
    per: string;
    includes: string[];
    resell: { heading: string; text: string };
    note: string;
  };
  faq: { heading: string; items: { question: string; answer: string }[] };
  cta: { heading: string; text: string; primary: string; secondary: string };
  breadcrumb: string;
  nav: MarketingNavContent;
}

const pack = (locale: LandingLocale, currency: PricingCurrency) => formatPrice(ORGANIZER_PACK.monthly, locale, currency);
const extra = (locale: LandingLocale, currency: PricingCurrency) => formatPrice(ORGANIZER_PACK.extraPerGuest, locale, currency);
const perGuest = (locale: LandingLocale, currency: PricingCurrency) => formatPrice(EVENT_PRICING.perGuest, locale, currency);
const included = (locale: LandingLocale) =>
  new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US").format(ORGANIZER_PACK.includedGuests);

function fr(currency: PricingCurrency): OrganizersPageContent {
  return {
    meta: {
      title: "Jikū pour les organisateurs d'événements : invitations WhatsApp et entrée par QR",
      description:
        "Wedding planners, agences et salles : envoyez les invitations sur WhatsApp, recevez les réponses en direct et contrôlez l'entrée par QR, même sans réseau. Un forfait mensuel pour tous vos événements.",
      keywords: [
        "wedding planner",
        "agence événementielle",
        "invitation mariage WhatsApp",
        "contrôle d'entrée QR code",
        "gestion des invités",
        "logiciel organisateur d'événements",
      ],
    },
    eyebrow: "Pour les organisateurs d'événements",
    title: "Les invitations et l'entrée de vos événements, sur WhatsApp",
    intro:
      "Vos invités reçoivent leur invitation sur WhatsApp et répondent en un geste. Chaque « oui » reçoit son billet QR, et votre équipe contrôle l'entrée depuis son téléphone, même quand le réseau tombe. Fini les listes papier et les resquilleurs.",
    primaryCta: "Créer mon compte gratuit",
    secondaryCta: "Estimer mes événements",
    sample: {
      style: "ELEGANT",
      event: "Mariage d'Aïcha & Karim",
      organizer: "Famille Barry",
      when: "sam. 12 déc. · 16 h",
      color: "#5B3A29",
      photo: false,
    },
    invites: "vous invite",
    steps: {
      heading: "Un événement en quatre étapes",
      items: [
        {
          title: "Importez la liste",
          text: "Depuis le fichier Excel ou CSV de votre client, ou un par un. Les doublons sont signalés.",
        },
        {
          title: "Envoyez les invitations",
          text: "Sur WhatsApp, par e-mail ou les deux, aux couleurs de votre client. Ou une carte à partager dans ses groupes.",
        },
        {
          title: "Suivez les réponses",
          text: "Qui vient, avec combien d'accompagnants, qui n'a pas répondu : en direct, prêt à montrer à votre client.",
        },
        {
          title: "Contrôlez l'entrée",
          text: "Chaque contrôleur scanne les billets QR avec son téléphone. Un billet ne passe qu'une fois, même sans réseau.",
        },
      ],
      guide: "Lire le guide pas à pas",
    },
    why: {
      heading: "Pensé pour ceux qui organisent tous les mois",
      items: [
        {
          title: "Tous vos événements au même endroit",
          text: "Mariages, baptêmes, séminaires, galas : chaque événement a sa liste, ses catégories et son suivi.",
        },
        {
          title: "Une équipe d'entrée sans formation",
          text: "Chaque contrôleur reçoit un lien personnel, sans compte ni application. Vous le révoquez d'un geste.",
        },
        {
          title: "La marque de votre client, ou la vôtre",
          text: "Logo, couleurs et nom sur les invitations, les billets et les pages. Jikū reste en coulisses.",
        },
        {
          title: "Rien à installer pour les invités",
          text: "Un lien ouvert dans le navigateur du téléphone suffit, en français ou en anglais.",
        },
      ],
    },
    pack: {
      heading: "Pro Organisateur",
      price: pack("fr", currency),
      per: "par mois",
      includes: [
        `${included("fr")} invités par mois, répartis sur autant d'événements que vous voulez`,
        `Au-delà, ${extra("fr", currency)} par invité`,
        "Invitations, cartes à partager, billets QR et contrôle d'entrée",
        "Votre équipe d'entrée et vos opérateurs sans supplément",
        "Votre propre numéro WhatsApp, à votre nom",
      ],
      resell: {
        heading: "Intégrez-le à votre devis",
        text: `Les invitations numériques et le contrôle d'entrée sont un service que vous apportez à votre client : ajoutez-les à votre devis. Dès ${new Intl.NumberFormat("fr-FR").format(organizerPackBreakEven(currency))} invités par mois, le forfait coûte moins que de payer chaque événement.`,
      },
      note: `Vous organisez un seul événement ? Jusqu'à ${FREE_OFFER.guestsPerYear} invités sur l'année, c'est gratuit ; au-delà, ${perGuest("fr", currency)} par invité, tout compris. Prix toutes taxes comprises.`,
    },
    faq: {
      heading: "Les questions des organisateurs",
      items: [
        {
          question: "Et si le réseau tombe le jour de l'événement ?",
          answer:
            "Le contrôle continue. La liste est déjà sur le téléphone du contrôleur, les entrées se synchronisent au retour du réseau, et un billet ne passe jamais deux fois.",
        },
        {
          question: "Mes invités doivent-ils installer une application ?",
          answer: "Non. Ils touchent le lien reçu sur WhatsApp ou par e-mail, répondent, et leur billet QR s'affiche.",
        },
        {
          question: "Puis-je gérer plusieurs clients en même temps ?",
          answer:
            "Oui. Chaque événement a sa propre liste, ses catégories, ses contrôleurs et son suivi, et Pro Organisateur couvre tous vos événements du mois.",
        },
        {
          question: "Jikū touche-t-il à l'argent de mes clients ?",
          answer:
            "Jamais. Si vous vendez des billets, le public vous paie directement, sur vos numéros Mobile Money ou votre lien de paiement.",
        },
        {
          question: "Comment payer Jikū ?",
          answer:
            "Depuis la facturation de votre espace, par virement bancaire, en francs guinéens, en francs CFA ou en dollars. Le montant exact et la référence à indiquer s'affichent avant le paiement ; le paiement en ligne arrive bientôt.",
        },
      ],
    },
    cta: {
      heading: "Votre prochain événement mérite une entrée sans file ni resquilleurs",
      text: "Créez votre compte en une minute, sans carte bancaire, et préparez les invitations de votre prochain client.",
      primary: "Créer mon compte gratuit",
      secondary: "Estimer mes événements",
    },
    breadcrumb: "Organisateurs d'événements",
    nav: {
      home: "Accueil",
      signIn: "Se connecter",
      createAccount: "Créer un compte",
      switchLocale: { label: "EN", locale: "en", ariaLabel: "Read this page in English" },
    },
  };
}

function en(currency: PricingCurrency): OrganizersPageContent {
  return {
    meta: {
      title: "Jikū for event organizers: WhatsApp invitations and QR check-in",
      description:
        "Wedding planners, agencies and venues: send invitations on WhatsApp, see answers live and check guests in by QR code, even offline. One monthly plan for all your events.",
      keywords: [
        "wedding planner",
        "event agency",
        "WhatsApp wedding invitation",
        "QR code check-in",
        "guest list management",
        "event organizer software",
      ],
    },
    eyebrow: "For event organizers",
    title: "Invitations and door check-in for your events, on WhatsApp",
    intro:
      "Guests get their invitation on WhatsApp and answer in one tap. Every yes gets a QR ticket, and your team checks people in from their phones, even when the network drops. No more paper lists or gatecrashers.",
    primaryCta: "Create my free account",
    secondaryCta: "Estimate my events",
    sample: {
      style: "ELEGANT",
      event: "Aïcha & Karim's wedding",
      organizer: "The Barry family",
      when: "Sat, Dec 12 · 4 pm",
      color: "#5B3A29",
      photo: false,
    },
    invites: "invites you",
    steps: {
      heading: "An event in four steps",
      items: [
        {
          title: "Import the list",
          text: "From your client's Excel or CSV file, or one by one. Duplicates are flagged.",
        },
        {
          title: "Send the invitations",
          text: "On WhatsApp, by email or both, in your client's colors. Or a card to share in their groups.",
        },
        {
          title: "Follow the answers",
          text: "Who's coming, with how many guests, who hasn't answered: live, ready to show your client.",
        },
        {
          title: "Check guests in",
          text: "Each door staff member scans QR tickets with their phone. A ticket only works once, even offline.",
        },
      ],
      guide: "Read the step-by-step guide",
    },
    why: {
      heading: "Built for people who organize every month",
      items: [
        {
          title: "All your events in one place",
          text: "Weddings, christenings, seminars, galas: each event has its own list, categories and tracking.",
        },
        {
          title: "Door staff need no training",
          text: "Each one gets a personal link, with no account or app. You revoke it in one tap.",
        },
        {
          title: "Your client's brand, or yours",
          text: "Logo, colors and name on invitations, tickets and pages. Jikū stays behind the scenes.",
        },
        {
          title: "Nothing for guests to install",
          text: "A link opened in the phone's browser is enough, in English or French.",
        },
      ],
    },
    pack: {
      heading: "Pro Organizer",
      price: pack("en", currency),
      per: "per month",
      includes: [
        `${included("en")} guests a month, across as many events as you like`,
        `Beyond that, ${extra("en", currency)} per guest`,
        "Invitations, shareable cards, QR tickets and door check-in",
        "Your door staff and operators at no extra cost",
        "Your own WhatsApp number, in your name",
      ],
      resell: {
        heading: "Put it in your quote",
        text: `Digital invitations and door check-in are a service you bring to your client: add them to your quote. From ${new Intl.NumberFormat("en-US").format(organizerPackBreakEven(currency))} guests a month, the plan costs less than paying for each event.`,
      },
      note: `Running a single event? Up to ${FREE_OFFER.guestsPerYear} guests a year is free; beyond that, ${perGuest("en", currency)} per guest, all included. Prices include all taxes.`,
    },
    faq: {
      heading: "Organizers' questions",
      items: [
        {
          question: "What if the network drops on the day?",
          answer:
            "Check-in keeps going. The list is already on the door staff's phone, entries sync when the network is back, and a ticket never works twice.",
        },
        {
          question: "Do my guests need to install an app?",
          answer: "No. They tap the link they got on WhatsApp or by email, answer, and their QR ticket appears.",
        },
        {
          question: "Can I handle several clients at once?",
          answer:
            "Yes. Each event has its own list, categories, door staff and tracking, and Pro Organizer covers all your events of the month.",
        },
        {
          question: "Does Jikū touch my clients' money?",
          answer: "Never. If you sell tickets, the public pays you directly, on your Mobile Money numbers or your payment link.",
        },
        {
          question: "How do I pay Jikū?",
          answer:
            "From the billing page of your workspace, by bank transfer, in Guinean francs, CFA francs or US dollars. The exact amount and the reference to quote show before you pay; online payment is coming soon.",
        },
      ],
    },
    cta: {
      heading: "Your next event deserves a door with no queue and no gatecrashers",
      text: "Create your account in a minute, with no card, and get your next client's invitations ready.",
      primary: "Create my free account",
      secondary: "Estimate my events",
    },
    breadcrumb: "Event organizers",
    nav: {
      home: "Home",
      signIn: "Sign in",
      createAccount: "Create an account",
      switchLocale: { label: "FR", locale: "fr", ariaLabel: "Lire cette page en français" },
    },
  };
}

const BUILDERS: Record<LandingLocale, (currency: PricingCurrency) => OrganizersPageContent> = { fr, en };

/** The page for professional organizers in [locale], its prices in [currency]. */
export function organizersContent(locale: LandingLocale, currency: PricingCurrency): OrganizersPageContent {
  return BUILDERS[locale](currency);
}

/** Each locale in its default currency, for its metadata. */
export const ORGANIZERS_CONTENT: Record<LandingLocale, OrganizersPageContent> = {
  fr: fr(DEFAULT_CURRENCY.fr),
  en: en(DEFAULT_CURRENCY.en),
};
