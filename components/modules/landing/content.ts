// CONTRACT — every word on the landing page, in both locales. Copy lives here
// so the sections stay purely structural and the two locales can never drift
// in shape. Rules for edits: no invented numbers, no testimonials that did not
// happen, no compliance claims we cannot evidence. Pricing mirrors the backend
// defaults (billing.free-tier-guests and billing.tiers in app/application.yaml);
// if those change, change this too.

export type LandingLocale = "fr" | "en";

export interface LandingContent {
  htmlLang: string;
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  nav: {
    links: { label: string; href: string }[];
    signIn: string;
    register: string;
    switchLocale: { label: string; href: string; ariaLabel: string };
    menuOpen: string;
    menuClose: string;
  };
  hero: {
    badge: string;
    headlineWords: string[];
    headlinePrefix: string;
    headlineSuffix: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    ctaNote: string;
    truths: { value: string; label: string }[];
  };
  features: {
    badge: string;
    heading: string;
    subheading: string;
    items: { title: string; description: string }[];
  };
  howItWorks: {
    badge: string;
    heading: string;
    subheading: string;
    steps: { title: string; description: string }[];
  };
  useCases: {
    badge: string;
    heading: string;
    subheading: string;
    cases: { title: string; description: string }[];
    trustBar: string[];
  };
  pricing: {
    badge: string;
    heading: string;
    subheading: string;
    perEvent: string;
    /** Capacity line per tier; `{guests}` is replaced with the tier's guest count. */
    upToTemplate: string;
    tiers: { name: string; price: string; guests: string; highlighted: boolean; cta: string }[];
    highlightLabel: string;
    everyEventIncludesTitle: string;
    everyEventIncludes: string[];
    note: string;
  };
  faq: {
    badge: string;
    heading: string;
    subheading: string;
    items: { question: string; answer: string }[];
  };
  cta: {
    badge: string;
    heading: string;
    text: string;
    primaryCta: string;
    secondaryCta: string;
  };
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
    title: "Jikū : invitations, billetterie et check-in pour vos événements",
    description:
      "Envoyez vos invitations par e-mail et WhatsApp, suivez les confirmations, générez des billets QR et contrôlez les entrées même sans réseau. Gratuit jusqu'à 100 invités.",
    keywords: [
      "invitation événement",
      "billetterie événementielle",
      "invitation WhatsApp",
      "billet QR code",
      "check-in événement",
      "gestion des invités",
      "RSVP en ligne",
      "invitation mariage",
      "plateforme événementielle Afrique",
      "marque blanche événement",
    ],
  },
  nav: {
    links: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Comment ça marche", href: "#how-it-works" },
      { label: "Tarifs", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    signIn: "Se connecter",
    register: "Créer un compte",
    switchLocale: { label: "EN", href: "/en", ariaLabel: "Read this page in English" },
    menuOpen: "Ouvrir le menu",
    menuClose: "Fermer le menu",
  },
  hero: {
    badge: "Plateforme événementielle en marque blanche",
    headlinePrefix: "Vos ",
    headlineWords: ["invitations", "billets", "RSVP", "entrées"],
    headlineSuffix: "enfin simples.",
    subtitle:
      "Envoyez vos invitations par e-mail et WhatsApp, suivez les confirmations, générez des billets QR infalsifiables et contrôlez les entrées, même quand le réseau tombe. Le tout à vos couleurs, sous votre nom.",
    primaryCta: "Créer mon premier événement",
    secondaryCta: "Voir les fonctionnalités",
    ctaNote: "Gratuit jusqu'à 100 invités, sans carte bancaire",
    truths: [
      { value: "E-mail + WhatsApp", label: "Deux canaux d'invitation" },
      { value: "Billets QR signés", label: "Uniques et infalsifiables" },
      { value: "Check-in hors-ligne", label: "Le réseau tombe, pas vous" },
      { value: "Marque blanche", label: "Votre logo, vos couleurs" },
    ],
  },
  features: {
    badge: "Tout ce qu'il faut",
    heading: "De la première invitation à la dernière entrée",
    subheading:
      "Jikū remplace le trio WhatsApp + Excel + billets papier par un seul outil, pensé pour la réalité du terrain.",
    items: [
      {
        title: "Invitations e-mail et WhatsApp",
        description:
          "Vos invités reçoivent une invitation à vos couleurs, sur le canal qu'ils ouvrent vraiment. Les envois échoués sont relancés automatiquement.",
      },
      {
        title: "Suivi des réponses en direct",
        description:
          "Chaque invité confirme ou décline en un geste depuis son téléphone. Vous voyez qui vient, qui hésite, et à qui renvoyer une invitation.",
      },
      {
        title: "Billets QR infalsifiables",
        description:
          "Chaque confirmation génère un billet unique au code signé, impossible à deviner ou à réutiliser. Prêt à scanner à l'entrée.",
      },
      {
        title: "Check-in même sans réseau",
        description:
          "La liste des invités se synchronise à l'avance sur le téléphone du contrôleur. Coupure le jour J ? On continue de scanner, tout se synchronise au retour du réseau.",
      },
      {
        title: "Votre marque, pas la nôtre",
        description:
          "Logo, couleurs, nom d'organisateur : vos invités voient votre organisation du premier e-mail jusqu'au billet. Jikū reste en coulisses.",
      },
      {
        title: "Tableau de bord en temps réel",
        description:
          "Invitations envoyées, confirmations, entrées par point de contrôle : suivez votre événement d'un seul écran, minute par minute.",
      },
    ],
  },
  howItWorks: {
    badge: "Simple, de bout en bout",
    heading: "De la liste d'invités au check-in en quatre étapes",
    subheading:
      "Aucune compétence technique nécessaire : si vous savez remplir un tableur, vous savez utiliser Jikū.",
    steps: [
      {
        title: "Créez votre événement",
        description:
          "Nom, date, lieu, réglages : un formulaire guidé, étape par étape. Votre brouillon est conservé si vous revenez plus tard.",
      },
      {
        title: "Importez vos invités",
        description:
          "Un fichier CSV suffit. Chaque ligne est vérifiée, les doublons et les adresses douteuses sont signalés avant l'envoi.",
      },
      {
        title: "Envoyez les invitations",
        description:
          "Par e-mail, WhatsApp ou les deux. Chaque invité reçoit un lien personnel pour confirmer et récupérer son billet.",
      },
      {
        title: "Contrôlez les entrées",
        description:
          "Vos contrôleurs scannent les billets depuis leur propre téléphone, via un simple lien, avec ou sans connexion.",
      },
    ],
  },
  useCases: {
    badge: "Pensé pour vos événements",
    heading: "Du mariage de 150 invités au gala de 10 000",
    subheading:
      "Le même outil, du dîner de famille à l'événement professionnel. Seul le nombre d'invités change.",
    cases: [
      {
        title: "Mariages & célébrations",
        description:
          "Fini la liste papier à l'entrée. Les invités confirment depuis WhatsApp, présentent leur billet QR le jour J, et vous savez exactement qui est arrivé.",
      },
      {
        title: "Conférences & séminaires",
        description:
          "Importez la liste des participants, envoyez les accès en une fois, suivez la présence en direct, même quand le Wi-Fi du centre de conférence flanche.",
      },
      {
        title: "Galas & concerts",
        description:
          "Plusieurs entrées, plusieurs contrôleurs, un seul décompte fiable. Chaque billet ne passe qu'une seule fois, quoi qu'il arrive.",
      },
    ],
    trustBar: [
      "Fonctionne hors-ligne le jour J",
      "Vos invités peuvent supprimer leurs données",
      "Un prix par événement, pas d'abonnement",
      "Marque blanche incluse",
    ],
  },
  pricing: {
    badge: "Tarifs",
    heading: "Un prix par événement. Pas d'abonnement.",
    subheading:
      "Vous payez pour l'événement que vous organisez, rien d'autre. Toutes les fonctionnalités sont incluses à chaque niveau. Seule la taille change.",
    perEvent: "par événement",
    upToTemplate: "Jusqu'à {guests} invités",
    tiers: [
      { name: "Gratuit", price: "0 FCFA", guests: "100", highlighted: false, cta: "Commencer gratuitement" },
      { name: "Standard", price: "5 000 FCFA", guests: "2 000", highlighted: true, cta: "Créer mon événement" },
      { name: "Premium", price: "20 000 FCFA", guests: "10 000", highlighted: false, cta: "Créer mon événement" },
    ],
    highlightLabel: "Le plus courant",
    everyEventIncludesTitle: "Chaque événement inclut :",
    everyEventIncludes: [
      "Invitations e-mail et WhatsApp",
      "Billets QR signés",
      "Check-in hors-ligne",
      "Marque blanche (logo et couleurs)",
      "Tableau de bord en temps réel",
      "Export CSV des invités",
    ],
    note: "Prix de lancement en FCFA (XOF). Le niveau requis dépend du nombre d'invités de l'événement ; vous pouvez augmenter la capacité d'un événement à tout moment.",
  },
  faq: {
    badge: "Questions fréquentes",
    heading: "Vous vous demandez sûrement…",
    subheading: "Les réponses aux questions qu'on nous pose le plus souvent.",
    items: [
      {
        question: "Mes invités doivent-ils installer une application ?",
        answer:
          "Non. L'invitation est un simple lien : vos invités confirment leur présence et reçoivent leur billet directement dans le navigateur de leur téléphone.",
      },
      {
        question: "Le check-in fonctionne-t-il sans connexion internet ?",
        answer:
          "Oui. La liste des invités se synchronise à l'avance sur le téléphone du contrôleur ; les scans effectués hors-ligne sont enregistrés localement puis synchronisés au retour du réseau. Un billet ne peut jamais être validé deux fois, même par deux contrôleurs différents.",
      },
      {
        question: "Comment les invitations WhatsApp sont-elles envoyées ?",
        answer:
          "Via l'API officielle WhatsApp Business. Chaque invité reçoit un message individuel avec son lien personnel, rien à voir avec un message transféré de groupe en groupe.",
      },
      {
        question: "Qu'est-ce que la marque blanche, concrètement ?",
        answer:
          "Vos invités voient votre logo, vos couleurs et le nom de votre organisation sur les invitations, la page de confirmation et les billets. Jikū n'apparaît pas.",
      },
      {
        question: "Combien ça coûte ?",
        answer:
          "C'est gratuit jusqu'à 100 invités par événement. Au-delà, vous payez un montant unique pour l'événement, selon le nombre d'invités : 5 000 FCFA jusqu'à 2 000 invités, 20 000 FCFA jusqu'à 10 000. Pas d'abonnement mensuel.",
      },
      {
        question: "Que deviennent les données de mes invités ?",
        answer:
          "Chaque invité peut demander la suppression de ses données personnelles depuis sa page d'invitation. Après l'événement, les données personnelles sont automatiquement anonymisées à l'issue de la période de rétention, comme décrit dans notre politique de confidentialité.",
      },
    ],
  },
  cta: {
    badge: "Essayez par vous-même",
    heading: "Votre prochain événement, sans le stress de l'entrée.",
    text: "Créez un événement, importez dix invités, envoyez-vous une invitation : en cinq minutes vous saurez si Jikū est fait pour vous. Gratuit jusqu'à 100 invités.",
    primaryCta: "Créer mon compte gratuit",
    secondaryCta: "Se connecter",
  },
  footer: {
    description:
      "Invitations, billetterie, RSVP et check-in en marque blanche, pensé pour les organisateurs d'événements en Afrique francophone.",
    groups: [
      {
        title: "Produit",
        links: [
          { label: "Fonctionnalités", href: "#features" },
          { label: "Comment ça marche", href: "#how-it-works" },
          { label: "Tarifs", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
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
        links: [{ label: "Politique de confidentialité", href: "/privacy" }],
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
    title: "Jikū: Event Invitations, Ticketing & Check-in",
    description:
      "Send invitations by email and WhatsApp, track RSVPs, issue QR tickets, and check guests in even when the network drops. Free for up to 100 guests.",
    keywords: [
      "event invitations",
      "event ticketing",
      "WhatsApp invitations",
      "QR code tickets",
      "event check-in",
      "guest list management",
      "online RSVP",
      "wedding invitations",
      "event platform Africa",
      "white-label event platform",
    ],
  },
  nav: {
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    signIn: "Sign in",
    register: "Create account",
    switchLocale: { label: "FR", href: "/", ariaLabel: "Lire cette page en français" },
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },
  hero: {
    badge: "White-label event platform",
    headlinePrefix: "Your ",
    headlineWords: ["invitations", "tickets", "RSVPs", "check-ins"],
    headlineSuffix: "finally simple.",
    subtitle:
      "Send invitations by email and WhatsApp, track confirmations, issue tamper-proof QR tickets, and check guests in, even when the network drops. All under your own brand.",
    primaryCta: "Create my first event",
    secondaryCta: "See the features",
    ctaNote: "Free for up to 100 guests, no card required",
    truths: [
      { value: "Email + WhatsApp", label: "Two invitation channels" },
      { value: "Signed QR tickets", label: "Unique and tamper-proof" },
      { value: "Offline check-in", label: "The network drops, you don't" },
      { value: "White-label", label: "Your logo, your colors" },
    ],
  },
  features: {
    badge: "Everything you need",
    heading: "From the first invitation to the last check-in",
    subheading:
      "Jikū replaces the WhatsApp + Excel + paper-ticket routine with one tool, built for how events actually run.",
    items: [
      {
        title: "Email and WhatsApp invitations",
        description:
          "Guests get an invitation in your brand, on the channel they actually open. Failed sends are retried automatically.",
      },
      {
        title: "Live RSVP tracking",
        description:
          "Every guest confirms or declines in one tap from their phone. You see who's coming, who's undecided, and who to nudge.",
      },
      {
        title: "Tamper-proof QR tickets",
        description:
          "Each confirmation issues a unique ticket with a signed code that can't be guessed or reused. Ready to scan at the door.",
      },
      {
        title: "Check-in without a network",
        description:
          "The guest list syncs to the validator's phone ahead of time. Connection drops on the day? Keep scanning. Everything syncs when it returns.",
      },
      {
        title: "Your brand, not ours",
        description:
          "Logo, colors, organizer name: guests see your organization from the first email to the ticket. Jikū stays backstage.",
      },
      {
        title: "Real-time dashboard",
        description:
          "Invitations sent, confirmations, entries per checkpoint: follow your event from one screen, minute by minute.",
      },
    ],
  },
  howItWorks: {
    badge: "Simple, end to end",
    heading: "From guest list to check-in in four steps",
    subheading:
      "No technical skills needed: if you can fill in a spreadsheet, you can run Jikū.",
    steps: [
      {
        title: "Create your event",
        description:
          "Name, date, venue, settings: a guided, step-by-step form. Your draft is saved if you come back later.",
      },
      {
        title: "Import your guests",
        description:
          "A CSV file is all it takes. Every row is validated; duplicates and doubtful addresses are flagged before anything is sent.",
      },
      {
        title: "Send the invitations",
        description:
          "By email, WhatsApp, or both. Each guest gets a personal link to confirm and collect their ticket.",
      },
      {
        title: "Check guests in",
        description:
          "Your staff scan tickets from their own phones through a simple link, with or without a connection.",
      },
    ],
  },
  useCases: {
    badge: "Built for real events",
    heading: "From a 150-guest wedding to a 10,000-guest gala",
    subheading:
      "The same tool for a family dinner or a professional event. Only the guest count changes.",
    cases: [
      {
        title: "Weddings & celebrations",
        description:
          "No more paper list at the door. Guests confirm from WhatsApp, show their QR ticket on the day, and you know exactly who has arrived.",
      },
      {
        title: "Conferences & seminars",
        description:
          "Import the attendee list, send access in one go, track attendance live, even when the venue Wi-Fi gives up.",
      },
      {
        title: "Galas & concerts",
        description:
          "Several entrances, several validators, one reliable count. Each ticket passes exactly once, no matter what.",
      },
    ],
    trustBar: [
      "Works offline on event day",
      "Guests can delete their data",
      "One price per event, no subscription",
      "White-label included",
    ],
  },
  pricing: {
    badge: "Pricing",
    heading: "One price per event. No subscription.",
    subheading:
      "You pay for the event you're running, nothing else. Every feature is included at every tier. Only the size changes.",
    perEvent: "per event",
    upToTemplate: "Up to {guests} guests",
    tiers: [
      { name: "Free", price: "0 FCFA", guests: "100", highlighted: false, cta: "Start free" },
      { name: "Standard", price: "5,000 FCFA", guests: "2,000", highlighted: true, cta: "Create my event" },
      { name: "Premium", price: "20,000 FCFA", guests: "10,000", highlighted: false, cta: "Create my event" },
    ],
    highlightLabel: "Most common",
    everyEventIncludesTitle: "Every event includes:",
    everyEventIncludes: [
      "Email and WhatsApp invitations",
      "Signed QR tickets",
      "Offline check-in",
      "White-label branding (logo and colors)",
      "Real-time dashboard",
      "Guest list CSV export",
    ],
    note: "Launch pricing in FCFA (XOF). The tier you need depends on the event's guest count; you can upgrade an event's capacity at any time.",
  },
  faq: {
    badge: "Frequently asked",
    heading: "You're probably wondering…",
    subheading: "Answers to the questions we hear most often.",
    items: [
      {
        question: "Do my guests need to install an app?",
        answer:
          "No. The invitation is a simple link: guests confirm attendance and receive their ticket right in their phone's browser.",
      },
      {
        question: "Does check-in work without an internet connection?",
        answer:
          "Yes. The guest list syncs to the validator's phone ahead of time; scans made offline are stored locally and synced once the network returns. A ticket can never be validated twice, even by two different validators.",
      },
      {
        question: "How are WhatsApp invitations sent?",
        answer:
          "Through the official WhatsApp Business API. Each guest receives an individual message with their personal link, nothing like a message forwarded from group to group.",
      },
      {
        question: "What does white-label actually mean?",
        answer:
          "Your guests see your logo, your colors, and your organization's name on the invitations, the confirmation page, and the tickets. Jikū doesn't appear.",
      },
      {
        question: "How much does it cost?",
        answer:
          "It's free for up to 100 guests per event. Beyond that, you pay a one-time amount per event based on guest count: 5,000 FCFA up to 2,000 guests, 20,000 FCFA up to 10,000. No monthly subscription.",
      },
      {
        question: "What happens to my guests' data?",
        answer:
          "Any guest can request deletion of their personal data from their invitation page. After the event, personal data is automatically anonymized at the end of the retention period, as described in our privacy policy.",
      },
    ],
  },
  cta: {
    badge: "Try it yourself",
    heading: "Your next event, without the door-line stress.",
    text: "Create an event, import ten guests, send yourself an invitation: within five minutes you'll know whether Jikū is for you. Free for up to 100 guests.",
    primaryCta: "Create my free account",
    secondaryCta: "Sign in",
  },
  footer: {
    description:
      "White-label invitations, ticketing, RSVP, and check-in, built for event organizers in Francophone Africa.",
    groups: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "#features" },
          { label: "How it works", href: "#how-it-works" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ],
      },
      {
        title: "App",
        links: [
          { label: "Sign in", href: "/login" },
          { label: "Create account", href: "/register" },
        ],
      },
      {
        title: "Legal",
        links: [{ label: "Privacy policy", href: "/privacy" }],
      },
    ],
    copyright: "All rights reserved.",
    tagline: "Built for Francophone Africa",
    privacy: "Privacy",
  },
};

export const LANDING_CONTENT: Record<LandingLocale, LandingContent> = { fr, en };
