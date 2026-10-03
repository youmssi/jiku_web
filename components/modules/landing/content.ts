// Landing copy, FR (default, `/`) and EN (`/en`). Long-form marketing copy lives
// here, typed, rather than in the app's message catalogs: the structure (lists,
// sections) is part of the content. Every claim describes what the product does
// today; what is on its way carries `soon: true` and shows a "Bientôt" badge.
// Amounts are not written here: pricing captions carry `{price}` and the FAQ's
// pricing answers are written by `pricingAnswers`, both from `lib/pricing.ts`,
// the same figures the simulator uses (JIKU-195, JIKU-197).

import type { CardStyle } from "@/lib/card-style";
import { pricingAnswers } from "./price-anchor";
import type { UseCaseProfileId } from "./use-cases-content";

export type LandingLocale = "fr" | "en";

export interface LandingFeature {
  title: string;
  description: string;
  soon?: boolean;
}

/** Which published price a pricing caption quotes in place of `{price}`. */
export type LandingPriceAnchor = "firstEventTier" | "teams" | null;

export interface LandingPricingPlan {
  name: string;
  price: string;
  /** One line under the price; `{price}` is replaced by the [anchor] price. */
  caption: string;
  anchor: LandingPriceAnchor;
  cta: string;
  href: string;
  highlighted?: boolean;
}

/** An example card, drawn with the product's own styles. Names and dates are examples. */
export interface LandingCardSample {
  style: CardStyle;
  event: string;
  organizer: string;
  when: string;
  color: string;
  photo: boolean;
}

export interface LandingFaqItem {
  question: string;
  answer: string;
  /** Shown on the landing page; every item shows on `/faq`. */
  featured?: boolean;
}

export interface LandingContent {
  htmlLang: string;
  meta: { title: string; description: string; keywords: string[] };
  nav: {
    links: { label: string; href: string }[];
    signIn: string;
    register: string;
    switchLocale: { label: string; href: string; ariaLabel: string };
    menuOpen: string;
    menuClose: string;
  };
  soonLabel: string;
  hero: {
    badge: string;
    headline: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    ctaNote: string;
    uses: { events: string; services: string };
    /** The card and the ticket drawn next to the promise. */
    card: {
      invites: string;
      answers: [string, string, string];
      ticket: { guest: string; status: string };
      alt: string;
    };
  };
  replace: {
    badge: string;
    heading: string;
    subheading: string;
    rows: { before: string; after: string }[];
    beforeLabel: string;
    afterLabel: string;
  };
  cards: {
    badge: string;
    heading: string;
    subheading: string;
    styles: Record<CardStyle, string>;
    samples: LandingCardSample[];
    steps: { title: string; description: string }[];
    cta: string;
  };
  events: {
    badge: string;
    heading: string;
    subheading: string;
    items: LandingFeature[];
    visual: { event: string; date: string; guest: string; category: string; status: string; scanned: string };
  };
  services: {
    badge: string;
    heading: string;
    subheading: string;
    items: LandingFeature[];
    visual: { title: string; serving: string; next: string; waiting: string; counter: string; notice: string };
  };
  trust: {
    badge: string;
    heading: string;
    items: { title: string; text: string }[];
    methods: string[];
  };
  useCases: { badge: string; heading: string; more: string; cases: { label: string; anchor: UseCaseProfileId }[] };
  pricing: {
    badge: string;
    heading: string;
    subheading: string;
    plans: LandingPricingPlan[];
    enterprise: { text: string; cta: string; mailSubject: string };
    note: string;
  };
  faq: {
    badge: string;
    heading: string;
    subheading: string;
    more: string;
    items: LandingFaqItem[];
    /** The dedicated `/faq` page, which lists every item. */
    page: { title: string; description: string; heading: string; intro: string; home: string; breadcrumb: string };
  };
  cta: { heading: string; text: string; primaryCta: string; secondaryCta: string };
  /** The bar that keeps the main action in reach on a phone once the hero is gone. */
  stickyCta: string;
  footer: {
    description: string;
    groups: { title: string; links: { label: string; href: string }[] }[];
    copyright: string;
    tagline: string;
    privacy: string;
  };
}

const FR_PRICES = pricingAnswers("fr");
const EN_PRICES = pricingAnswers("en");

