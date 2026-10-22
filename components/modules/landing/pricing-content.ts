// CONTRACT — every word on the /pricing page, in both locales (ADR 109).
// Figures come from lib/pricing.ts through `formatPrice`, so a price change is
// made once and shows the same everywhere.

import {
  EVENT_PRICING,
  FREE_OFFER,
  ORGANIZER_PACK,
  perEventCost,
  SERVICES_PRO,
  DEFAULT_CURRENCY,
  TICKET_SALES,
  type PricingCurrency,
} from "@/lib/pricing";
import { ROUTES, SEO_ROUTES } from "@/lib/constants";
import type { LandingLocale } from "./content";
import type { MarketingNavContent } from "./marketing-header";
import { formatAmount, formatPrice } from "./price-anchor";

export type PricingOfferId = "free" | "event" | "pack" | "services";

export interface PricingOffer {
  id: PricingOfferId;
  name: string;
  audience: string;
  price: string;
  unit: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}

/** One line of the comparison table: a label and one cell per offer, in the order of `offers`. */
export interface PricingCompareRow {
  label: string;
  values: (string | boolean)[];
}

export interface PricingContent {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  rule: string;
  taxNote: string;
  offers: PricingOffer[];
  enterprise: { text: string; cta: string; mailSubject: string };
  compare: { heading: string; included: string; notIncluded: string; rows: PricingCompareRow[] };
  calculator: {
    heading: string;
    text: string;
    question: string;
    helper: string;
    currencyLabel: string;
    perEvent: string;
    pack: string;
    perMonth: string;
    cheaper: string;
    packWins: string;
    eventWins: string;
    breakEven: string;
    freeNote: string;
  };
  extras: { heading: string; items: { title: string; text: string }[] };
  payments: {
    heading: string;
    toJiku: { title: string; text: string; methods: { name: string; soon?: boolean }[]; soon: string };
    toYou: { title: string; text: string };
  };
  cta: { heading: string; text: string; primary: string; secondary: string };
  nav: MarketingNavContent;
}

const number = (value: number, locale: LandingLocale) =>
  new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US").format(value);
const rate = (locale: LandingLocale) => `${Math.round(TICKET_SALES.commissionRate * 100)}${locale === "fr" ? " %" : "%"}`;

