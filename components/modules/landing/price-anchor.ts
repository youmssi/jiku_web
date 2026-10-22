import {
  EVENT_PRICING,
  FREE_OFFER,
  ORGANIZER_PACK,
  priceIn,
  SERVICES_PRO,
  TICKET_SALES,
  type PriceList,
  type PricingCurrency,
} from "@/lib/pricing";
import type { LandingLocale, LandingPriceAnchor } from "./content";

// Every amount the marketing pages write out comes from `lib/pricing.ts`, the
// same figures the pricing page computes with (JIKU-195, JIKU-197, ADR 109):
// a price change is made once and shows the same everywhere.

const ANCHORS: Record<Exclude<LandingPriceAnchor, null>, PriceList> = {
  perGuest: EVENT_PRICING.perGuest,
  pack: ORGANIZER_PACK.monthly,
  servicesPro: SERVICES_PRO.perPerson,
};

const NUMBER_LOCALE: Record<LandingLocale, string> = { fr: "fr-FR", en: "en-US" };

/** A whole number as the locale writes it: "1 000" in French, "1,000" in English. */
function count(value: number, locale: LandingLocale): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale]).format(value);
}

/**
 * An amount in [currency]'s minor unit, as the locale writes it, always with
 * the currency named (JIKU-270): "750 GNF", "50 FCFA", "0,09 $US", "$72".
 * Dollars keep their cents only when they have some.
 */
export function formatAmount(amountMinor: number, locale: LandingLocale, currency: PricingCurrency): string {
  if (currency !== "USD") return `${count(amountMinor, locale)} ${currency}`;
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

/** A published price in the one currency the visitor reads (JIKU-270). */
export function formatPrice(price: PriceList, locale: LandingLocale, currency: PricingCurrency): string {
  return formatAmount(priceIn(price, currency), locale, currency);
}

/** The price a pricing caption quotes in place of `{price}`. */
export function priceAnchor(anchor: LandingPriceAnchor, locale: LandingLocale, currency: PricingCurrency): string {
  return anchor ? formatPrice(ANCHORS[anchor], locale, currency) : "";
}

/** The FAQ's three pricing answers, written from the published figures. */
export function pricingAnswers(
  locale: LandingLocale,
  currency: PricingCurrency,
): { events: string; services: string; sales: string } {
  const price = (list: PriceList) => formatPrice(list, locale, currency);
  const rate = `${Math.round(TICKET_SALES.commissionRate * 100)}${locale === "fr" ? " %" : "%"}`;
  const tranche = TICKET_SALES.trancheSize;
  const free = FREE_OFFER.guestsPerYear;
  const included = count(ORGANIZER_PACK.includedGuests, locale);

  if (locale === "fr") {
    return {
      events:
        `C'est gratuit jusqu'à ${free} invités cumulés sur l'année. Au-delà, chaque invité coûte ${price(EVENT_PRICING.perGuest)}, tout compris : ` +
        `réponse dans WhatsApp, billet et contrôle à l'entrée. Vous organisez beaucoup d'événements ? Pro Organisateur couvre ${included} invités par mois ` +
        `pour ${price(ORGANIZER_PACK.monthly)}. Pour une carte partagée, seuls les « oui » et leurs accompagnants comptent. Prix toutes taxes comprises.`,
      services:
        `Solo est gratuit pour toujours pour une personne. Services Pro coûte ${price(SERVICES_PRO.perPerson)} par personne et par mois, ` +
        `avec des séances de groupe jusqu'à ${SERVICES_PRO.groupSize} clients et ${count(SERVICES_PRO.remindersPerPerson, "fr")} rappels WhatsApp par personne. ` +
        `Les administrateurs et les contrôleurs sont gratuits, et aucune commission n'est prise sur vos clients.`,
      sales:
        `Jikū prend ${rate} du prix de chaque billet vendu, rien si rien n'est vendu. L'argent des ventes arrive directement chez vous ; ` +
        `la commission se règle d'avance, par tranche de ${tranche} billets, votre première tranche est offerte, et ce qui n'a pas servi est reporté.`,
    };
  }
  return {
    events:
      `It's free up to ${free} guests a year. Beyond that, each guest costs ${price(EVENT_PRICING.perGuest)}, all included: ` +
      `answers in WhatsApp, ticket and door check. Running many events? Pro Organizer covers ${included} guests a month ` +
      `for ${price(ORGANIZER_PACK.monthly)}. For a shared card, only the yeses and their companions count. Prices include all taxes.`,
    services:
      `Solo is free forever for one person. Services Pro costs ${price(SERVICES_PRO.perPerson)} per person per month, ` +
      `with group sessions of up to ${SERVICES_PRO.groupSize} clients and ${count(SERVICES_PRO.remindersPerPerson, "en")} WhatsApp reminders per person. ` +
      `Administrators and door staff are free, and no commission is taken on your clients.`,
    sales:
      `Jikū takes ${rate} of the price of each ticket sold, nothing if nothing sells. Sales money goes straight to you; ` +
      `the commission is paid ahead, by tranche of ${tranche} tickets, your first tranche is free, and anything unused carries over.`,
  };
}
