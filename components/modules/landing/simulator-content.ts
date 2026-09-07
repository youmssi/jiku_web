// CONTRACT — every word on the /simulator pricing page, in both locales.
// Two models are explained side by side so a visitor picks the one that fits
// their need: events are paid per event by guest count (lib/pricing.ts mirrors
// the backend tier catalog), appointments are a per-user monthly subscription.
// The subscription offer is not launched yet: its figures are the decided,
// indicative plan, shown as such and never sold online.

import type { LandingLocale } from "./content";

export interface SimulatorPlan {
  id: string;
  name: string;
  audience: string;
  /** GNF per user per month; 0 = free forever, null = custom quote. */
  monthlyPerUser?: number;
  /** GNF per user per month when billed yearly; null when not offered. */
  yearlyPerUser?: number;
  annualOnly?: boolean;
  priceCaption: string;
  /** Full sentence describing the yearly saving, already localised. */
  annualNote?: string;
  features: string[];
  cta: string;
  mailSubject: string;
  highlight?: boolean;
}

export interface SimulatorContent {
  meta: {
    title: string;
    description: string;
  };
  eyebrow: string;
  title: string;
  intro: string;
  tabs: {
    event: string;
    subscription: string;
  };
  usdPrefix: string;
  guarantee: {
    heading: string;
    text: string;
  };
  event: {
    input: {
      label: string;
      helper: string;
    };
    result: {
      freeLabel: string;
      freeNote: string;
      tierLabel: string;
      totalLabel: string;
      depositLabel: string;
      depositNote: string;
      customNote: string;
      perGuestNote: string;
    };
    ladder: {
      heading: string;
      note: string;
    };
    cta: {
      heading: string;
      text: string;
      primary: string;
      secondary: string;
      quoteCta: string;
      quoteSubjectPrefix: string;
    };
  };
  subscription: {
    badge: string;
    intro: string;
    whatsappNote: string;
    plans: SimulatorPlan[];
  };
  nav: {
    home: string;
    signIn: string;
    createAccount: string;
    switchLocale: { label: string; href: string; ariaLabel: string };
  };
}