function fr(currency: PricingCurrency): PricingContent {
  return {
    meta: {
      title: "Tarifs : gratuit, par événement ou Pro",
      description: `${number(FREE_OFFER.guestsPerYear, "fr")} invités gratuits par an, puis ${formatPrice(EVENT_PRICING.perGuest, "fr", "GNF")} (${formatPrice(EVENT_PRICING.perGuest, "fr", "FCFA")}) par invité, tout compris. Pro Organisateur et Services Pro pour les professionnels. Prix toutes taxes comprises.`,
    },
    eyebrow: "Tarifs",
    title: "Un prix par invité. Rien d'autre à calculer.",
    rule: "Vous payez les invités de votre événement, ou un forfait mensuel si vous en organisez beaucoup. La réponse dans WhatsApp, les billets et le contrôle à l'entrée sont toujours inclus.",
    taxNote: "Prix toutes taxes comprises : le montant affiché est le montant payé.",
    offers: [
      {
        id: "free",
        name: "Gratuit",
        audience: "Pour essayer, sans carte",
        price: "Gratuit",
        unit: "pour toujours",
        features: [
          `${number(FREE_OFFER.guestsPerYear, "fr")} invités par an, sur tous vos événements`,
          "Réponse dans WhatsApp, billets QR et contrôle inclus",
          `Solo : une personne qui reçoit des clients, ${FREE_OFFER.soloWhatsAppReminders} rappels WhatsApp par mois`,
        ],
        cta: "Créer mon compte",
        href: ROUTES.REGISTER,
      },
      {
        id: "event",
        name: "Par événement",
        audience: "Un événement de temps en temps",
        price: formatPrice(EVENT_PRICING.perGuest, "fr", currency),
        unit: "par invité",
        features: [
          `Un mariage de 300 invités, vos ${number(FREE_OFFER.guestsPerYear, "fr")} invités gratuits déduits : ${formatAmount(perEventCost(300 - FREE_OFFER.guestsPerYear, currency), "fr", currency)}`,
          "Tout inclus : WhatsApp, billets, contrôle hors ligne",
          "Des invités en plus ? Vous ne payez que les nouveaux",
        ],
        cta: "Créer mon événement",
        href: ROUTES.REGISTER,
      },
      {
        id: "pack",
        name: "Pro Organisateur",
        audience: "Wedding planners, agences, salles",
        price: formatPrice(ORGANIZER_PACK.monthly, "fr", currency),
        unit: "par mois",
        features: [
          `${number(ORGANIZER_PACK.includedGuests, "fr")} invités par mois sur tous vos événements`,
          `Puis ${formatPrice(ORGANIZER_PACK.extraPerGuest, "fr", currency)} par invité`,
          "Chaque événement aux couleurs de votre client",
        ],
        cta: "Choisir Pro Organisateur",
        href: SEO_ROUTES.ORGANIZERS,
        highlight: true,
      },
      {
        id: "services",
        name: "Services Pro",
        audience: "Salons, cliniques, coachs, guichets",
        price: formatPrice(SERVICES_PRO.perPerson, "fr", currency),
        unit: "par personne et par mois",
        features: [
          "Seules les personnes qui reçoivent des clients comptent",
          `Séances de groupe jusqu'à ${SERVICES_PRO.groupSize} clients`,
          `${number(SERVICES_PRO.remindersPerPerson, "fr")} rappels WhatsApp par personne et par mois`,
        ],
        cta: "Choisir Services Pro",
        href: ROUTES.REGISTER,
      },
    ],
    enterprise: {
      text: "Un réseau, de gros volumes ou un besoin sur mesure ?",
      cta: "Parlons de l'offre Entreprise",
      mailSubject: "Jikū - offre Entreprise",
    },
    compare: {
      heading: "Ce que chaque offre comprend",
      included: "Inclus",
      notIncluded: "Non inclus",
      rows: [
        {
          label: "Invités",
          values: [`${number(FREE_OFFER.guestsPerYear, "fr")} par an`, "Ceux que vous payez", `${number(ORGANIZER_PACK.includedGuests, "fr")} par mois`, false],
        },
        { label: "Réponse dans WhatsApp, billets QR, contrôle hors ligne", values: [true, true, true, false] },
        { label: "Personnes qui reçoivent des clients", values: ["1", false, false, "Autant qu'il faut"] },
        { label: "Clients par séance de groupe", values: ["1", false, false, `Jusqu'à ${SERVICES_PRO.groupSize}`] },
        {
          label: "Rappels WhatsApp de rendez-vous",
          values: [`${FREE_OFFER.soloWhatsAppReminders} par mois`, false, false, `${number(SERVICES_PRO.remindersPerPerson, "fr")} par personne et par mois`],
        },
        { label: "Votre propre numéro WhatsApp, gratuit", values: [true, true, true, true] },
        { label: "Paiement à l'année : 2 mois offerts", values: [false, false, true, true] },
        { label: `Vente de billets : ${rate("fr")} par billet vendu`, values: [true, true, true, true] },
      ],
    },
    calculator: {
      heading: "Par événement ou Pro Organisateur ?",
      text: "Une seule question pour savoir ce qui vous coûte le moins.",
      question: "Combien d'invités par mois, tous événements confondus ?",
      helper: "Faites glisser ou saisissez un nombre.",
      currencyLabel: "Monnaie",
      perEvent: "Par événement",
      pack: "Pro Organisateur",
      perMonth: "par mois",
      cheaper: "Le moins cher",
      packWins: "Pro Organisateur vous fait économiser {amount} par mois.",
      eventWins: "Payer à l'événement vous fait économiser {amount} par mois.",
      breakEven: "Pro Organisateur devient moins cher dès {count} invités par mois.",
      freeNote: `Vos ${number(FREE_OFFER.guestsPerYear, "fr")} premiers invités de l'année restent gratuits dans les deux cas.`,
    },
    extras: {
      heading: "Bon à savoir",
      items: [
        {
          title: "Vente de billets",
          text: `Jikū prend ${rate("fr")} du prix de chaque billet vendu, rien si rien n'est vendu. Vos ${TICKET_SALES.trancheSize} premiers billets sont offerts, et l'argent des ventes arrive directement chez vous.`,
        },
        {
          title: "Votre propre numéro WhatsApp",
          text: `Vos messages partent de votre numéro, avec votre nom, et vos contacts restent les vôtres. Gratuit dans toutes les offres : Meta vous facture alors directement vos messages, et le guide vous montre les étapes chez Meta.`,
        },
        {
          title: "Carte partagée",
          text: "Pour une invitation partagée dans vos groupes, seuls les « oui » et leurs accompagnants comptent comme invités.",
        },
      ],
    },
    payments: {
      heading: "Comment on paie",
      toJiku: {
        title: "Vous payez Jikū",
        text: "Le montant exact s'affiche avant le paiement. Vous l'envoyez par Mobile Money ou par virement avec la référence indiquée : notre équipe confirme et active, en général en quelques heures, et la facture arrive dans votre espace.",
        methods: [{ name: "Orange Money" }, { name: "MTN MoMo" }, { name: "Virement bancaire" }, { name: "Paiement en ligne", soon: true }],
        soon: "bientôt",
      },
      toYou: {
        title: "Vos clients vous paient",
        text: "Sur vos numéros Mobile Money ou votre propre lien de paiement, affichés sur leur ticket. Jikū ne touche jamais leur argent.",
      },
    },
    cta: {
      heading: "Commencez gratuitement",
      text: `${number(FREE_OFFER.guestsPerYear, "fr")} invités offerts chaque année et Solo gratuit pour toujours. Vous ne payez qu'au moment où vous en avez besoin.`,
      primary: "Créer mon compte gratuit",
      secondary: "Voir les cas d'usage",
    },
    nav: {
      home: "Accueil",
      signIn: "Se connecter",
      createAccount: "Créer un compte",
      switchLocale: { label: "EN", locale: "en", ariaLabel: "Read this page in English" },
    },
  };
}

