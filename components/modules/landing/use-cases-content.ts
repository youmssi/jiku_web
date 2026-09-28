// CONTRACT — every word on the dedicated use-cases page, in both locales. The
// same rules as content.ts: no invented numbers, no testimonials that did not
// happen, no claims the product cannot evidence. Six profiles, each with one
// promise and one sentence (JIKU-196); the journeys above them show the
// product at work, step by step (use-case-journeys.ts).

import type { LandingLocale } from "./content";

/** The anchors the landing page's "Who it's for" chips link to. */
export type UseCaseProfileId = "weddings" | "parties" | "corporate" | "assemblies" | "clinics" | "offices";

export interface UseCaseProfile {
  id: UseCaseProfileId;
  /** Who this is for, as a visitor names their own situation. */
  label: string;
  /** The one line that closes the sale. */
  promise: string;
  text: string;
  /** The three capabilities this profile relies on. */
  features: [string, string, string];
  cta: string;
}

export interface UseCasesPageContent {
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  eyebrow: string;
  title: string;
  intro: string;
  profiles: {
    heading: string;
    items: UseCaseProfile[];
  };
  pricing: { text: string; cta: string };
  cta: {
    heading: string;
    text: string;
    primary: string;
    secondary: string;
  };
  nav: {
    home: string;
    signIn: string;
    createAccount: string;
    switchLocale: { label: string; href: string; ariaLabel: string };
  };
}

const fr: UseCasesPageContent = {
  meta: {
    title: "Cas d'usage Jikū — Mariages, anniversaires, séminaires, cliniques, administrations",
    description:
      "Mariage, anniversaire avec carte WhatsApp, séminaire, assemblée générale, clinique ou agence : voyez, étape par étape, comment Jikū supprime l'attente, à la porte comme au guichet.",
    keywords: [
      "invitation mariage guinée",
      "carte d'invitation anniversaire whatsapp",
      "assemblée générale quorum",
      "feuille d'émargement formation",
      "billetterie séminaire conakry",
      "prise de rendez-vous clinique",
      "gestion file d'attente agence",
    ],
  },
  eyebrow: "Un outil, tous vos billets",
  title: "Fini l'attente, à la porte comme au guichet.",
  intro: "Mariage, anniversaire, séminaire, clinique ou agence : un même outil, de la première invitation au dernier client servi.",
  profiles: {
    heading: "Trouvez votre situation",
    items: [
      {
        id: "weddings",
        label: "Mariages et cérémonies familiales",
        promise: "Aucun resquilleur, aucune file à la porte",
        text: "Vos invités confirment sur WhatsApp et présentent leur billet QR : vous savez qui est arrivé, cérémonie après cérémonie, sur le même compte.",
        features: ["Invitations WhatsApp", "Billet QR hors ligne", "Arrivées en direct"],
        cta: "Créer mon événement",
      },
      {
        id: "parties",
        label: "Anniversaires, soirées et associations",
        promise: "Une carte à partager, des « oui » qui se comptent seuls",
        text: "Pas de liste d'invités : publiez la carte dans vos groupes. Chacun répond en un geste ; vous fixez les accompagnants et la date limite.",
        features: ["Carte à partager", "Réponse sur WhatsApp", "Places limitées"],
        cta: "Créer ma carte",
      },
      {
        id: "corporate",
        label: "Séminaires, galas et lancements",
        promise: "Une entrée à la hauteur de votre image",
        text: "Votre logo et vos couleurs, des catégories VIP, presse ou standard, des billets payants, et plusieurs portes qui comptent ensemble.",
        features: ["Marque blanche", "Billets payants", "Plusieurs contrôleurs"],
        cta: "Créer mon événement",
      },
      {
        id: "assemblies",
        label: "Assemblées générales et formations",
        promise: "Des preuves de présence, pas des promesses",
        text: "Le quorum se compte en direct ; la feuille d'émargement et les attestations nominatives sont prêtes à la sortie.",
        features: ["Quorum en direct", "Émargement horodaté", "Attestations"],
        cta: "Créer mon événement",
      },
      {
        id: "clinics",
        label: "Cliniques, cabinets et salons",
        promise: "Des clients qui savent quand venir",
        text: "Un lien de réservation sur vos réseaux, un rappel avant chaque rendez-vous, et une file du jour qui appelle chacun dans l'ordre.",
        features: ["Lien de réservation", "Rappels WhatsApp ou SMS", "File du jour"],
        cta: "Ouvrir mes rendez-vous",
      },
      {
        id: "offices",
        label: "Agences et administrations",
        promise: "Une file qui avance, sans borne coûteuse",
        text: "Rendez-vous et sans-rendez-vous dans une seule file ; chacun est appelé sur son téléphone avec son numéro de guichet.",
        features: ["Tickets d'attente", "Appel au guichet", "Suivi de l'attente"],
        cta: "Ouvrir ma file",
      },
    ],
  },
  pricing: {
    text: "Gratuit jusqu'à 100 invités par an pour vos événements, et gratuit pour toujours pour une personne qui reçoit des clients.",
    cta: "Trouver ma formule",
  },
  cta: {
    heading: "Vos invités et vos clients méritent de ne plus attendre.",
    text: "Créez votre compte, partagez votre première carte ou votre lien de réservation : en cinq minutes, vous saurez si Jikū est fait pour vous.",
    primary: "Créer mon compte gratuit",
    secondary: "Simuler mon prix",
  },
  nav: {
    home: "Accueil",
    signIn: "Se connecter",
    createAccount: "Créer un compte",
    switchLocale: { label: "EN", href: "/en/use-cases", ariaLabel: "Read this page in English" },
  },
};

