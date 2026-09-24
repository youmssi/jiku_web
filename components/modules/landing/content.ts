// Landing copy, FR (default, `/`) and EN (`/en`). Long-form marketing copy lives
// here, typed, rather than in the app's message catalogs: the structure (lists,
// sections) is part of the content. Every claim describes what the product does
// today; what is on its way carries `soon: true` and shows a "Bientôt" badge.

export type LandingLocale = "fr" | "en";

export interface LandingFeature {
  title: string;
  description: string;
  soon?: boolean;
}

export interface LandingPoint {
  text: string;
  soon?: boolean;
}

export interface LandingProof {
  /** The number to count up to; rendered as is when motion is off. */
  value: number;
  suffix?: string;
  label: string;
}

export interface LandingPricingPlan {
  name: string;
  price: string;
  caption: string;
  points: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
  soon?: boolean;
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
    headlinePrefix: string;
    headlineWords: string[];
    headlineSuffix: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    ctaNote: string;
    uses: { events: string; services: string };
  };
  proof: LandingProof[];
  events: { badge: string; heading: string; subheading: string; items: LandingFeature[] };
  services: { badge: string; heading: string; subheading: string; items: LandingFeature[] };
  operators: { badge: string; heading: string; text: string; points: LandingPoint[] };
  payments: { badge: string; heading: string; text: string; points: LandingPoint[] };
  howItWorks: { badge: string; heading: string; subheading: string; steps: { title: string; description: string }[] };
  useCases: { badge: string; heading: string; subheading: string; more: string; cases: { title: string; description: string }[] };
  pricing: {
    badge: string;
    heading: string;
    subheading: string;
    plans: LandingPricingPlan[];
    enterprise: { title: string; text: string; cta: string; mailSubject: string };
    note: string;
  };
  faq: { badge: string; heading: string; subheading: string; items: { question: string; answer: string }[] };
  cta: { heading: string; text: string; primaryCta: string; secondaryCta: string };
  footer: {
    description: string;
    groups: { title: string; links: { label: string; href: string }[] }[];
    copyright: string;
    tagline: string;
    privacy: string;
  };
}

