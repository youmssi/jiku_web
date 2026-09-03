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
    tiers: {
      name: string;
      price: string;
      /**
       * Capacity line, worded per tier rather than from one template: the free
       * allowance accumulates across a whole account, the paid tiers apply to a
       * single event, and stating both the same way misrepresents the offer.
       */
      capacity: string;
      /** Caption under the price — what the amount actually buys. */
      priceCaption: string;
      highlighted: boolean;
      cta: string;
    }[];
    /** Negotiated offer card: custom pricing, optional on-premise hosting, sales contact. */
    enterprise: {
      name: string;
      priceLabel: string;
      capacity: string;
      description: string;
      cta: string;
      mailSubject: string;
    };
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
      { label: "Cas d'usage", href: "/use-cases" },
      { label: "Tarifs", href: "#pricing" },
      { label: "Simulateur", href: "/simulator" },
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
    headlinePrefix: "Fini ",
    headlineWords: ["l'attente", "les files", "le désordre", "les resquilleurs"],
    headlineSuffix: "à la porte.",
    subtitle:
      "Mariage, séminaire, gala ou assemblée générale : Jikū supprime l'attente et le désordre à la porte. Invitations par e-mail et WhatsApp, billets QR infalsifiables et check-in même hors-ligne, le tout à vos couleurs.",
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
        title: "Catégories d'accès et jauges séparées",
        description:
          "VIP, presse, standard : chaque catégorie a sa couleur et son propre plafond. Le carré VIP se ferme quand il est plein sans bloquer le reste, et le contrôleur voit la catégorie au moment du scan.",
      },
      {
        title: "Une place qui change de main",
        description:
          "Un invité empêché transmet sa place à quelqu'un d'autre depuis son lien. L'ancien billet cesse d'être valable, le nouveau porte le bon nom, et votre décompte reste juste.",
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
      {
        title: "Assemblées générales & formations",
        description:
          "Un quorum compté en direct et horodaté, une feuille d'émargement générée toute seule, et une attestation de présence nominative pour chaque participant venu. La preuve que votre bailleur ou vos statuts exigent, sans la reconstituer à la main.",
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
    tiers: [
      {
        name: "Gratuit",
        price: "0 GNF",
        capacity: "100 invités cumulés sur votre compte",
        priceCaption: "sur 12 mois glissants",
        highlighted: false,
        cta: "Commencer gratuitement",
      },
      {
        name: "Bronze",
        price: "150 000 GNF",
        capacity: "Jusqu'à 300 invités",
        priceCaption: "par événement",
        highlighted: false,
        cta: "Créer mon événement",
      },
      {
        name: "Argent",
        price: "300 000 GNF",
        capacity: "Jusqu'à 600 invités",
        priceCaption: "par événement",
        highlighted: true,
        cta: "Créer mon événement",
      },
      {
        name: "Or",
        price: "500 000 GNF",
        capacity: "Jusqu'à 1 000 invités",
        priceCaption: "par événement",
        highlighted: false,
        cta: "Créer mon événement",
      },
    ],
    enterprise: {
      name: "Entreprise",
      priceLabel: "Sur devis",
      capacity: "Capacité sur mesure",
      description:
        "Offre négociée selon vos besoins : volumes supérieurs, accompagnement dédié, et hébergement on-premise (sur votre propre infrastructure) selon l'offre.",
      cta: "Contacter l'équipe commerciale",
      mailSubject: "Jikū - demande d'offre Entreprise / On-premise",
    },
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
    note: "Prix de lancement en franc guinéen (GNF). Le niveau requis dépend du nombre d'invités de l'événement ; vous pouvez augmenter la capacité d'un événement à tout moment. Au-delà de 1 000 invités, un tarif sur mesure s'applique. L'offre Entreprise (y compris l'hébergement on-premise) est à tarification personnalisée, via l'équipe commerciale.",
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
          "C'est gratuit jusqu'à 100 invités cumulés sur votre compte, un an glissant. Au-delà, vous payez un montant unique pour l'événement, selon le nombre d'invités : 150 000 GNF jusqu'à 300 invités, 300 000 GNF jusqu'à 600, 500 000 GNF jusqu'à 1 000. Au-delà, tarif sur mesure. Pas d'abonnement mensuel.",
      },
      {
        question: "Que deviennent les données de mes invités ?",
        answer:
          "Chaque invité peut demander la suppression de ses données personnelles depuis sa page d'invitation. Après l'événement, les données personnelles sont automatiquement anonymisées à l'issue de la période de rétention, comme décrit dans notre politique de confidentialité.",
      },
      {
        question: "Proposez-vous un hébergement on-premise ?",
        answer:
          "Oui, dans le cadre de l'offre Entreprise : selon l'offre retenue, Jikū peut être déployé sur votre propre infrastructure. Cette offre est à tarification personnalisée, contactez l'équipe commerciale pour un devis adapté à vos besoins.",
      },
      {
        question: "Puis-je utiliser Jikū pour la prise de rendez-vous ? Quel est le prix ?",
        answer:
          "Oui. La prise de rendez-vous est un abonnement par utilisateur et par mois (un outil de réservation pour votre activité), un modèle distinct du prix par événement. Cette offre n'est pas encore ouverte : les tarifs indicatifs (Solo gratuit, Teams, Organisation, Entreprise) sont visibles sur la page Simulateur, et personne ne sera prélevé avant l'ouverture. En attendant, l'organisation d'événements reste payée par événement, sans aucun abonnement exigé.",
      },
      {
        question: "Que devient mon acompte si je réserve une date ?",
        answer:
          "Votre acompte (30 %) est déduit du prix final : si vous invitez finalement plus d'invités que prévu et passez au palier supérieur, vous ne payez que la différence. Vous n'êtes jamais facturé deux fois pour les mêmes invités. En cas d'annulation, le remboursement est de 100 % jusqu'à 60 jours avant l'événement, de 50 % entre 30 et 60 jours, et nul ensuite. Aucune carte bancaire n'est demandée.",
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
          { label: "Cas d'usage", href: "/use-cases" },
          { label: "Tarifs", href: "#pricing" },
          { label: "Simulateur", href: "/simulator" },
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
      { label: "Use cases", href: "/use-cases" },
      { label: "Pricing", href: "#pricing" },
      { label: "Simulator", href: "/simulator" },
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
    headlinePrefix: "No more ",
    headlineWords: ["waiting", "queues", "disorder", "gatecrashers"],
    headlineSuffix: "at the door.",
    subtitle:
      "Wedding, seminar, gala or general assembly: Jikū removes the wait and the disorder at the door. Invitations by email and WhatsApp, tamper-proof QR tickets and check-in even offline, all under your own brand.",
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
        title: "Access tiers with their own caps",
        description:
          "VIP, press, standard: each tier gets its own colour and its own limit. The VIP area closes when it fills without blocking the rest, and the doorman sees the tier the moment the ticket is scanned.",
      },
      {
        title: "A seat that changes hands",
        description:
          "A guest who cannot come passes their seat to someone else from their own link. The old ticket stops working, the new one carries the right name, and your headcount stays correct.",
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
      {
        title: "General assemblies & training",
        description:
          "A quorum counted live and timestamped, an attendance register generated for you, and a named attendance certificate for every person who actually came. The proof your funder or your bylaws require, without rebuilding it by hand.",
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
    tiers: [
      {
        name: "Free",
        price: "0 GNF",
        capacity: "100 guests in total on your account",
        priceCaption: "over a rolling 12 months",
        highlighted: false,
        cta: "Start free",
      },
      {
        name: "Bronze",
        price: "150,000 GNF",
        capacity: "Up to 300 guests",
        priceCaption: "per event",
        highlighted: false,
        cta: "Create my event",
      },
      {
        name: "Silver",
        price: "300,000 GNF",
        capacity: "Up to 600 guests",
        priceCaption: "per event",
        highlighted: true,
        cta: "Create my event",
      },
      {
        name: "Gold",
        price: "500,000 GNF",
        capacity: "Up to 1,000 guests",
        priceCaption: "per event",
        highlighted: false,
        cta: "Create my event",
      },
    ],
    enterprise: {
      name: "Enterprise",
      priceLabel: "Custom pricing",
      capacity: "Tailored capacity",
      description:
        "A negotiated offer built around your needs: higher volumes, dedicated support, and on-premise hosting (on your own infrastructure) depending on the offer.",
      cta: "Contact the sales team",
      mailSubject: "Jikū - Enterprise / On-premise inquiry",
    },
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
    note: "Launch pricing in Guinean francs (GNF). The tier you need depends on the event's guest count; you can upgrade an event's capacity at any time. Beyond 1,000 guests, custom pricing applies. The Enterprise offer (including on-premise hosting) has custom pricing through the sales team.",
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
          "It's free for up to 100 guests cumulated on your account, on a rolling 12-month basis. Beyond that, you pay a one-time amount per event based on guest count: 150,000 GNF up to 300 guests, 300,000 GNF up to 600, 500,000 GNF up to 1,000. Beyond that, custom pricing. No monthly subscription.",
      },
      {
        question: "What happens to my guests' data?",
        answer:
          "Any guest can request deletion of their personal data from their invitation page. After the event, personal data is automatically anonymized at the end of the retention period, as described in our privacy policy.",
      },
      {
        question: "Do you offer on-premise hosting?",
        answer:
          "Yes, as part of the Enterprise offer: depending on the offer, Jikū can be deployed on your own infrastructure. This offer has custom pricing,  contact the sales team for a quote tailored to your needs.",
      },
      {
        question: "Can I use Jikū for appointments? How is it priced?",
        answer:
          "Yes. Appointments are a per-user monthly subscription (a booking tool for your business), a different model from the per-event price. This offer is not open yet: the indicative prices (Solo free, Teams, Organisation, Enterprise) are shown on the Simulator page, and no one is charged before launch. In the meantime, running events stays pay-per-event, with no subscription required.",
      },
      {
        question: "What happens to my deposit if I reserve a date?",
        answer:
          "Your deposit (30%) is deducted from the final price: if you end up inviting more guests than expected and move up a tier, you only pay the difference. You are never billed twice for the same guests. If you cancel, the refund is 100% up to 60 days before the event, 50% between 30 and 60 days, and nothing after. No card is ever requested.",
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
          { label: "Use cases", href: "/use-cases" },
          { label: "Pricing", href: "#pricing" },
          { label: "Simulator", href: "/simulator" },
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