function en(currency: PricingCurrency): PricingContent {
  return {
    meta: {
      title: "Pricing: free, per event or Pro",
      description: `${number(FREE_OFFER.guestsPerYear, "en")} free guests a year, then ${formatPrice(EVENT_PRICING.perGuest, "en", "USD")} (${formatPrice(EVENT_PRICING.perGuest, "en", "GNF")}) per guest, all included. Pro Organizer and Services Pro for professionals. Prices include all taxes.`,
    },
    eyebrow: "Pricing",
    title: "One price per guest. Nothing else to work out.",
    rule: "You pay for your event's guests, or a monthly plan if you run many. Answers in WhatsApp, tickets and the door check are always included.",
    taxNote: "Prices include all taxes: the amount shown is the amount you pay.",
    offers: [
      {
        id: "free",
        name: "Free",
        audience: "To try it, no card needed",
        price: "Free",
        unit: "forever",
        features: [
          `${number(FREE_OFFER.guestsPerYear, "en")} guests a year, across all your events`,
          "WhatsApp answers, QR tickets and door check included",
          `Solo: one person who serves clients, ${FREE_OFFER.soloWhatsAppReminders} WhatsApp reminders a month`,
        ],
        cta: "Create my account",
        href: ROUTES.REGISTER,
      },
      {
        id: "event",
        name: "Per event",
        audience: "An event now and then",
        price: formatPrice(EVENT_PRICING.perGuest, "en", currency),
        unit: "per guest",
        features: [
          `A 300-guest wedding, your ${number(FREE_OFFER.guestsPerYear, "en")} free guests taken off: ${formatAmount(perEventCost(300 - FREE_OFFER.guestsPerYear, currency), "en", currency)}`,
          "All included: WhatsApp, tickets, offline door check",
          "More guests? You only pay for the new ones",
        ],
        cta: "Create my event",
        href: ROUTES.REGISTER,
      },
      {
        id: "pack",
        name: "Pro Organizer",
        audience: "Wedding planners, agencies, venues",
        price: formatPrice(ORGANIZER_PACK.monthly, "en", currency),
        unit: "per month",
        features: [
          `${number(ORGANIZER_PACK.includedGuests, "en")} guests a month across all your events`,
          `Then ${formatPrice(ORGANIZER_PACK.extraPerGuest, "en", currency)} per guest`,
          "Each event in your client's colors",
        ],
        cta: "Choose Pro Organizer",
        href: SEO_ROUTES.ORGANIZERS,
        highlight: true,
      },
      {
        id: "services",
        name: "Services Pro",
        audience: "Salons, clinics, coaches, front desks",
        price: formatPrice(SERVICES_PRO.perPerson, "en", currency),
        unit: "per person per month",
        features: [
          "Only the people who serve clients count",
          `Group sessions of up to ${SERVICES_PRO.groupSize} clients`,
          `${number(SERVICES_PRO.remindersPerPerson, "en")} WhatsApp reminders per person per month`,
        ],
        cta: "Choose Services Pro",
        href: ROUTES.REGISTER,
      },
    ],
    enterprise: {
      text: "A network, large volumes or a custom need?",
      cta: "Let's talk about Enterprise",
      mailSubject: "Jikū - Enterprise plan",
    },
    compare: {
      heading: "What each plan includes",
      included: "Included",
      notIncluded: "Not included",
      rows: [
        {
          label: "Guests",
          values: [`${number(FREE_OFFER.guestsPerYear, "en")} a year`, "Those you pay for", `${number(ORGANIZER_PACK.includedGuests, "en")} a month`, false],
        },
        { label: "WhatsApp answers, QR tickets, offline door check", values: [true, true, true, false] },
        { label: "People who serve clients", values: ["1", false, false, "As many as you need"] },
        { label: "Clients per group session", values: ["1", false, false, `Up to ${SERVICES_PRO.groupSize}`] },
        {
          label: "WhatsApp appointment reminders",
          values: [`${FREE_OFFER.soloWhatsAppReminders} a month`, false, false, `${number(SERVICES_PRO.remindersPerPerson, "en")} per person per month`],
        },
        { label: "Your own WhatsApp number, free", values: [true, true, true, true] },
        { label: "Yearly payment: 2 months free", values: [false, false, true, true] },
        { label: `Ticket sales: ${rate("en")} per ticket sold`, values: [true, true, true, true] },
      ],
    },
    calculator: {
      heading: "Per event or Pro Organizer?",
      text: "One question to find what costs you less.",
      question: "How many guests a month, across all your events?",
      helper: "Drag or type a number.",
      currencyLabel: "Currency",
      perEvent: "Per event",
      pack: "Pro Organizer",
      perMonth: "per month",
      cheaper: "Cheapest",
      packWins: "Pro Organizer saves you {amount} a month.",
      eventWins: "Paying per event saves you {amount} a month.",
      breakEven: "Pro Organizer becomes cheaper from {count} guests a month.",
      freeNote: `Your first ${number(FREE_OFFER.guestsPerYear, "en")} guests of the year stay free either way.`,
    },
    extras: {
      heading: "Good to know",
      items: [
        {
          title: "Ticket sales",
          text: `Jikū takes ${rate("en")} of the price of each ticket sold, nothing if nothing sells. Your first ${TICKET_SALES.trancheSize} tickets are free, and sales money goes straight to you.`,
        },
        {
          title: "Your own WhatsApp number",
          text: `Your messages go out from your number, with your name, and your contacts stay yours. Free in every plan: Meta then bills your messages to you directly, and the guide walks you through Meta's steps.`,
        },
        {
          title: "Shared card",
          text: "For an invitation shared in your groups, only the yeses and their companions count as guests.",
        },
      ],
    },
    payments: {
      heading: "How payment works",
      toJiku: {
        title: "You pay Jikū",
        text: "The exact amount shows before you pay. You send it by Mobile Money or bank transfer with the reference shown: our team confirms and activates, usually within a few hours, and the invoice arrives in your space.",
        methods: [{ name: "Orange Money" }, { name: "MTN MoMo" }, { name: "Bank transfer" }, { name: "Online payment", soon: true }],
        soon: "soon",
      },
      toYou: {
        title: "Your clients pay you",
        text: "On your Mobile Money numbers or your own payment link, shown on their ticket. Jikū never touches their money.",
      },
    },
    cta: {
      heading: "Start for free",
      text: `${number(FREE_OFFER.guestsPerYear, "en")} free guests every year and Solo free forever. You only pay when you need to.`,
      primary: "Create my free account",
      secondary: "See use cases",
    },
    nav: {
      home: "Home",
      signIn: "Sign in",
      createAccount: "Create an account",
      switchLocale: { label: "FR", locale: "fr", ariaLabel: "Lire cette page en français" },
    },
  };
}

const BUILDERS: Record<LandingLocale, (currency: PricingCurrency) => PricingContent> = { fr, en };

/** The /pricing page in [locale], its prices in [currency]. */
export function pricingContent(locale: LandingLocale, currency: PricingCurrency): PricingContent {
  return BUILDERS[locale](currency);
}

/** The page in each locale's default currency, for its metadata. */
export const PRICING_CONTENT: Record<LandingLocale, PricingContent> = {
  fr: fr(DEFAULT_CURRENCY.fr),
  en: en(DEFAULT_CURRENCY.en),
};
