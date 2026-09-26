// CONTRACT — every word on the /simulator pricing page, in both locales.
// The page follows ADR 105 and the référentiel métier §11: one sentence
// that tells a visitor which model applies, a short questionnaire that picks
// it for them, then one tab per need. Figures live in lib/pricing.ts, which
// mirrors the backend configuration; this file only holds words.

import type { DeliveryMode, PricingCurrency, ServicePlanId } from "@/lib/pricing";
import type { LandingLocale } from "./content";

export type SimulatorNeed = "serve" | "invite" | "sell";

export interface FinderOption<T extends string> {
  value: T;
  title: string;
  description: string;
}

export interface SimulatorServicePlan {
  id: ServicePlanId;
  name: string;
  audience: string;
  features: string[];
  cta: string;
  mailSubject: string;
  highlight?: boolean;
}

export interface SimulatorContent {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  rule: string;
  onQuote: string;
  currency: { label: string; names: Record<PricingCurrency, string>; note: string };
  finder: {
    heading: string;
    text: string;
    progress: string;
    back: string;
    restart: string;
    need: { question: string; options: FinderOption<SimulatorNeed | "both">[] };
    servers: { question: string; options: FinderOption<"one" | "few" | "many">[] };
    features: { question: string; options: FinderOption<"email" | "whatsapp" | "sites" | "custom">[] };
    guests: { question: string; options: FinderOption<"100" | "300" | "600" | "1000" | "more">[] };
    sales: { question: string; options: FinderOption<"small" | "medium" | "large">[] };
    result: {
      eyebrow: string;
      plan: string;
      tier: string;
      commission: string;
      bothNote: string;
      seeDetail: string;
      create: string;
    };
  };
  tabs: Record<SimulatorNeed, string>;
  services: {
    intro: string;
    serversLabel: string;
    serversHelper: string;
    monthly: string;
    yearly: string;
    yearlyBadge: string;
    perMonth: string;
    includes: string;
    extraPerson: string;
    perYear: string;
    saving: string;
    soloLimit: string;
    clientsPay: string;
    freeRoles: string;
    plans: SimulatorServicePlan[];
  };
  invite: {
    intro: string;
    input: { label: string; helper: string };
    result: {
      freeLabel: string;
      freeNote: string;
      tierLabel: string;
      totalLabel: string;
      paymentNote: string;
      upgradeNote: string;
      customNote: string;
      perGuestNote: string;
      surchargeLabel: string;
    };
    modes: {
      heading: string;
      included: string;
      perGuest: string;
      options: { value: DeliveryMode; title: string; description: string }[];
    };
    ladder: { heading: string; note: string };
    pack: { title: string; text: string; price: string; cta: string; mailSubject: string };
  };
  sell: {
    soon: string;
    intro: string;
    priceLabel: string;
    countLabel: string;
    commissionLabel: string;
    perTicketLabel: string;
    trancheLabel: string;
    tranchesLabel: string;
    revenueLabel: string;
    revenueNote: string;
    steps: { title: string; text: string }[];
    verification: string;
  };
  sms: string;
  both: { heading: string; text: string };
  payments: {
    heading: string;
    toJiku: { title: string; text: string; methods: { name: string; soon?: boolean }[]; soon: string };
    toYou: { title: string; text: string };
  };
  cta: { heading: string; text: string; primary: string; secondary: string };
  nav: {
    home: string;
    signIn: string;
    createAccount: string;
    switchLocale: { label: string; href: string; ariaLabel: string };
  };
}