const fr: LandingContent = {
  htmlLang: "fr",
  meta: {
    title: "Jikū : invitations WhatsApp, billets QR et file d'attente",
    description:
      "Invitations et cartes WhatsApp, billets QR contrôlés même sans réseau, rendez-vous et file du jour pour vos services. Gratuit jusqu'à 100 invités.",
    keywords: [
      "carte d'invitation WhatsApp",
      "invitation anniversaire",
      "invitation mariage",
      "billet QR code",
      "check-in hors ligne",
      "prise de rendez-vous",
      "gestion de file d'attente",
      "rappel SMS",
      "plateforme événementielle Afrique",
      "marque blanche",
    ],
  },
  nav: {
    links: [
      { label: "Événements", href: "#events" },
      { label: "Services", href: "#services" },
      { label: "Tarifs", href: "#pricing" },
      { label: "Cas d'usage", href: "/use-cases" },
    ],
    signIn: "Se connecter",
    register: "Créer un compte",
    switchLocale: { label: "EN", href: "/en", ariaLabel: "Read this page in English" },
    menuOpen: "Ouvrir le menu",
    menuClose: "Fermer le menu",
  },
  soonLabel: "Bientôt",
  hero: {
    badge: "Nouveau : la carte d'invitation à partager",
    headline: "Vos invités et vos clients passent sans attendre.",
    subtitle:
      "Invitations, billets QR et entrée pour vos événements. Rendez-vous et file du jour pour vos services. Sur WhatsApp, sans application, même quand le réseau tombe.",
    primaryCta: "Créer mon compte gratuit",
    secondaryCta: "Trouver ma formule",
    ctaNote: "Gratuit jusqu'à 100 invités, sans carte bancaire",
    uses: { events: "J'organise un événement", services: "Je reçois des clients" },
    card: {
      invites: "vous invite",
      answers: ["Je viens", "Peut-être", "Non"],
      ticket: { guest: "Mariama Bah + 1", status: "Billet valide" },
      alt: "Une carte d'invitation Jikū au style Moderne, et le billet QR d'un invité qui a répondu oui.",
    },
  },
  replace: {
    badge: "Ce que vous remplacez",
    heading: "Fini le groupe WhatsApp, le fichier Excel et la liste papier",
    subheading: "Ce que vous bricolez aujourd'hui, dans un seul outil qui tient le jour J.",
    beforeLabel: "Aujourd'hui",
    afterLabel: "Avec Jikū",
    rows: [
      { before: "Des invitations copiées-collées une à une sur WhatsApp", after: "Une invitation personnelle, ou une carte à partager dans vos groupes" },
      { before: "Un tableur à jour chez une seule personne", after: "Les réponses en direct, pour toute l'équipe" },
      { before: "Une liste papier et des billets photocopiés à la porte", after: "Un billet QR, scanné même sans réseau" },
      { before: "Une salle d'attente pleine et des clients qui s'impatientent", after: "Une file du jour qui appelle chacun sur son téléphone" },
    ],
  },
  cards: {
    badge: "Nouveau · Carte d'invitation",
    heading: "Partagez une carte, recevez des « oui »",
    subheading:
      "Pas de liste d'invités ? Publiez une carte dans vos groupes WhatsApp. Chacun répond en un geste, et chaque « oui » reçoit son billet.",
    styles: { ELEGANT: "Élégant", MODERN: "Moderne", FESTIVE: "Festif" },
    samples: [
      { style: "ELEGANT", event: "Mariage d'Aïcha & Karim", organizer: "Famille Barry", when: "sam. 12 déc. · 16 h", color: "#5B3A29", photo: false },
      { style: "MODERN", event: "Les 30 ans d'Aïssatou", organizer: "Maison Diallo", when: "sam. 14 nov. · 19 h", color: "#7C2D12", photo: true },
      { style: "FESTIVE", event: "Soirée de fin d'année", organizer: "Association Horizon", when: "ven. 18 déc. · 20 h", color: "#9D174D", photo: false },
    ],
    steps: [
      { title: "Choisissez un style", description: "Élégant, Moderne ou Festif, avec votre photo ou votre couleur." },
      { title: "Partagez-la", description: "Dans vos groupes et vos statuts WhatsApp, ou par son lien et son QR code." },
      { title: "Comptez les « oui »", description: "On répond sur WhatsApp ou sur la page de la carte. Chaque « oui » reçoit son billet QR." },
    ],
    cta: "Créer ma carte",
  },
  events: {
    badge: "Événements",
    heading: "De l'invitation à la dernière entrée",
    subheading: "Mariage, séminaire, gala ou assemblée générale.",
    items: [
      {
        title: "Invitations e-mail et WhatsApp",
        description: "Chaque invité reçoit son lien personnel, à vos couleurs, et répond en un geste. Vous voyez qui vient, en direct.",
      },
      {
        title: "Billet QR, contrôlé même sans réseau",
        description: "Un billet signé qui ne passe qu'une fois. La liste est déjà sur le téléphone du contrôleur.",
      },
      {
        title: "Catégories et billets payants",
        description: "VIP, presse, standard : chacune son prix et sa jauge. L'acheteur vous paie directement.",
      },
      {
        title: "Quorum et preuves de présence",
        description: "Quorum compté en direct, feuille d'émargement et attestations nominatives.",
      },
    ],
    visual: {
      event: "Gala de l'Espoir",
      date: "Samedi 12 décembre · 19:00",
      guest: "Awa Diallo",
      category: "VIP",
      status: "Payé",
      scanned: "Entrée validée à 19:04",
    },
  },
  services: {
    badge: "Services",
    heading: "Des rendez-vous et une file du jour qui avancent seuls",
    subheading: "Clinique, salon, agence ou administration.",
    items: [
      {
        title: "Un lien de réservation à partager",
        description: "Un lien et un QR code : vos clients choisissent un créneau libre, sans compte ni appel.",
      },
      {
        title: "Rappels WhatsApp ou SMS",
        description: "Un rappel avant chaque rendez-vous ; le SMS prend le relais si WhatsApp échoue.",
      },
      {
        title: "« C'est votre tour, guichet 4 »",
        description: "Rendez-vous et sans-rendez-vous dans une seule file. Le client appelé est prévenu sur son téléphone.",
      },
      {
        title: "Le client prend son ticket lui-même",
        description: "Il scanne le QR code de l'entrée et suit sa place en direct.",
      },
    ],
    visual: {
      title: "File du jour · Consultations",
      serving: "En consultation",
      next: "Suivant",
      waiting: "en attente",
      counter: "Salle 2",
      notice: "« C'est votre tour, salle 2 » envoyé sur WhatsApp",
    },
  },
  trust: {
    badge: "Confiance",
    heading: "Votre équipe, votre argent, votre marque",
    items: [
      {
        title: "Un lien par membre de l'équipe",
        text: "Portier, réceptionniste ou caissier ouvre sa console depuis son téléphone, sans compte. Vous le révoquez en un clic.",
      },
      {
        title: "L'argent de vos clients ne passe jamais par nous",
        text: "Ils vous paient sur vos numéros, votre lien ou en espèces. Vous notez « payé » en un geste.",
      },
      {
        title: "À vos couleurs, et vérifié",
        text: "Votre logo et vos couleurs sur chaque invitation, billet et page, et un badge « Organisation vérifiée » après vérification par notre équipe.",
      },
    ],
    methods: ["Orange Money", "MTN MoMo", "Wave", "Espèces"],
  },
  useCases: {
    badge: "Pour qui",
    heading: "Du mariage à la clinique de quartier",
    more: "Voir les cas d'usage",
    cases: [
      { label: "Mariages et baptêmes", anchor: "weddings" },
      { label: "Anniversaires et soirées", anchor: "parties" },
      { label: "Séminaires et galas", anchor: "corporate" },
      { label: "Assemblées générales", anchor: "assemblies" },
      { label: "Cliniques et cabinets", anchor: "clinics" },
      { label: "Salons et ateliers", anchor: "clinics" },
      { label: "Agences et administrations", anchor: "offices" },
    ],
  },
  pricing: {
    badge: "Tarifs",
    heading: "Des prix simples, affichés",
    subheading: "Toutes les fonctionnalités sont incluses. Vous ne payez que ce que vous utilisez.",
    plans: [
      {
        name: "Événements",
        price: "Gratuit",
        caption: "jusqu'à 100 invités par an, puis dès {price} par événement",
        anchor: "firstEventTier",
        cta: "Estimer mon événement",
        href: "/simulator",
        highlighted: true,
      },
      {
        name: "Services",
        price: "Solo gratuit",
        caption: "pour une personne, pour toujours ; en équipe dès {price} par mois",
        anchor: "teams",
        cta: "Voir les offres",
        href: "/simulator",
      },
      {
        name: "Vente de billets",
        price: "3 %",
        caption: "par billet vendu, rien si rien n'est vendu ; 50 premiers billets offerts",
        anchor: null,
        cta: "Estimer ma commission",
        href: "/simulator",
      },
    ],
    enterprise: {
      text: "Grande organisation ou gros volumes ?",
      cta: "Parlons-en",
      mailSubject: "Jikū - offre Entreprise",
    },
    note: "En francs guinéens, en francs CFA ou en dollars, taxes comprises. Le simulateur donne le montant exact.",
  },
  faq: {
    badge: "Questions fréquentes",
    heading: "Vous vous demandez sûrement…",
    subheading: "Les réponses aux questions qu'on nous pose le plus.",
    more: "Toutes les questions",
    page: {
      title: "FAQ : invitations, billets et rendez-vous",
      description:
        "Faut-il une application ? Le contrôle marche-t-il hors ligne ? Combien ça coûte ? Les réponses aux questions les plus posées sur Jikū.",
      heading: "Questions fréquentes sur Jikū",
      intro:
        "Jikū gère tout ce qui passe par un billet : les invitations et les cartes à partager, les billets QR et l'entrée de vos événements, les rendez-vous et la file du jour de vos services, sans application à installer. Voici les réponses aux questions qu'on nous pose le plus.",
      home: "Accueil",
      breadcrumb: "Fil d'Ariane",
    },
    items: [
      { featured: true, question: "Mes invités ou mes clients doivent-ils installer une application ?", answer: "Non. Tout passe par un simple lien ouvert dans le navigateur de leur téléphone : invitation, carte, billet, réservation ou ticket d'attente." },
      { featured: true, question: "Le check-in fonctionne-t-il sans internet ?", answer: "Oui. La liste se synchronise à l'avance sur le téléphone du contrôleur ; les scans hors ligne se synchronisent au retour du réseau, et un billet ne passe jamais deux fois." },
      { featured: true, question: "Qui peut répondre à une carte partagée ?", answer: "Toute personne qui a son lien ou son QR code, sur WhatsApp ou sur la page de la carte. Vous fixez le nombre d'accompagnants et une date limite ; quand il n'y a plus de place, la carte n'accepte plus de « oui ». Vous pouvez retirer quelqu'un à tout moment : ses places sont libérées." },
      { featured: true, question: "Jikū encaisse-t-il l'argent de mes clients ?", answer: "Non, jamais. Vos clients vous paient directement, sur vos numéros Mobile Money ou votre propre lien de paiement. Jikū ne facture que son propre service." },
      { featured: true, question: "Mes messages partent-ils vraiment sur WhatsApp ?", answer: "Oui, via l'API officielle WhatsApp Business, un message individuel par personne. Pour les rappels de rendez-vous, le SMS prend le relais si WhatsApp échoue." },
      { featured: true, question: "Que deviennent les données personnelles ?", answer: "Chaque invité peut demander la suppression de ses données depuis son lien. Après la période de conservation, les données sont anonymisées automatiquement." },
      { question: "Puis-je mettre ma propre photo sur la carte ?", answer: "Oui. Choisissez un style, Élégant, Moderne ou Festif, et ajoutez une photo de bandeau. La carte, l'aperçu du lien, la page de réponse et le billet suivent ce choix." },
      { question: "Combien coûte un événement ?", answer: FR_PRICES.events },
      { question: "Et la prise de rendez-vous ?", answer: FR_PRICES.services },
      { question: "Et si je vends mes billets ?", answer: FR_PRICES.sales },
      { question: "Comment mon équipe accède-t-elle à Jikū ?", answer: "Chaque membre reçoit un lien personnel qui n'ouvre que ce que vous lui confiez. Pas de compte, pas d'application, et vous le révoquez à tout moment." },
      { question: "Puis-je utiliser mes couleurs et mon logo ?", answer: "Oui. Invitations, billets, pages de réservation et consoles portent votre marque ; Jikū reste en coulisses." },
    ],
  },
  cta: {
    heading: "Votre prochain événement, votre prochain client : sans attente.",
    text: "Créez votre compte, partagez votre première carte ou votre lien de réservation : en cinq minutes, vous saurez si Jikū est fait pour vous.",
    primaryCta: "Créer mon compte gratuit",
    secondaryCta: "Se connecter",
  },
  stickyCta: "Créer mon compte gratuit",
  footer: {
    description: "Invitations, billets, rendez-vous et file d'attente en marque blanche, pensés pour l'Afrique francophone.",
    groups: [
      {
        title: "Produit",
        links: [
          { label: "Carte d'invitation", href: "/#cards" },
          { label: "Événements", href: "/#events" },
          { label: "Services", href: "/#services" },
          { label: "Tarifs", href: "/#pricing" },
          { label: "Cas d'usage", href: "/use-cases" },
          { label: "Simulateur", href: "/simulator" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        title: "Ressources",
        links: [
          { label: "Carte d'invitation d'anniversaire", href: "/birthday-invitation-card" },
          { label: "Textes d'invitation d'anniversaire", href: "/birthday-invitation-texts" },
        ],
      },
      {
        title: "Application",
        links: [
          { label: "Se connecter", href: "/login" },
          { label: "Créer un compte", href: "/register" },
        ],
      },
      {
        title: "Légal",
        links: [
          { label: "Mentions légales", href: "/legal" },
          { label: "Conditions d'utilisation et de vente", href: "/terms" },
          { label: "Politique de confidentialité", href: "/privacy" },
        ],
      },
    ],
    copyright: "Tous droits réservés.",
    tagline: "Pensé pour l'Afrique francophone",
    privacy: "Confidentialité",
  },
};

const en: LandingContent = {
  htmlLang: "en",
  meta: {
    title: "Jikū: WhatsApp invitations, QR tickets and queues",
    description:
      "WhatsApp invitations and cards, QR tickets checked even offline, bookings and the day line for your services. Free for up to 100 guests.",
    keywords: [
      "WhatsApp invitation card",
      "birthday invitation",
      "wedding invitation",
      "QR code tickets",
      "offline check-in",
      "appointment booking",
      "queue management",
      "SMS reminders",
      "event platform Africa",
      "white label",
    ],
  },
  nav: {
    links: [
      { label: "Events", href: "#events" },
      { label: "Services", href: "#services" },
      { label: "Pricing", href: "#pricing" },
      { label: "Use cases", href: "/use-cases" },
    ],
    signIn: "Sign in",
    register: "Create an account",
    switchLocale: { label: "FR", href: "/", ariaLabel: "Lire cette page en français" },
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },
  soonLabel: "Soon",
  hero: {
    badge: "New: the invitation card to share",
    headline: "Your guests and clients get in without waiting.",
    subtitle:
      "Invitations, QR tickets and entry for your events. Bookings and the day line for your services. On WhatsApp, no app to install, even when the network drops.",
    primaryCta: "Create my free account",
    secondaryCta: "Find my plan",
    ctaNote: "Free for up to 100 guests, no card required",
    uses: { events: "I'm organizing an event", services: "I receive clients" },
    card: {
      invites: "invites you",
      answers: ["I'm coming", "Maybe", "No"],
      ticket: { guest: "Mariama Bah + 1", status: "Valid ticket" },
      alt: "A Jikū invitation card in the Modern style, and the QR ticket of a guest who said yes.",
    },
  },
  replace: {
    badge: "What you replace",
    heading: "No more WhatsApp group, Excel file and paper list",
    subheading: "What you patch together today, in one tool that holds up on the day.",
    beforeLabel: "Today",
    afterLabel: "With Jikū",
    rows: [
      { before: "Invitations copy-pasted one by one on WhatsApp", after: "A personal invitation, or a card to share in your groups" },
      { before: "A spreadsheet only one person keeps up to date", after: "Answers live, for the whole team" },
      { before: "A paper list and photocopied tickets at the door", after: "A QR ticket, scanned even offline" },
      { before: "A full waiting room and impatient clients", after: "A day line that calls each client on their phone" },
    ],
  },
  cards: {
    badge: "New · Invitation card",
    heading: "Share a card, collect the yeses",
    subheading:
      "No guest list? Post a card in your WhatsApp groups. Everyone answers in one tap, and every yes gets a ticket.",
    styles: { ELEGANT: "Elegant", MODERN: "Modern", FESTIVE: "Festive" },
    samples: [
      { style: "ELEGANT", event: "Aïcha & Karim's wedding", organizer: "The Barry family", when: "Sat, Dec 12 · 4 PM", color: "#5B3A29", photo: false },
      { style: "MODERN", event: "Aïssatou turns 30", organizer: "Maison Diallo", when: "Sat, Nov 14 · 7 PM", color: "#7C2D12", photo: true },
      { style: "FESTIVE", event: "Year-end party", organizer: "Horizon Association", when: "Fri, Dec 18 · 8 PM", color: "#9D174D", photo: false },
    ],
    steps: [
      { title: "Pick a style", description: "Elegant, Modern or Festive, with your photo or your color." },
      { title: "Share it", description: "In your WhatsApp groups and statuses, or through its link and QR code." },
      { title: "Count the yeses", description: "People answer on WhatsApp or on the card's page. Every yes gets a QR ticket." },
    ],
    cta: "Create my card",
  },
  events: {
    badge: "Events",
    heading: "From the invitation to the last entry",
    subheading: "Wedding, seminar, gala or general assembly.",
    items: [
      {
        title: "Email and WhatsApp invitations",
        description: "Every guest gets a personal link, in your colors, and answers in one tap. You see who's coming, live.",
      },
      {
        title: "QR ticket, checked even offline",
        description: "A signed ticket that only gets in once. The list is already on the door staff's phone.",
      },
      {
        title: "Categories and paid tickets",
        description: "VIP, press, standard: each has its price and capacity. Buyers pay you directly.",
      },
      {
        title: "Quorum and attendance proof",
        description: "Live quorum count, a sign-in sheet and named attendance certificates.",
      },
    ],
    visual: {
      event: "Hope Gala",
      date: "Saturday 12 December · 7:00 pm",
      guest: "Awa Diallo",
      category: "VIP",
      status: "Paid",
      scanned: "Entry confirmed at 7:04 pm",
    },
  },
  services: {
    badge: "Services",
    heading: "Appointments and a day line that run themselves",
    subheading: "Clinic, salon, agency or public office.",
    items: [
      {
        title: "A booking link to share",
        description: "A link and a QR code: clients pick a free slot, no account and no phone call.",
      },
      {
        title: "WhatsApp or SMS reminders",
        description: "A reminder before every appointment; SMS takes over when WhatsApp fails.",
      },
      {
        title: "\"It's your turn, counter 4\"",
        description: "Appointments and walk-ins in one line. The client called is told on their phone.",
      },
      {
        title: "Clients take their own ticket",
        description: "They scan the QR code at the entrance and follow their place live.",
      },
    ],
    visual: {
      title: "Today's line · Consultations",
      serving: "In consultation",
      next: "Next",
      waiting: "waiting",
      counter: "Room 2",
      notice: "\"It's your turn, room 2\" sent on WhatsApp",
    },
  },
  trust: {
    badge: "Trust",
    heading: "Your team, your money, your brand",
    items: [
      {
        title: "One link per team member",
        text: "Door staff, receptionist or cashier opens their console on their phone, no account. You revoke it in one click.",
      },
      {
        title: "Your clients' money never goes through us",
        text: "They pay you on your numbers, your link or in cash. You mark \"paid\" in one tap.",
      },
      {
        title: "In your colors, and verified",
        text: "Your logo and colors on every invitation, ticket and page, and a \"Verified organization\" badge once our team has checked you.",
      },
    ],
    methods: ["Orange Money", "MTN MoMo", "Wave", "Cash"],
  },
  useCases: {
    badge: "Who it's for",
    heading: "From a wedding to the neighborhood clinic",
    more: "See the use cases",
    cases: [
      { label: "Weddings and christenings", anchor: "weddings" },
      { label: "Birthdays and parties", anchor: "parties" },
      { label: "Seminars and galas", anchor: "corporate" },
      { label: "General assemblies", anchor: "assemblies" },
      { label: "Clinics and practices", anchor: "clinics" },
      { label: "Salons and studios", anchor: "clinics" },
      { label: "Agencies and public offices", anchor: "offices" },
    ],
  },
  pricing: {
    badge: "Pricing",
    heading: "Simple prices, in plain sight",
    subheading: "Every feature is included. You only pay for what you use.",
    plans: [
      {
        name: "Events",
        price: "Free",
        caption: "up to 100 guests a year, then from {price} per event",
        anchor: "firstEventTier",
        cta: "Estimate my event",
        href: "/simulator",
        highlighted: true,
      },
      {
        name: "Services",
        price: "Solo free",
        caption: "for one person, forever; for a team from {price} a month",
        anchor: "teams",
        cta: "See the plans",
        href: "/simulator",
      },
      {
        name: "Ticket sales",
        price: "3%",
        caption: "per ticket sold, nothing if nothing sells; first 50 tickets free",
        anchor: null,
        cta: "Estimate my commission",
        href: "/simulator",
      },
    ],
    enterprise: {
      text: "A large organization or high volumes?",
      cta: "Let's talk",
      mailSubject: "Jikū - Enterprise offer",
    },
    note: "In Guinean francs, CFA francs or dollars, taxes included. The simulator gives the exact amount.",
  },
  faq: {
    badge: "Frequently asked",
    heading: "You're probably wondering…",
    subheading: "Answers to the questions we hear most.",
    more: "All questions",
    page: {
      title: "FAQ: invitations, tickets and appointments",
      description:
        "Do people need an app? Does check-in work offline? How much does it cost? Answers to the questions we hear most about Jikū.",
      heading: "Frequently asked questions about Jikū",
      intro:
        "Jikū runs everything that goes through a ticket: invitations and cards to share, QR tickets and entry for your events, bookings and the day line for your services, with no app to install. Here are the answers to the questions we hear most.",
      home: "Home",
      breadcrumb: "Breadcrumb",
    },
    items: [
      { featured: true, question: "Do my guests or clients need to install an app?", answer: "No. Everything goes through a simple link opened in their phone's browser: invitation, card, ticket, booking or waiting ticket." },
      { featured: true, question: "Does check-in work without internet?", answer: "Yes. The list syncs to the door staff's phone ahead of time; offline scans sync when the network returns, and a ticket never gets in twice." },
      { featured: true, question: "Who can answer a shared card?", answer: "Anyone with its link or QR code, on WhatsApp or on the card's page. You set how many companions each person may bring and a deadline; once the places are gone, the card takes no more yeses. You can remove someone at any time: their places come back." },
      { featured: true, question: "Does Jikū collect my clients' money?", answer: "No, never. Your clients pay you directly, on your Mobile Money numbers or your own payment link. Jikū only charges for its own service." },
      { featured: true, question: "Do my messages really go out on WhatsApp?", answer: "Yes, through the official WhatsApp Business API, one individual message per person. For appointment reminders, SMS takes over when WhatsApp fails." },
      { featured: true, question: "What happens to personal data?", answer: "Every guest can request the deletion of their data from their link. After the retention period, data is anonymized automatically." },
      { question: "Can I put my own photo on the card?", answer: "Yes. Pick a style, Elegant, Modern or Festive, and add a banner photo. The card, the link preview, the answer page and the ticket all follow that choice." },
      { question: "How much does an event cost?", answer: EN_PRICES.events },
      { question: "What about appointments?", answer: EN_PRICES.services },
      { question: "And if I sell my tickets?", answer: EN_PRICES.sales },
      { question: "How does my team access Jikū?", answer: "Each member gets a personal link that only opens what you entrust to them. No account, no app, and you can revoke it at any time." },
      { question: "Can I use my own colors and logo?", answer: "Yes. Invitations, tickets, booking pages and consoles carry your brand; Jikū stays behind the scenes." },
    ],
  },
  cta: {
    heading: "Your next event, your next client: no waiting.",
    text: "Create your account, share your first card or your booking link: within five minutes, you'll know whether Jikū is for you.",
    primaryCta: "Create my free account",
    secondaryCta: "Sign in",
  },
  stickyCta: "Create my free account",
  footer: {
    description: "White-label invitations, tickets, appointments and queues, built for French-speaking Africa.",
    groups: [
      {
        title: "Product",
        links: [
          { label: "Invitation card", href: "/#cards" },
          { label: "Events", href: "/#events" },
          { label: "Services", href: "/#services" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Use cases", href: "/use-cases" },
          { label: "Simulator", href: "/simulator" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Birthday invitation card", href: "/birthday-invitation-card" },
          { label: "Birthday invitation texts", href: "/birthday-invitation-texts" },
        ],
      },
      {
        title: "App",
        links: [
          { label: "Sign in", href: "/login" },
          { label: "Create an account", href: "/register" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Legal notice", href: "/legal" },
          { label: "Terms of use and sale", href: "/terms" },
          { label: "Privacy policy", href: "/privacy" },
        ],
      },
    ],
    copyright: "All rights reserved.",
    tagline: "Built for French-speaking Africa",
    privacy: "Privacy",
  },
};

export const LANDING_CONTENT: Record<LandingLocale, LandingContent> = { fr, en };