const fr: LandingContent = {
  htmlLang: "fr",
  meta: {
    title: "Jikū : billets, invitations, rendez-vous et file d'attente, à vos couleurs",
    description:
      "Une seule plateforme pour tout ce qui passe par un billet : invitations et check-in de vos événements, prise de rendez-vous et file du jour de vos services. Gratuit jusqu'à 100 invités.",
    keywords: [
      "invitation événement",
      "billet QR code",
      "check-in hors ligne",
      "prise de rendez-vous",
      "gestion de file d'attente",
      "ticket d'attente",
      "invitation WhatsApp",
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
      { label: "Simulateur", href: "/simulator" },
      { label: "FAQ", href: "#faq" },
    ],
    signIn: "Se connecter",
    register: "Créer un compte",
    switchLocale: { label: "EN", href: "/en", ariaLabel: "Read this page in English" },
    menuOpen: "Ouvrir le menu",
    menuClose: "Fermer le menu",
  },
  soonLabel: "Bientôt",
  hero: {
    badge: "Événements et services, à vos couleurs",
    headlinePrefix: "Vos",
    headlineWords: ["invités", "clients", "patients", "participants"],
    headlineSuffix: "passent sans attendre.",
    subtitle:
      "Jikū gère tout ce qui passe par un billet : les invitations et l'entrée de vos événements, les rendez-vous et la file du jour de vos services. Sans application à installer, même quand le réseau tombe.",
    primaryCta: "Créer mon compte gratuit",
    secondaryCta: "Voir comment ça marche",
    ctaNote: "Gratuit jusqu'à 100 invités, sans carte bancaire",
    uses: { events: "Événements", services: "Services" },
  },
  proof: [
    { value: 3, label: "canaux pour joindre vos clients : e-mail, WhatsApp, SMS" },
    { value: 0, label: "application à installer, pour vous comme pour eux" },
    { value: 100, label: "invités offerts sur votre compte, chaque année" },
    { value: 1, label: "lien par membre de votre équipe, sans compte" },
  ],
  events: {
    badge: "Événements",
    heading: "De l'invitation à la dernière entrée",
    subheading:
      "Mariage, séminaire, gala ou assemblée générale : un seul outil remplace WhatsApp, Excel et les billets papier.",
    items: [
      {
        title: "Invitations e-mail et WhatsApp",
        description: "Chaque invité reçoit son lien personnel, à vos couleurs, sur le canal qu'il ouvre vraiment. Les envois échoués sont relancés.",
      },
      {
        title: "Réponses suivies en direct",
        description: "Vos invités confirment ou déclinent en un geste. Vous voyez qui vient et à qui relancer l'invitation.",
      },
      {
        title: "Billets QR infalsifiables",
        description: "Chaque confirmation produit un billet signé, impossible à deviner ou à réutiliser, prêt à scanner.",
      },
      {
        title: "Catégories d'accès et billets payants",
        description: "VIP, presse, standard : chaque catégorie a son prix, sa couleur et sa jauge. Un billet dû n'entre qu'une fois payé.",
        soon: true,
      },
      {
        title: "Check-in même sans réseau",
        description: "La liste se synchronise à l'avance sur le téléphone du contrôleur. Le réseau coupe ? On continue de scanner.",
      },
      {
        title: "Quorum et preuves de présence",
        description: "Quorum compté en direct, feuille d'émargement et attestations nominatives générées sans effort.",
      },
    ],
  },
  services: {
    badge: "Services",
    heading: "Des rendez-vous et une file du jour qui avancent seuls",
    subheading:
      "Clinique, salon, agence, administration : vos clients réservent, arrivent et sont appelés sans bousculade.",
    items: [
      {
        title: "Un lien de réservation à partager",
        description: "Un lien court et un QR code à afficher : vos clients choisissent un créneau libre, sans compte ni appel.",
      },
      {
        title: "Rappels WhatsApp ou SMS",
        description: "Un rappel avant chaque rendez-vous, sur WhatsApp, par SMS, ou par SMS quand WhatsApp échoue.",
        soon: true,
      },
      {
        title: "La file du jour sur un écran",
        description: "Rendez-vous et sans-rendez-vous dans une seule liste. « Suivant » appelle la bonne personne, dans le bon ordre.",
      },
      {
        title: "« C'est votre tour, guichet 4 »",
        description: "Le client appelé reçoit le message avec son numéro de guichet : il attend dehors, pas dans le couloir.",
      },
      {
        title: "Le client prend son ticket lui-même",
        description: "Il scanne le QR de l'entrée, prend son ticket et suit sa place en direct depuis son téléphone.",
        soon: true,
      },
      {
        title: "Payé avant ou après le service",
        description: "Chaque service a son prix et sa règle. Le personnel note « payé » en un geste, espèces ou Mobile Money.",
        soon: true,
      },
    ],
  },
  operators: {
    badge: "Votre équipe",
    heading: "Un lien par personne, et rien d'autre",
    text:
      "Portier, réceptionniste ou caissier : chacun reçoit un lien qui n'ouvre que ce que vous lui confiez, les événements et services de son périmètre, les actions permises. Vous le révoquez en un clic.",
    points: [
      { text: "Aucun compte à créer, aucune application à installer" },
      { text: "Chaque action est attribuée à la bonne personne" },
      { text: "Scan, file du jour et encaissement dans une seule console", soon: true },
    ],
  },
  payments: {
    badge: "Paiements",
    heading: "Vos clients vous paient directement",
    text:
      "Jikū n'encaisse jamais l'argent de vos clients. Ils vous règlent sur vos numéros Mobile Money ou votre propre lien de paiement, affichés sur leur invitation ou leur ticket.",
    points: [
      { text: "Aucune commission sur vos services" },
      { text: "Le statut « payé » noté en un geste, espèces ou Mobile Money", soon: true },
      { text: "Vos numéros et votre lien affichés sur chaque billet dû", soon: true },
      { text: "Un badge « Organisation vérifiée » sur vos pages publiques", soon: true },
    ],
  },
  howItWorks: {
    badge: "Simple, de bout en bout",
    heading: "Prêt en quatre étapes",
    subheading: "Si vous savez remplir un tableur, vous savez utiliser Jikū.",
    steps: [
      { title: "Créez votre événement ou votre service", description: "Un nom, une date ou des horaires, un prix si besoin. Le reste attend." },
      { title: "Invitez ou partagez votre lien", description: "Importez votre liste d'invités, ou partagez votre lien de réservation et son QR code." },
      { title: "Confiez un lien à votre équipe", description: "Chaque membre ouvre sa console depuis son téléphone : scan, file du jour, encaissement." },
      { title: "Suivez tout en direct", description: "Confirmations, entrées, attente et paiements, sur un seul tableau de bord." },
    ],
  },
  useCases: {
    badge: "Pour qui",
    heading: "Du mariage de 150 invités à la clinique de quartier",
    subheading: "Le même billet sert l'événement d'un soir et le service de tous les jours.",
    more: "Voir tous les cas d'usage",
    cases: [
      { title: "Mariages et célébrations", description: "Confirmations WhatsApp, billets QR, une entrée sans liste papier." },
      { title: "Conférences et galas", description: "Plusieurs entrées, plusieurs contrôleurs, un seul décompte fiable, même hors ligne." },
      { title: "Assemblées générales", description: "Quorum horodaté, émargement et attestations de présence sans les refaire à la main." },
      { title: "Cliniques et cabinets", description: "Rendez-vous, rappels et file du jour : les patients attendent moins et savent quand venir." },
      { title: "Salons et ateliers", description: "Un lien de réservation sur Instagram, des rappels qui réduisent les absences." },
      { title: "Agences et administrations", description: "Tickets d'attente, appel au guichet et suivi de l'attente, sans borne coûteuse." },
    ],
  },
  pricing: {
    badge: "Tarifs",
    heading: "Vous payez pour ce que vous utilisez",
    subheading: "Événements et services ont chacun leur modèle, simple et affiché. Toutes les fonctionnalités sont incluses.",
    plans: [
      {
        name: "Événements",
        price: "Gratuit",
        caption: "jusqu'à 100 invités par an, puis dès 150 000 GNF par événement",
        points: ["Payé en une fois, à l'activation du palier", "Invitations, billets, check-in hors ligne", "Aucun abonnement"],
        cta: "Estimer mon événement",
        href: "/simulator",
        highlighted: true,
      },
      {
        name: "Services",
        price: "Solo gratuit",
        caption: "puis par personne qui sert, par mois",
        points: ["Lien de réservation, rappels, file du jour", "Seules les personnes qui servent comptent", "Aucune commission sur vos clients"],
        cta: "Voir les offres",
        href: "/simulator",
      },
      {
        name: "Vente de billets en ligne",
        price: "3 %",
        caption: "du prix de chaque billet vendu",
        points: ["Vos acheteurs vous paient directement", "Rien d'autre à payer", "Pour vos événements payants"],
        cta: "Être prévenu",
        href: "/register",
        soon: true,
      },
    ],
    enterprise: {
      title: "Grandes organisations",
      text: "Volumes élevés, accompagnement dédié ou hébergement sur votre propre infrastructure : parlons-en.",
      cta: "Contacter l'équipe commerciale",
      mailSubject: "Jikū - offre Entreprise",
    },
    note: "Prix en francs guinéens (GNF), taxes comprises. Le simulateur donne le montant exact selon votre besoin.",
  },
  faq: {
    badge: "Questions fréquentes",
    heading: "Vous vous demandez sûrement…",
    subheading: "Les réponses aux questions qu'on nous pose le plus.",
    items: [
      { question: "Mes invités ou mes clients doivent-ils installer une application ?", answer: "Non. Tout passe par un simple lien ouvert dans le navigateur de leur téléphone : invitation, billet, réservation ou ticket d'attente." },
      { question: "Le check-in fonctionne-t-il sans internet ?", answer: "Oui. La liste se synchronise à l'avance sur le téléphone du contrôleur ; les scans hors ligne se synchronisent au retour du réseau, et un billet ne passe jamais deux fois." },
      { question: "Jikū encaisse-t-il l'argent de mes clients ?", answer: "Non, jamais. Vos clients vous paient directement, sur vos numéros Mobile Money ou votre propre lien de paiement. Jikū ne facture que son propre service." },
      { question: "Combien coûte un événement ?", answer: "C'est gratuit jusqu'à 100 invités cumulés sur l'année. Au-delà, un montant unique par événement selon le nombre d'invités : 150 000 GNF jusqu'à 300, 300 000 GNF jusqu'à 600, 500 000 GNF jusqu'à 1 000, puis sur mesure." },
      { question: "Et la prise de rendez-vous ?", answer: "C'est un abonnement par personne qui sert et par mois, avec une offre Solo gratuite. Aucune commission n'est prise sur vos clients." },
      { question: "Comment mon équipe accède-t-elle à Jikū ?", answer: "Chaque membre reçoit un lien personnel qui n'ouvre que ce que vous lui confiez. Pas de compte, pas d'application, et vous le révoquez à tout moment." },
      { question: "Mes messages partent-ils vraiment sur WhatsApp ?", answer: "Oui, via l'API officielle WhatsApp Business, un message individuel par personne. Pour les rappels de rendez-vous, le SMS prend le relais si WhatsApp échoue." },
      { question: "Que deviennent les données personnelles ?", answer: "Chaque invité peut demander la suppression de ses données depuis son lien. Après la période de conservation, les données sont anonymisées automatiquement." },
      { question: "Puis-je utiliser mes couleurs et mon logo ?", answer: "Oui. Invitations, billets, pages de réservation et consoles portent votre marque ; Jikū reste en coulisses." },
    ],
  },
  cta: {
    heading: "Votre prochain événement, votre prochain client : sans attente.",
    text: "Créez votre compte, importez dix invités ou partagez votre lien de réservation : en cinq minutes, vous saurez si Jikū est fait pour vous.",
    primaryCta: "Créer mon compte gratuit",
    secondaryCta: "Se connecter",
  },
  footer: {
    description: "Billets, invitations, rendez-vous et file d'attente en marque blanche, pensés pour l'Afrique francophone.",
    groups: [
      {
        title: "Produit",
        links: [
          { label: "Événements", href: "/#events" },
          { label: "Services", href: "/#services" },
          { label: "Tarifs", href: "/#pricing" },
          { label: "Cas d'usage", href: "/use-cases" },
          { label: "Simulateur", href: "/simulator" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        title: "Application",
        links: [
          { label: "Se connecter", href: "/login" },
          { label: "Créer un compte", href: "/register" },
        ],
      },
      { title: "Légal", links: [{ label: "Politique de confidentialité", href: "/privacy" }] },
    ],
    copyright: "Tous droits réservés.",
    tagline: "Pensé pour l'Afrique francophone",
    privacy: "Confidentialité",
  },
};

const en: LandingContent = {
  htmlLang: "en",
  meta: {
    title: "Jikū: tickets, invitations, appointments and queues, in your colors",
    description:
      "One platform for everything that runs on a ticket: invitations and check-in for your events, bookings and the day line for your services. Free for up to 100 guests.",
    keywords: [
      "event invitations",
      "QR code tickets",
      "offline check-in",
      "appointment booking",
      "queue management",
      "waiting ticket",
      "WhatsApp invitations",
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
      { label: "Simulator", href: "/simulator" },
      { label: "FAQ", href: "#faq" },
    ],
    signIn: "Sign in",
    register: "Create an account",
    switchLocale: { label: "FR", href: "/", ariaLabel: "Lire cette page en français" },
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },
  soonLabel: "Soon",
  hero: {
    badge: "Events and services, in your colors",
    headlinePrefix: "Your",
    headlineWords: ["guests", "clients", "patients", "attendees"],
    headlineSuffix: "get in without waiting.",
    subtitle:
      "Jikū runs everything that goes through a ticket: invitations and entry for your events, bookings and the day line for your services. No app to install, even when the network drops.",
    primaryCta: "Create my free account",
    secondaryCta: "See how it works",
    ctaNote: "Free for up to 100 guests, no card required",
    uses: { events: "Events", services: "Services" },
  },
  proof: [
    { value: 3, label: "channels to reach your clients: email, WhatsApp, SMS" },
    { value: 0, label: "apps to install, for you or for them" },
    { value: 100, label: "free guests on your account, every year" },
    { value: 1, label: "link per team member, no account needed" },
  ],
  events: {
    badge: "Events",
    heading: "From the invitation to the last entry",
    subheading: "Wedding, seminar, gala or general assembly: one tool replaces WhatsApp, Excel and paper tickets.",
    items: [
      { title: "Email and WhatsApp invitations", description: "Every guest gets a personal link, in your colors, on the channel they actually open. Failed sends are retried." },
      { title: "Answers tracked live", description: "Guests confirm or decline in one tap. You see who's coming and whom to remind." },
      { title: "Tamper-proof QR tickets", description: "Every confirmation produces a signed ticket that can't be guessed or reused, ready to scan." },
      { title: "Access categories and paid tickets", description: "VIP, press, standard: each category has its price, color and capacity. A ticket that's due only gets in once paid.", soon: true },
      { title: "Check-in without a network", description: "The list syncs to the door staff's phone ahead of time. Network down? Keep scanning." },
      { title: "Quorum and attendance proof", description: "Live quorum count, a sign-in sheet and named attendance certificates, generated for you." },
    ],
  },
  services: {
    badge: "Services",
    heading: "Appointments and a day line that run themselves",
    subheading: "Clinic, salon, agency or public office: your clients book, arrive and get called without a crowd.",
    items: [
      { title: "A booking link to share", description: "A short link and a QR code to display: clients pick a free slot, no account and no phone call." },
      { title: "WhatsApp or SMS reminders", description: "A reminder before every appointment, on WhatsApp, by SMS, or by SMS when WhatsApp fails.", soon: true },
      { title: "The day line on one screen", description: "Appointments and walk-ins in one list. \"Next\" calls the right person, in the right order." },
      { title: "\"It's your turn, counter 4\"", description: "The client called gets the message with their counter number: they wait outside, not in the hallway." },
      { title: "Clients take their own ticket", description: "They scan the QR code at the entrance, take a ticket and follow their place live on their phone.", soon: true },
      { title: "Paid before or after the service", description: "Each service has its price and its rule. Staff mark \"paid\" in one tap, cash or Mobile Money.", soon: true },
    ],
  },
  operators: {
    badge: "Your team",
    heading: "One link per person, nothing else",
    text:
      "Door staff, receptionist or cashier: each gets a link that only opens what you entrust to them, the events and services in their scope, the actions allowed. You revoke it in one click.",
    points: [
      { text: "No account to create, no app to install" },
      { text: "Every action is attributed to the right person" },
      { text: "Scanning, the day line and payments in one console", soon: true },
    ],
  },
  payments: {
    badge: "Payments",
    heading: "Your clients pay you directly",
    text:
      "Jikū never collects your clients' money. They pay you on your Mobile Money numbers or your own payment link, shown on their invitation or ticket.",
    points: [
      { text: "No commission on your services" },
      { text: "\"Paid\" recorded in one tap, cash or Mobile Money", soon: true },
      { text: "Your numbers and link shown on every ticket that's due", soon: true },
      { text: "A \"Verified organization\" badge on your public pages", soon: true },
    ],
  },
  howItWorks: {
    badge: "Simple, end to end",
    heading: "Ready in four steps",
    subheading: "If you can fill in a spreadsheet, you can use Jikū.",
    steps: [
      { title: "Create your event or service", description: "A name, a date or opening hours, a price if needed. The rest can wait." },
      { title: "Invite or share your link", description: "Import your guest list, or share your booking link and its QR code." },
      { title: "Hand your team a link", description: "Each member opens their console on their phone: scanning, the day line, payments." },
      { title: "Follow everything live", description: "Confirmations, entries, waiting and payments, on a single dashboard." },
    ],
  },
  useCases: {
    badge: "Who it's for",
    heading: "From a 150-guest wedding to the neighborhood clinic",
    subheading: "The same ticket serves a one-night event and an everyday service.",
    more: "See every use case",
    cases: [
      { title: "Weddings and celebrations", description: "WhatsApp confirmations, QR tickets, an entrance without a paper list." },
      { title: "Conferences and galas", description: "Several entrances, several door staff, one reliable count, even offline." },
      { title: "General assemblies", description: "Timestamped quorum, sign-in sheet and attendance certificates without redoing them by hand." },
      { title: "Clinics and practices", description: "Bookings, reminders and the day line: patients wait less and know when to come." },
      { title: "Salons and studios", description: "A booking link on Instagram, reminders that cut no-shows." },
      { title: "Agencies and public offices", description: "Waiting tickets, counter calls and wait tracking, without a costly kiosk." },
    ],
  },
  pricing: {
    badge: "Pricing",
    heading: "You pay for what you use",
    subheading: "Events and services each have their own simple, published model. Every feature is included.",
    plans: [
      {
        name: "Events",
        price: "Free",
        caption: "up to 100 guests a year, then from 150,000 GNF per event",
        points: ["Paid once, when the tier is activated", "Invitations, tickets, offline check-in", "No subscription"],
        cta: "Estimate my event",
        href: "/simulator",
        highlighted: true,
      },
      {
        name: "Services",
        price: "Solo free",
        caption: "then per person who serves, per month",
        points: ["Booking link, reminders, day line", "Only the people who serve count", "No commission on your clients"],
        cta: "See the plans",
        href: "/simulator",
      },
      {
        name: "Online ticket sales",
        price: "3%",
        caption: "of each ticket sold",
        points: ["Buyers pay you directly", "Nothing else to pay", "For your paid events"],
        cta: "Get notified",
        href: "/register",
        soon: true,
      },
    ],
    enterprise: {
      title: "Large organizations",
      text: "High volumes, dedicated support or hosting on your own infrastructure: let's talk.",
      cta: "Contact the sales team",
      mailSubject: "Jikū - Enterprise offer",
    },
    note: "Prices in Guinean francs (GNF), taxes included. The simulator gives the exact amount for your needs.",
  },
  faq: {
    badge: "Frequently asked",
    heading: "You're probably wondering…",
    subheading: "Answers to the questions we hear most.",
    items: [
      { question: "Do my guests or clients need to install an app?", answer: "No. Everything goes through a simple link opened in their phone's browser: invitation, ticket, booking or waiting ticket." },
      { question: "Does check-in work without internet?", answer: "Yes. The list syncs to the door staff's phone ahead of time; offline scans sync when the network returns, and a ticket never gets in twice." },
      { question: "Does Jikū collect my clients' money?", answer: "No, never. Your clients pay you directly, on your Mobile Money numbers or your own payment link. Jikū only charges for its own service." },
      { question: "How much does an event cost?", answer: "It's free up to 100 guests a year. Beyond that, one payment per event based on guest count: 150,000 GNF up to 300, 300,000 GNF up to 600, 500,000 GNF up to 1,000, then custom." },
      { question: "What about appointments?", answer: "It's a subscription per person who serves, per month, with a free Solo plan. No commission is taken on your clients." },
      { question: "How does my team access Jikū?", answer: "Each member gets a personal link that only opens what you entrust to them. No account, no app, and you can revoke it at any time." },
      { question: "Do my messages really go out on WhatsApp?", answer: "Yes, through the official WhatsApp Business API, one individual message per person. For appointment reminders, SMS takes over when WhatsApp fails." },
      { question: "What happens to personal data?", answer: "Every guest can request the deletion of their data from their link. After the retention period, data is anonymized automatically." },
      { question: "Can I use my own colors and logo?", answer: "Yes. Invitations, tickets, booking pages and consoles carry your brand; Jikū stays behind the scenes." },
    ],
  },
  cta: {
    heading: "Your next event, your next client: no waiting.",
    text: "Create your account, import ten guests or share your booking link: within five minutes, you'll know whether Jikū is for you.",
    primaryCta: "Create my free account",
    secondaryCta: "Sign in",
  },
  footer: {
    description: "White-label tickets, invitations, appointments and queues, built for French-speaking Africa.",
    groups: [
      {
        title: "Product",
        links: [
          { label: "Events", href: "/#events" },
          { label: "Services", href: "/#services" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Use cases", href: "/use-cases" },
          { label: "Simulator", href: "/simulator" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        title: "App",
        links: [
          { label: "Sign in", href: "/login" },
          { label: "Create an account", href: "/register" },
        ],
      },
      { title: "Legal", links: [{ label: "Privacy policy", href: "/privacy" }] },
    ],
    copyright: "All rights reserved.",
    tagline: "Built for French-speaking Africa",
    privacy: "Privacy",
  },
};

export const LANDING_CONTENT: Record<LandingLocale, LandingContent> = { fr, en };