const fr: SimulatorContent = {
  meta: {
    title: "Tarifs et simulateur Jikū : abonnement, événement ou billetterie",
    description:
      "Services : un abonnement pour l'équipe, Solo gratuit pour toujours. Événements : gratuit jusqu'à 100 invités, puis un prix par événement. Billets vendus : 3 %. En GNF, en FCFA ou en dollars.",
  },
  eyebrow: "Tarifs",
  title: "Le bon prix, pour ce que vous faites vraiment",
  rule:
    "Vous recevez des clients chaque jour ? Un abonnement. Vous organisez un événement ? Vous payez l'événement : selon le nombre d'invités s'ils entrent gratuitement, 3 % des billets si vous les vendez.",
  onQuote: "Sur devis",
  currency: {
    label: "Monnaie",
    names: { GNF: "Franc guinéen", FCFA: "Franc CFA", USD: "Dollar US" },
    note: "Même prix partout : francs guinéens en Guinée, francs CFA (XOF en zone UEMOA, XAF en zone CEMAC), dollars ailleurs.",
  },
  finder: {
    heading: "Trouvez votre formule en trois questions",
    text: "Répondez, on vous montre le modèle qui vous correspond et son prix.",
    progress: "Question {current} sur {total}",
    back: "Retour",
    restart: "Recommencer",
    need: {
      question: "Que voulez-vous faire avec Jikū ?",
      options: [
        { value: "serve", title: "Recevoir des clients", description: "Rendez-vous, file d'attente, réservations, chaque jour." },
        { value: "invite", title: "Inviter des personnes", description: "Mariage, séminaire, gala : les invités entrent gratuitement." },
        { value: "sell", title: "Vendre des billets", description: "Concert, soirée, formation : le public achète sa place." },
        { value: "both", title: "Un peu de tout", description: "Un service au quotidien et des événements de temps en temps." },
      ],
    },
    servers: {
      question: "Combien de personnes reçoivent vos clients ?",
      options: [
        { value: "one", title: "Moi seul·e", description: "Un cabinet, un salon, une activité en solo." },
        { value: "few", title: "De 2 à 10", description: "Une petite équipe au guichet ou en consultation." },
        { value: "many", title: "Plus de 10", description: "Plusieurs services, plusieurs agents, parfois plusieurs sites." },
      ],
    },
    features: {
      question: "De quoi avez-vous besoin ?",
      options: [
        { value: "email", title: "L'essentiel", description: "Lien de réservation, file du jour et rappels par e-mail." },
        { value: "whatsapp", title: "Rappels WhatsApp et équipe", description: "Moins d'absences et chacun sa console." },
        { value: "sites", title: "Plusieurs sites et statistiques", description: "Séances de groupe jusqu'à 30, rôles avancés, exports." },
        { value: "custom", title: "Un déploiement dédié", description: "Hébergement sur mesure, engagement de service, intégrations." },
      ],
    },
    guests: {
      question: "Combien d'invités attendez-vous ?",
      options: [
        { value: "100", title: "Jusqu'à 100", description: "Couvert par vos 100 invités gratuits de l'année." },
        { value: "300", title: "De 101 à 300", description: "Un mariage, un séminaire d'entreprise." },
        { value: "600", title: "De 301 à 600", description: "Une conférence, un grand mariage." },
        { value: "1000", title: "De 601 à 1 000", description: "Un gala, une assemblée générale." },
        { value: "more", title: "Plus de 1 000", description: "Un salon, un festival : tarif au nombre d'invités." },
      ],
    },
    sales: {
      question: "Combien de billets pensez-vous vendre ?",
      options: [
        { value: "small", title: "Une centaine", description: "Un atelier, une formation, une soirée intime." },
        { value: "medium", title: "Quelques centaines", description: "Une soirée, un spectacle, une conférence payante." },
        { value: "large", title: "Un millier ou plus", description: "Un concert, un festival." },
      ],
    },
    result: {
      eyebrow: "Notre recommandation",
      plan: "Abonnement {plan}",
      tier: "Événement, palier {tier}",
      commission: "3 % des billets vendus",
      bothNote: "Vos événements restent payés à l'événement, jamais pris dans l'abonnement.",
      seeDetail: "Voir le détail",
      create: "Créer mon compte gratuit",
    },
  },
  tabs: {
    serve: "Je reçois des clients",
    invite: "J'invite des personnes",
    sell: "Je vends des billets",
  },
  services: {
    intro:
      "Rendez-vous, file d'attente et réservations : un abonnement pour votre équipe, chaque mois. Solo reste gratuit pour toujours. Aucune limite de services ni de clients par jour.",
    serversLabel: "Personnes qui servent vos clients",
    serversHelper: "Médecin, agent de guichet, coiffeur, serveur.",
    monthly: "Mensuel",
    yearly: "Annuel",
    yearlyBadge: "2 mois offerts",
    perMonth: "par mois",
    includes: "{count} incluses",
    extraPerson: "+ {amount} par personne en plus",
    perYear: "par an",
    saving: "{amount} d'économie par an en payant à l'année",
    soloLimit: "Solo et Solo Plus couvrent une seule personne : au-delà, passez à Teams.",
    clientsPay: "Vos clients peuvent vous payer leur ticket : aucune commission Jikū, jamais.",
    freeRoles: "Administrateurs, contrôleurs à l'entrée et livreurs sont gratuits.",
    plans: [
      {
        id: "solo",
        name: "Solo",
        audience: "Pour une personne qui reçoit seule",
        features: [
          "Lien de réservation et file du jour",
          "Rappels par e-mail, plus 50 rappels WhatsApp par mois",
          "Un client par créneau",
          "Gratuit pour toujours, sans carte",
        ],
        cta: "Commencer gratuitement",
        mailSubject: "Jikū - offre Solo",
      },
      {
        id: "soloPlus",
        name: "Solo Plus",
        audience: "Pour une personne qui veut moins d'absences",
        features: [
          "Tout Solo",
          "300 rappels WhatsApp par mois",
          "Votre marque, sans « Propulsé par Jikū »",
          "Support par WhatsApp",
        ],
        cta: "Choisir Solo Plus",
        mailSubject: "Jikū - offre Solo Plus",
      },
      {
        id: "teams",
        name: "Teams",
        audience: "Pour une équipe au guichet ou en consultation",
        features: [
          "Support prioritaire",
          "300 rappels WhatsApp par personne et par mois",
          "Une console par personne, sans compte",
          "Séances de groupe jusqu'à 10 personnes",
        ],
        cta: "Choisir Teams",
        mailSubject: "Jikū - offre Teams",
        highlight: true,
      },
      {
        id: "organisation",
        name: "Organisation",
        audience: "Pour plusieurs sites ou services",
        features: [
          "Rôles et permissions avancés",
          "Plusieurs sites et statistiques de fréquentation",
          "Séances de groupe jusqu'à 30 personnes",
          "Votre propre numéro WhatsApp",
        ],
        cta: "Choisir Organisation",
        mailSubject: "Jikū - offre Organisation",
      },
      {
        id: "enterprise",
        name: "Entreprise",
        audience: "Pour les réseaux et les besoins sur mesure",
        features: [
          "Hébergement dédié possible",
          "Engagement de service et accompagnement",
          "Intégrations sur demande",
          "Facturation annuelle",
        ],
        cta: "Contacter l'équipe commerciale",
        mailSubject: "Jikū - offre Entreprise",
      },
    ],
  },
  invite: {
    intro:
      "Vos invités entrent gratuitement ? Vous payez l'événement, une seule fois, selon sa taille. Vos 100 premiers invités de l'année sont offerts.",
    input: {
      label: "Nombre d'invités",
      helper: "Faites glisser ou saisissez un nombre.",
    },
    result: {
      freeLabel: "Gratuit",
      freeNote: "Couvert par vos 100 invités gratuits, cumulés sur 12 mois glissants.",
      tierLabel: "Palier",
      totalLabel: "Prix de l'événement",
      paymentNote: "Payé en une fois, au moment où vous dépassez la part gratuite. Pas d'acompte, pas de solde.",
      upgradeNote: "Plus d'invités que prévu ? Passer au palier supérieur ne fait payer que la différence.",
      customNote: "Au-delà de 1 000 invités : le prix Or, plus un petit montant par invité en plus.",
      perGuestNote: "{amount} par invité au-delà de 1 000.",
      surchargeLabel: "dont invitation interactive WhatsApp : {amount}",
    },
    modes: {
      heading: "Comment vos invités reçoivent leur billet",
      included: "Inclus",
      perGuest: "+ {amount} par invité",
      options: [
        {
          value: "link",
          title: "Lien d'invitation",
          description: "Un message avec le lien : l'invité répond sur sa page d'invitation.",
        },
        {
          value: "direct",
          title: "Billet direct",
          description: "Le billet arrive directement, prêt à scanner. Idéal pour une conférence ou des billets vendus.",
        },
        {
          value: "interactive",
          title: "Invitation interactive WhatsApp",
          description: "L'invité confirme d'un bouton dans WhatsApp et reçoit son billet dans la conversation.",
        },
      ],
    },
    ladder: {
      heading: "Les paliers",
      note: "Toutes les fonctionnalités à chaque palier. Seule la taille change.",
    },
    pack: {
      title: "Pack Organisateur",
      text: "Wedding planner, agence, salle de fêtes ? 1 000 invités par mois sur tous vos événements, chacun à la marque de votre client, avec votre propre numéro WhatsApp.",
      price: "{amount} par mois",
      cta: "Parler du Pack Organisateur",
      mailSubject: "Jikū - Pack Organisateur",
    },
  },
  sell: {
    soon: "Ouverture prochaine",
    intro:
      "Vous vendez vos billets ? Jikū prend 3 % du prix de chaque billet vendu, rien si rien n'est vendu. Ces billets ne comptent pas dans les paliers d'invités.",
    priceLabel: "Prix d'un billet",
    countLabel: "Billets mis en vente",
    commissionLabel: "Commission Jikū si tout est vendu",
    perTicketLabel: "par billet",
    trancheLabel: "Tranche de {size} billets",
    tranchesLabel: "{count} tranches au total",
    revenueLabel: "Vos ventes, versées chez vous",
    revenueNote: "L'argent des ventes arrive directement chez vous. Jikū ne le touche jamais.",
    steps: [
      { title: "Vous ouvrez la vente", text: "Votre toute première tranche de 50 billets est offerte. Ensuite, vous réglez la commission des 50 suivants, montant affiché avant de payer." },
      { title: "Vos billets se vendent", text: "Chaque billet payé consomme une place de la tranche. Tranche épuisée : vous réglez la suivante en un écran." },
      { title: "Jamais bloqué le jour J", text: "Le jour de l'événement, la vente et l'entrée continuent même si la tranche est épuisée. Ce qui n'a pas servi est reporté sur 12 mois." },
    ],
    verification:
      "Avant votre première vente, une vérification légère de votre identité protège vos acheteurs. Une vérification complète, facultative, vous donne le badge « Organisation vérifiée ».",
  },
  sms: "SMS en option : le prix exact s'affiche avant chaque envoi. L'e-mail et WhatsApp sont inclus.",
  both: {
    heading: "Et si vous faites les deux ?",
    text:
      "Une clinique paie son abonnement pour ses consultations, par médecin et secrétaire. Si elle organise une conférence payante de 200 billets à 20 000 GNF, elle paie 3 % sur ces billets : 120 000 GNF si tout est vendu. On paie ce que chaque ticket rend possible, jamais deux fois.",
  },
  payments: {
    heading: "Comment on paie",
    toJiku: {
      title: "Vous payez Jikū",
      text: "Le montant exact s'affiche avant le paiement, en un seul écran. Vous confirmez sur votre téléphone, la facture arrive aussitôt.",
      methods: [{ name: "Orange Money" }, { name: "MTN MoMo" }, { name: "Carte bancaire" }, { name: "Wave", soon: true }],
      soon: "bientôt",
    },
    toYou: {
      title: "Vos clients vous paient",
      text: "Sur vos numéros Mobile Money ou votre propre lien de paiement, affichés sur leur ticket. Jikū ne touche jamais leur argent.",
    },
  },
  cta: {
    heading: "Commencez gratuitement",
    text: "100 invités offerts chaque année et l'offre Solo gratuite pour toujours. Vous ne payez qu'au moment où vous en avez besoin.",
    primary: "Créer mon compte gratuit",
    secondary: "Voir les cas d'usage",
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
    title: "Jikū pricing and simulator: subscription, event or ticket sales",
    description:
      "Services: a subscription for your team, Solo free forever. Events: free up to 100 guests, then one price per event. Tickets sold: 3%. In GNF, CFA francs or dollars.",
  },
  eyebrow: "Pricing",
  title: "The right price, for what you actually do",
  rule:
    "You serve clients every day? A subscription. You run an event? You pay for the event: by guest count if they enter for free, 3% of tickets if you sell them.",
  onQuote: "On quote",
  currency: {
    label: "Currency",
    names: { GNF: "Guinean franc", FCFA: "CFA franc", USD: "US dollar" },
    note: "Same price everywhere: Guinean francs in Guinea, CFA francs (XOF in the WAEMU zone, XAF in the CEMAC zone), dollars elsewhere.",
  },
  finder: {
    heading: "Find your plan in three questions",
    text: "Answer, and we show you the model that fits and its price.",
    progress: "Question {current} of {total}",
    back: "Back",
    restart: "Start over",
    need: {
      question: "What do you want to do with Jikū?",
      options: [
        { value: "serve", title: "Serve clients", description: "Appointments, queues, bookings, every day." },
        { value: "invite", title: "Invite people", description: "Wedding, seminar, gala: guests enter for free." },
        { value: "sell", title: "Sell tickets", description: "Concert, party, training: people buy their seat." },
        { value: "both", title: "A bit of everything", description: "A daily service and events from time to time." },
      ],
    },
    servers: {
      question: "How many people serve your clients?",
      options: [
        { value: "one", title: "Just me", description: "A practice, a salon, a solo business." },
        { value: "few", title: "2 to 10", description: "A small team at the counter or in consultation." },
        { value: "many", title: "More than 10", description: "Several services, several agents, sometimes several sites." },
      ],
    },
    features: {
      question: "What do you need?",
      options: [
        { value: "email", title: "The essentials", description: "Booking link, today's queue and email reminders." },
        { value: "whatsapp", title: "WhatsApp reminders and a team", description: "Fewer no-shows and a console for everyone." },
        { value: "sites", title: "Several sites and statistics", description: "Group sessions up to 30, advanced roles, exports." },
        { value: "custom", title: "A dedicated deployment", description: "Custom hosting, service commitment, integrations." },
      ],
    },
    guests: {
      question: "How many guests do you expect?",
      options: [
        { value: "100", title: "Up to 100", description: "Covered by your 100 free guests of the year." },
        { value: "300", title: "101 to 300", description: "A wedding, a company seminar." },
        { value: "600", title: "301 to 600", description: "A conference, a large wedding." },
        { value: "1000", title: "601 to 1,000", description: "A gala, a general assembly." },
        { value: "more", title: "More than 1,000", description: "A fair, a festival: priced by guest count." },
      ],
    },
    sales: {
      question: "How many tickets do you expect to sell?",
      options: [
        { value: "small", title: "About a hundred", description: "A workshop, a training, an intimate evening." },
        { value: "medium", title: "A few hundred", description: "A party, a show, a paid conference." },
        { value: "large", title: "A thousand or more", description: "A concert, a festival." },
      ],
    },
    result: {
      eyebrow: "Our recommendation",
      plan: "{plan} subscription",
      tier: "Event, {tier} tier",
      commission: "3% of tickets sold",
      bothNote: "Your events stay paid per event, never folded into the subscription.",
      seeDetail: "See the detail",
      create: "Create my free account",
    },
  },
  tabs: {
    serve: "I serve clients",
    invite: "I invite people",
    sell: "I sell tickets",
  },
  services: {
    intro:
      "Appointments, queues and bookings: one subscription for your team, each month. Solo stays free forever. No limit on services or clients per day.",
    serversLabel: "People who serve your clients",
    serversHelper: "Doctor, counter agent, hairdresser, waiter.",
    monthly: "Monthly",
    yearly: "Yearly",
    yearlyBadge: "2 months free",
    perMonth: "per month",
    includes: "{count} included",
    extraPerson: "+ {amount} per extra person",
    perYear: "per year",
    saving: "{amount} saved per year by paying yearly",
    soloLimit: "Solo and Solo Plus cover one person: beyond that, move to Teams.",
    clientsPay: "Your clients can pay you for their ticket: no Jikū commission, ever.",
    freeRoles: "Administrators, entrance checkers and couriers are free.",
    plans: [
      {
        id: "solo",
        name: "Solo",
        audience: "For one person serving alone",
        features: [
          "Booking link and today's queue",
          "Email reminders, plus 50 WhatsApp reminders a month",
          "One client per slot",
          "Free forever, no card",
        ],
        cta: "Start for free",
        mailSubject: "Jikū - Solo plan",
      },
      {
        id: "soloPlus",
        name: "Solo Plus",
        audience: "For one person who wants fewer no-shows",
        features: [
          "Everything in Solo",
          "300 WhatsApp reminders a month",
          "Your brand, without “Powered by Jikū”",
          "Support on WhatsApp",
        ],
        cta: "Choose Solo Plus",
        mailSubject: "Jikū - Solo Plus plan",
      },
      {
        id: "teams",
        name: "Teams",
        audience: "For a team at the counter or in consultation",
        features: [
          "Priority support",
          "300 WhatsApp reminders per person a month",
          "A console per person, no account",
          "Group sessions up to 10 people",
        ],
        cta: "Choose Teams",
        mailSubject: "Jikū - Teams plan",
        highlight: true,
      },
      {
        id: "organisation",
        name: "Organisation",
        audience: "For several sites or services",
        features: [
          "Advanced roles and permissions",
          "Several sites and attendance statistics",
          "Group sessions up to 30 people",
          "Your own WhatsApp number",
        ],
        cta: "Choose Organisation",
        mailSubject: "Jikū - Organisation plan",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        audience: "For networks and custom needs",
        features: [
          "Dedicated hosting available",
          "Service commitment and onboarding",
          "Integrations on request",
          "Annual billing",
        ],
        cta: "Contact sales",
        mailSubject: "Jikū - Enterprise plan",
      },
    ],
  },
  invite: {
    intro:
      "Your guests enter for free? You pay for the event, once, by its size. Your first 100 guests of the year are on us.",
    input: {
      label: "Number of guests",
      helper: "Drag or type a number.",
    },
    result: {
      freeLabel: "Free",
      freeNote: "Covered by your 100 free guests, counted over a rolling 12 months.",
      tierLabel: "Tier",
      totalLabel: "Event price",
      paymentNote: "Paid once, when you go past the free allowance. No deposit, no balance.",
      upgradeNote: "More guests than planned? Moving up a tier only charges the difference.",
      customNote: "Beyond 1,000 guests: the Or price, plus a small amount per extra guest.",
      perGuestNote: "{amount} per guest beyond 1,000.",
      surchargeLabel: "including interactive WhatsApp invitations: {amount}",
    },
    modes: {
      heading: "How your guests receive their ticket",
      included: "Included",
      perGuest: "+ {amount} per guest",
      options: [
        {
          value: "link",
          title: "Invitation link",
          description: "A message with the link: the guest answers on their invitation page.",
        },
        {
          value: "direct",
          title: "Direct ticket",
          description: "The ticket arrives straight away, ready to scan. Ideal for a conference or sold tickets.",
        },
        {
          value: "interactive",
          title: "Interactive WhatsApp invitation",
          description: "The guest confirms with a button in WhatsApp and gets their ticket in the chat.",
        },
      ],
    },
    ladder: {
      heading: "The tiers",
      note: "Every feature at every tier. Only the size changes.",
    },
    pack: {
      title: "Organizer Pack",
      text: "Wedding planner, agency, venue? 1,000 guests a month across all your events, each in your client's brand, with your own WhatsApp number.",
      price: "{amount} per month",
      cta: "Talk about the Organizer Pack",
      mailSubject: "Jikū - Organizer Pack",
    },
  },
  sell: {
    soon: "Opening soon",
    intro:
      "You sell your tickets? Jikū takes 3% of the price of each ticket sold, nothing if nothing sells. These tickets don't count towards guest tiers.",
    priceLabel: "Ticket price",
    countLabel: "Tickets on sale",
    commissionLabel: "Jikū commission if everything sells",
    perTicketLabel: "per ticket",
    trancheLabel: "Tranche of {size} tickets",
    tranchesLabel: "{count} tranches in total",
    revenueLabel: "Your sales, paid to you",
    revenueNote: "Sales money goes straight to you. Jikū never touches it.",
    steps: [
      { title: "You open the sale", text: "Your very first tranche of 50 tickets is free. After that, you pay the commission on the next 50, amount shown before you pay." },
      { title: "Your tickets sell", text: "Each paid ticket uses one place in the tranche. When it runs out, you pay the next one in one screen." },
      { title: "Never blocked on the day", text: "On the event day, sales and entry continue even when the tranche runs out. Whatever goes unused carries over for 12 months." },
    ],
    verification:
      "Before your first sale, a light identity check protects your buyers. An optional full check gives you the “Verified organization” badge.",
  },
  sms: "SMS as an option: the exact price shows before each send. Email and WhatsApp are included.",
  both: {
    heading: "What if you do both?",
    text:
      "A clinic pays its subscription for consultations, per doctor and secretary. If it runs a paid conference of 200 tickets at 20,000 GNF, it pays 3% on those tickets: 120,000 GNF if all sell. You pay for what each ticket makes possible, never twice.",
  },
  payments: {
    heading: "How paying works",
    toJiku: {
      title: "You pay Jikū",
      text: "The exact amount shows before you pay, in one screen. You confirm on your phone and the invoice arrives right away.",
      methods: [{ name: "Orange Money" }, { name: "MTN MoMo" }, { name: "Card" }, { name: "Wave", soon: true }],
      soon: "soon",
    },
    toYou: {
      title: "Your clients pay you",
      text: "To your Mobile Money numbers or your own payment link, shown on their ticket. Jikū never touches their money.",
    },
  },
  cta: {
    heading: "Start for free",
    text: "100 free guests every year and the Solo plan free forever. You only pay when you need to.",
    primary: "Create my free account",
    secondary: "See use cases",
  },
  nav: {
    home: "Home",
    signIn: "Sign in",
    createAccount: "Create account",
    switchLocale: { label: "FR", href: "/simulator", ariaLabel: "Lire cette page en français" },
  },
};

export const SIMULATOR_CONTENT: Record<LandingLocale, SimulatorContent> = { fr, en };