const fr: SimulatorContent = {
  meta: {
    title: "Simulateur de prix Jikū - événement ou abonnement",
    description:
      "Événement : un prix par événement, gratuit jusqu'à 100 invités. Rendez-vous : un abonnement par utilisateur et par mois. Voyez le total en francs guinéens et en dollars.",
  },
  eyebrow: "Simulateur de prix",
  title: "Combien ça coûte, selon votre besoin ?",
  intro:
    "Deux usages, deux modèles clairs. Vous envoyez des invitations : un prix par événement, selon le nombre d'invités. Vous gérez des rendez-vous : un abonnement par utilisateur et par mois. Aucun abonnement n'est exigé pour un événement, et un abonné n'est jamais facturé deux fois pour ses invitations.",
  tabs: {
    event: "Événement (invitations)",
    subscription: "Rendez-vous (abonnement)",
  },
  usdPrefix: "≈ US$",
  guarantee: {
    heading: "Votre argent est protégé",
    text: "Votre acompte est déduit du prix final : vous n'êtes jamais facturé deux fois pour les mêmes invités. Annulation : remboursement de 100 % jusqu'à 60 jours avant l'événement, 50 % entre 30 et 60 jours, rien ensuite. Aucune carte bancaire n'est demandée.",
  },
  event: {
    input: {
      label: "Nombre d'invités estimé",
      helper: "Faites glisser ou saisissez un nombre pour voir le prix changer.",
    },
    result: {
      freeLabel: "Gratuit",
      freeNote: "Jusqu'à 100 invités cumulés sur votre compte, sur une année glissante.",
      tierLabel: "Palier",
      totalLabel: "Prix de l'événement",
      depositLabel: "Acompte pour réserver (30 %)",
      depositNote: "Le solde se règle 7 jours avant l'événement.",
      customNote: "Tarif estimé selon la formule sur mesure. L'équipe commerciale confirme le montant exact.",
      perGuestNote: "Au-delà de 1 000 invités, tarif sur mesure : 0,05 $ par invité, plus 15 $ de mise en place.",
    },
    ladder: {
      heading: "Où se situe votre événement ?",
      note: "Toutes les fonctionnalités sont incluses à chaque palier. Seule la taille change.",
    },
    cta: {
      heading: "Prêt à réserver votre date ?",
      text: "Bloquez votre date avec 30 % d'acompte. Le reste se règle tranquillement avant le jour J.",
      primary: "Réserver ma date",
      secondary: "Voir les cas d'usage",
      quoteCta: "Obtenir un devis",
      quoteSubjectPrefix: "Devis Jikū - événement de",
    },
  },
  subscription: {
    badge: "Offre à venir · prix indicatifs",
    intro:
      "L'abonnement couvre votre activité de rendez-vous : votre lien de réservation, vos rappels clients et votre agenda du jour. Les invitations à un événement restent un paiement par événement, jamais incluses d'office. Cette offre s'ouvrira bientôt ; personne ne sera prélevé avant l'ouverture.",
    whatsappNote:
      "Les rappels WhatsApp sont réservés aux offres payantes. Solo repose sur l'e-mail (300 rappels par mois, gratuit pour toujours). Au-delà d'un volume raisonnable, un supplément transparent couvre le coût réel du fournisseur d'envoi.",
    plans: [
      {
        id: "solo",
        name: "Solo",
        audience: "1 utilisateur",
        monthlyPerUser: 0,
        priceCaption: "gratuit pour toujours",
        features: [
          "Votre lien de réservation et votre agenda du jour",
          "Rappels par e-mail : 300 par mois",
          "Pas de rappel WhatsApp",
          "Aucune carte bancaire demandée",
        ],
        cta: "Me prévenir de l'ouverture",
        mailSubject: "Jikū - intéressé par l'offre Solo (rendez-vous)",
      },
      {
        id: "teams",
        name: "Teams",
        audience: "Jusqu'à 5 utilisateurs",
        monthlyPerUser: 100_000,
        yearlyPerUser: 90_000,
        priceCaption: "par utilisateur et par mois",
        annualNote:
          "Payé à l'année : 90 000 GNF par utilisateur et par mois, soit 120 000 GNF d'économie par utilisateur et par an (environ 1,3 mois offerts).",
        features: [
          "Rappels WhatsApp et e-mail inclus",
          "1 agenda par utilisateur",
          "Gestion d'équipe et permissions",
          "Support prioritaire",
        ],
        highlight: true,
        cta: "Me prévenir de l'ouverture",
        mailSubject: "Jikū - intéressé par l'offre Teams (rendez-vous)",
      },
      {
        id: "organisation",
        name: "Organisation",
        audience: "Jusqu'à 20 utilisateurs",
        monthlyPerUser: 240_000,
        yearlyPerUser: 200_000,
        priceCaption: "par utilisateur et par mois",
        annualNote:
          "Payé à l'année : 200 000 GNF par utilisateur et par mois, soit 480 000 GNF d'économie par utilisateur et par an (environ 2,4 mois offerts).",
        features: [
          "Rappels WhatsApp et e-mail inclus",
          "Multi-agendas et statistiques de fréquentation",
          "Rôles et permissions avancés",
          "Export et comptabilité",
        ],
        cta: "Me prévenir de l'ouverture",
        mailSubject: "Jikū - intéressé par l'offre Organisation (rendez-vous)",
      },
      {
        id: "enterprise",
        name: "Entreprise",
        audience: "Au-delà de 20 utilisateurs ou besoins sur mesure",
        annualOnly: true,
        priceCaption: "tarification annuelle, sur devis",
        features: [
          "Déploiement sur mesure, on-premise possible",
          "SLA et accompagnement dédié",
          "Intégrations sur demande",
          "Facturation annuelle",
        ],
        cta: "Contacter l'équipe commerciale",
        mailSubject: "Jikū - demande Entreprise (tarification annuelle)",
      },
    ],
  },
  nav: {
    home: "Accueil",
    signIn: "Se connecter",
    createAccount: "Créer un compte",
    switchLocale: { label: "EN", href: "/en/simulator", ariaLabel: "Read this page in English" },
  },
};