const en: UseCasesPageContent = {
  meta: {
    title: "Jikū use cases — Weddings, birthdays, seminars, clinics, public offices",
    description:
      "Wedding, birthday with a WhatsApp card, seminar, general assembly, clinic or agency: see, step by step, how Jikū removes the wait, at the door and at the counter.",
    keywords: [
      "wedding invitations guinea",
      "whatsapp birthday invitation card",
      "general assembly quorum",
      "training attendance register",
      "seminar ticketing conakry",
      "clinic appointment booking",
      "agency queue management",
    ],
  },
  eyebrow: "One tool, every ticket",
  title: "No more waiting, at the door or at the counter.",
  intro: "Wedding, birthday, seminar, clinic or agency: one tool, from the first invitation to the last client served.",
  profiles: {
    heading: "Find your situation",
    items: [
      {
        id: "weddings",
        label: "Weddings and family ceremonies",
        promise: "No gatecrashers, no line at the door",
        text: "Guests confirm on WhatsApp and show their QR ticket: you know who has arrived, ceremony after ceremony, on the same account.",
        features: ["WhatsApp invitations", "Offline QR ticket", "Live arrivals"],
        cta: "Create my event",
      },
      {
        id: "parties",
        label: "Birthdays, parties and associations",
        promise: "A card to share, yeses that count themselves",
        text: "No guest list: post the card in your groups. Everyone answers in one tap; you set the companions and the deadline.",
        features: ["Shareable card", "Answers on WhatsApp", "Limited places"],
        cta: "Create my card",
      },
      {
        id: "corporate",
        label: "Seminars, galas and launches",
        promise: "An entrance worthy of your image",
        text: "Your logo and colors, VIP, press or standard categories, paid tickets, and several doors that count together.",
        features: ["White label", "Paid tickets", "Several door staff"],
        cta: "Create my event",
      },
      {
        id: "assemblies",
        label: "General assemblies and training",
        promise: "Proof of attendance, not promises",
        text: "Quorum is counted live; the sign-in sheet and named attendance certificates are ready as people leave.",
        features: ["Live quorum", "Timestamped sign-in", "Certificates"],
        cta: "Create my event",
      },
      {
        id: "clinics",
        label: "Clinics, practices and salons",
        promise: "Clients who know when to come",
        text: "A booking link on your social pages, a reminder before every appointment, and a day line that calls each person in order.",
        features: ["Booking link", "WhatsApp or SMS reminders", "Day line"],
        cta: "Open my bookings",
      },
      {
        id: "offices",
        label: "Agencies and public offices",
        promise: "A line that moves, without a costly kiosk",
        text: "Appointments and walk-ins in one line; each person is called on their phone with their counter number.",
        features: ["Waiting tickets", "Counter calls", "Wait tracking"],
        cta: "Open my line",
      },
    ],
  },
  pricing: {
    text: "Free for up to 100 guests a year for your events, and free forever for one person who receives clients.",
    cta: "Find my plan",
  },
  cta: {
    heading: "Your guests and clients deserve to stop waiting.",
    text: "Create your account, share your first card or your booking link: within five minutes, you'll know whether Jikū is for you.",
    primary: "Create my free account",
    secondary: "Estimate my price",
  },
  nav: {
    home: "Home",
    signIn: "Sign in",
    createAccount: "Create account",
    switchLocale: { label: "FR", href: "/use-cases", ariaLabel: "Lire cette page en français" },
  },
};

export const USE_CASES_CONTENT: Record<LandingLocale, UseCasesPageContent> = { fr, en };
