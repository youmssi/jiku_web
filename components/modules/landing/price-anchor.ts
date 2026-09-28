import {
  EVENT_PRICING,
  INTERACTIVE_SURCHARGE,
  SERVICE_PLANS,
  TICKET_SALES,
  servicePlan,
  type PriceList,
} from "@/lib/pricing";
import type { LandingLocale, LandingPriceAnchor } from "./content";

// Every amount the marketing pages write out comes from `lib/pricing.ts`, the
// same figures the simulator computes with (JIKU-195, JIKU-197): a price
// change is made once and shows the same everywhere.

const ANCHORS: Record<Exclude<LandingPriceAnchor, null>, () => PriceList | null> = {
  firstEventTier: () => EVENT_PRICING.tiers[0].price,
  teams: () => SERVICE_PLANS.find((plan) => plan.id === "teams")?.monthly ?? null,
};

const NUMBER_LOCALE: Record<LandingLocale, string> = { fr: "fr-FR", en: "en-US" };

/** A whole number as the locale writes it: "1 000" in French, "1,000" in English. */
function count(value: number, locale: LandingLocale): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale]).format(value);
}

/**
 * A published price: francs first in French, dollars first in English, the
 * other currency in brackets. Dollars keep their cents only when they have
 * some ("$25", "$0.06").
 */
export function formatPrice(price: PriceList, locale: LandingLocale): string {
  if (locale === "fr") return `${count(price.gnf, "fr")} GNF (${count(price.fcfa, "fr")} FCFA)`;
  const dollars = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${dollars.format(price.usdCents / 100)} (${count(price.gnf, "en")} GNF)`;
}

/** The price a pricing caption quotes in place of `{price}`. */
export function priceAnchor(anchor: LandingPriceAnchor, locale: LandingLocale): string {
  const price = anchor ? ANCHORS[anchor]() : null;
  return price ? formatPrice(price, locale) : "";
}

/** The FAQ's three pricing answers, written from the published figures. */
export function pricingAnswers(locale: LandingLocale): { events: string; services: string; sales: string } {
  const [bronze, silver, gold] = EVENT_PRICING.tiers;
  const price = (list: PriceList) => formatPrice(list, locale);
  const soloPlus = servicePlan("soloPlus");
  const teams = servicePlan("teams");
  const rate = `${Math.round(TICKET_SALES.commissionRate * 100)}${locale === "fr" ? " %" : "%"}`;
  const tranche = TICKET_SALES.trancheSize;
  const free = EVENT_PRICING.freeTierGuests;

  if (locale === "fr") {
    return {
      events:
        `C'est gratuit jusqu'à ${free} invités cumulés sur l'année. Au-delà, un montant unique par événement selon le nombre d'invités : ` +
        `${price(bronze.price)} jusqu'à ${count(bronze.maxGuests, "fr")}, ${price(silver.price)} jusqu'à ${count(silver.maxGuests, "fr")}, ` +
        `${price(gold.price)} jusqu'à ${count(gold.maxGuests, "fr")}, puis ${price(EVENT_PRICING.beyondPerGuest)} par invité en plus. ` +
        `L'invitation interactive WhatsApp ajoute ${price(INTERACTIVE_SURCHARGE)} par invité. ` +
        `Pour une carte partagée, seuls les « oui » et leurs accompagnants comptent.`,
      services:
        `C'est un abonnement pour votre équipe, par mois : Solo est gratuit pour toujours pour une personne, ` +
        `Solo Plus coûte ${soloPlus.monthly ? price(soloPlus.monthly) : ""}, Teams ${teams.monthly ? price(teams.monthly) : ""} ` +
        `pour ${teams.includedPeople} personnes puis ${teams.extraPerson ? price(teams.extraPerson) : ""} par personne en plus. ` +
        `Les administrateurs et les contrôleurs sont gratuits, et aucune commission n'est prise sur vos clients.`,
      sales:
        `Jikū prend ${rate} du prix de chaque billet vendu, rien si rien n'est vendu. L'argent des ventes arrive directement chez vous ; ` +
        `la commission se règle d'avance, par tranche de ${tranche} billets, votre première tranche est offerte, et ce qui n'a pas servi est reporté.`,
    };
  }
  return {
    events:
      `It's free up to ${free} guests a year. Beyond that, one payment per event based on guest count: ` +
      `${price(bronze.price)} up to ${count(bronze.maxGuests, "en")}, ${price(silver.price)} up to ${count(silver.maxGuests, "en")}, ` +
      `${price(gold.price)} up to ${count(gold.maxGuests, "en")}, then ${price(EVENT_PRICING.beyondPerGuest)} per extra guest. ` +
      `Interactive WhatsApp invitations add ${price(INTERACTIVE_SURCHARGE)} per guest. ` +
      `For a shared card, only the yeses and their companions count.`,
    services:
      `It's a subscription for your team, per month: Solo is free forever for one person, ` +
      `Solo Plus costs ${soloPlus.monthly ? price(soloPlus.monthly) : ""}, Teams ${teams.monthly ? price(teams.monthly) : ""} ` +
      `for ${teams.includedPeople} people then ${teams.extraPerson ? price(teams.extraPerson) : ""} per extra person. ` +
      `Administrators and door staff are free, and no commission is taken on your clients.`,
    sales:
      `Jikū takes ${rate} of the price of each ticket sold, nothing if nothing sells. Sales money goes straight to you; ` +
      `the commission is paid ahead, by tranche of ${tranche} tickets, your first tranche is free, and anything unused carries over.`,
  };
}