const en: SimulatorContent = {
  meta: {
    title: "Jikū pricing simulator - event or subscription",
    description:
      "Events: one price per event, free for up to 100 guests. Appointments: a per-user monthly subscription. See the total in Guinean francs and in dollars.",
  },
  eyebrow: "Pricing simulator",
  title: "How much does it cost, for what you need?",
  intro:
    "Two needs, two clear models. You send invitations: one price per event, based on guest count. You run appointments: a per-user monthly subscription. No subscription is required to run an event, and a subscriber is never billed twice for invitations.",
  tabs: {
    event: "Event (invitations)",
    subscription: "Appointments (subscription)",
  },
  usdPrefix: "≈ US$",
  guarantee: {
    heading: "Your money is protected",
    text: "Your deposit is deducted from the final price: you are never billed twice for the same guests. Cancellation: 100% refund up to 60 days before the event, 50% between 30 and 60 days, nothing after. No card is ever requested.",
  },
  event: {
    input: {
      label: "Estimated guest count",
      helper: "Drag or type a number to see the price change.",
    },
    result: {
      freeLabel: "Free",
      freeNote: "Up to 100 guests in total on your account, over a rolling year.",
      tierLabel: "Tier",
      totalLabel: "Event price",
      depositLabel: "Deposit to reserve (30%)",
      depositNote: "The balance is due 7 days before the event.",
      customNote: "Estimated from the custom formula. The sales team confirms the exact amount.",
      perGuestNote: "Beyond 1,000 guests, custom pricing: $0.05 per guest, plus $15 setup.",
    },
    ladder: {
      heading: "Where does your event land?",
      note: "Every feature is included at every tier. Only the size changes.",
    },
    cta: {
      heading: "Ready to reserve your date?",
      text: "Lock your date with a 30% deposit. The balance is settled comfortably before the big day.",
      primary: "Reserve my date",
      secondary: "See use cases",
      quoteCta: "Get a quote",
      quoteSubjectPrefix: "Jikū quote - event of",
    },
  },
  subscription: {
    badge: "Coming soon · indicative prices",
    intro:
      "The subscription covers your appointment activity: your booking link, client reminders and daily agenda. Invitations to an event stay a per-event payment, never included by default. This offer opens soon; no one is charged before launch.",
    whatsappNote:
      "WhatsApp reminders are reserved for paid plans. Solo runs on email (300 reminders a month, free forever). Beyond a reasonable volume, a transparent add-on covers the real cost of the sending provider.",
    plans: [
      {
        id: "solo",
        name: "Solo",
        audience: "1 user",
        monthlyPerUser: 0,
        priceCaption: "free forever",
        features: [
          "Your booking link and daily agenda",
          "Email reminders: 300 per month",
          "No WhatsApp reminders",
          "No card required",
        ],
        cta: "Notify me of launch",
        mailSubject: "Jikū - interested in the Solo plan (appointments)",
      },
      {
        id: "teams",
        name: "Teams",
        audience: "Up to 5 users",
        monthlyPerUser: 100_000,
        yearlyPerUser: 90_000,
        priceCaption: "per user, per month",
        annualNote:
          "Paid yearly: 90,000 GNF per user per month, saving 120,000 GNF per user per year (about 1.3 months free).",
        features: [
          "WhatsApp and email reminders included",
          "One agenda per user",
          "Team management and permissions",
          "Priority support",
        ],
        highlight: true,
        cta: "Notify me of launch",
        mailSubject: "Jikū - interested in the Teams plan (appointments)",
      },
      {
        id: "organisation",
        name: "Organisation",
        audience: "Up to 20 users",
        monthlyPerUser: 240_000,
        yearlyPerUser: 200_000,
        priceCaption: "per user, per month",
        annualNote:
          "Paid yearly: 200,000 GNF per user per month, saving 480,000 GNF per user per year (about 2.4 months free).",
        features: [
          "WhatsApp and email reminders included",
          "Multiple agendas and traffic statistics",
          "Advanced roles and permissions",
          "Export and bookkeeping",
        ],
        cta: "Notify me of launch",
        mailSubject: "Jikū - interested in the Organisation plan (appointments)",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        audience: "Beyond 20 users or tailored needs",
        annualOnly: true,
        priceCaption: "annual billing, custom quote",
        features: [
          "Tailored deployment, on-premise available",
          "SLA and dedicated support",
          "Integrations on request",
          "Annual billing",
        ],
        cta: "Contact the sales team",
        mailSubject: "Jikū - enterprise request (annual pricing)",
      },
    ],
  },
  nav: {
    home: "Home",
    signIn: "Sign in",
    createAccount: "Create account",
    switchLocale: { label: "FR", href: "/simulator", ariaLabel: "Lire cette page en français" },
  },
};

export const SIMULATOR_CONTENT: Record<LandingLocale, SimulatorContent> = { fr, en };
