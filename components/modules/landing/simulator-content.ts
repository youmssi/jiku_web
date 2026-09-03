// CONTRACT — every word on the /simulator pricing playground, in both locales.
// Same rules as content.ts: no invented numbers, no claims the product cannot
// evidence. Pricing figures are supplied by lib/pricing.ts (which mirrors the
// backend), not duplicated here.

import type { LandingLocale } from "./content";

export interface SimulatorContent {
  meta: {
    title: string;
    description: string;
  };
  eyebrow: string;
  title: string;
  intro: string;
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
    title: "Simulateur de prix Jikū — Combien coûte mon événement ?",
    description:
      "Indiquez votre nombre d'invités et voyez immédiatement le palier et le prix de votre événement. Gratuit jusqu'à 100 invités, puis un prix unique par événement, sans abonnement.",
  },
  eyebrow: "Simulateur de prix",
  title: "Combien coûte votre événement ?",
  intro:
    "Indiquez le nombre d'invités que vous attendez : le palier et le prix s'affichent immédiatement. Gratuit jusqu'à 100 invités, puis un montant unique par événement. Aucun abonnement, aucune carte bancaire.",
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
    customNote: "Tarif estimé sur la base de la formule sur mesure. L'équipe commerciale vous confirme le montant exact.",
    perGuestNote: "Au-delà de 1 000 invités, tarif sur mesure : 0,05 $/invité + 15 $ de mise en place.",
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
    title: "Jikū pricing simulator — How much does my event cost?",
    description:
      "Enter your guest count and see your event's tier and price instantly. Free for up to 100 guests, then one flat price per event, no subscription.",
  },
  eyebrow: "Pricing simulator",
  title: "How much does your event cost?",
  intro:
    "Enter the number of guests you expect: the tier and price update instantly. Free for up to 100 guests, then one flat amount per event. No subscription, no card required.",
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
    perGuestNote: "Beyond 1,000 guests, custom pricing: $0.05/guest + $15 setup.",
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
  },
  nav: {
    home: "Home",
    signIn: "Sign in",
    createAccount: "Create account",
    switchLocale: { label: "FR", href: "/simulator", ariaLabel: "Lire cette page en français" },
  },
};

export const SIMULATOR_CONTENT: Record<LandingLocale, SimulatorContent> = { fr, en };
