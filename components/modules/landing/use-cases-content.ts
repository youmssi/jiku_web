// CONTRACT — every word on the dedicated use-cases page, in both locales. The
// same rules as content.ts: no invented numbers, no testimonials that did not
// happen, no claims the product cannot evidence. The promise/proof pairs come
// from the per-segment messaging in docs/jiku-ticket-platform-evolution.md §7;
// every case listed is sellable today with the shipped product (its §3 list).

import type { LandingLocale } from "./content";

export interface UseCaseEntry {
  title: string;
  /** The segment promise — the one line that closes the sale. */
  promise: string;
  /** The concrete evidence behind the promise. */
  proof: string;
  description: string;
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
  categories: {
    title: string;
    /** Category-level tagline. */
    promise: string;
    cases: UseCaseEntry[];
  }[];
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
    title: "Cas d'usage Jikū — Mariage, séminaire, assemblée générale, formation",
    description:
      "Mariages, baptêmes, séminaires, assemblées générales, formations financées : découvrez comment Jikū supprime l'attente et le désordre à la porte, quel que soit votre événement.",
    keywords: [
      "invitation mariage guinée",
      "assemblée générale quorum",
      "feuille d'émargement formation",
      "invitation séminaire",
      "billetterie événement conakry",
      "check-in QR code",
    ],
  },
  eyebrow: "Un outil, tous vos événements",
  title: "Fini l'attente et le désordre à la porte.",
  intro:
    "Mariage, séminaire, assemblée générale ou formation : Jikū supprime la file d'attente et la confusion à l'entrée. Un même outil — la seule chose qui change, c'est le nombre d'invités et ce que vous devez prouver.",
  categories: [
    {
      title: "Cérémonies & célébrations",
      promise: "La porte reste ouverte aux vôtres, fermée aux autres.",
      cases: [
        {
          title: "Mariages & baptêmes",
          promise: "Aucun resquilleur, aucune file à la porte",
          proof: "Arrivées en direct, scan hors-ligne",
          description:
            "Vos invités confirment depuis WhatsApp, présentent leur billet QR le jour J, et vous savez exactement qui est arrivé. La liste papier reste au placard.",
        },
        {
          title: "Fiançailles & dot",
          promise: "Une deuxième cérémonie, le même calme",
          proof: "Le même compte, un événement de plus",
          description:
            "Chaque étape de la cérémonie s'organise sur le même compte, sans refaire la liste des invités à chaque fois.",
        },
      ],
    },
    {
      title: "Événements professionnels",
      promise: "Une entrée à la hauteur de votre image.",
      cases: [
        {
          title: "Séminaires & galas d'entreprise",
          promise: "Une entrée digne de votre image",
          proof: "Marque blanche + entrée rapide",
          description:
            "Votre logo, vos couleurs, et une entrée qui ne s'enlise pas. Chaque billet ne passe qu'une seule fois, quoi qu'il arrive.",
        },
        {
          title: "Conférences de presse & lancements",
          promise: "Une liste d'accès maîtrisée",
          proof: "Le protocole devient la liste d'invités",
          description:
            "Chaque journaliste ou partenaire accrédité reçoit son accès, contrôlé à l'entrée d'un simple scan.",
        },
        {
          title: "Inaugurations & cérémonies officielles",
          promise: "Le protocole respecté à la porte",
          proof: "Liste protocolaire = liste d'invités",
          description:
            "Les personnalités sont attendues, identifiées et accueillies dans l'ordre voulu, sans heurt ni confusion.",
        },
        {
          title: "Remises de diplômes & portes ouvertes",
          promise: "Chaque lauréat reconnu",
          proof: "Scan nominatif à l'entrée",
          description:
            "Chaque diplômé et sa famille sont attendus et accueillis, sans file interminable à l'accueil.",
        },
      ],
    },
    {
      title: "Institutionnel & associatif",
      promise: "Des preuves, pas des promesses.",
      cases: [
        {
          title: "Assemblées générales",
          promise: "Un quorum incontestable, horodaté",
          proof: "Registre horodaté et opposable",
          description:
            "Le quorum se compte en direct et reste opposable. La feuille d'émargement se génère toute seule, sans reconstitution à la main.",
        },
        {
          title: "Formations & ateliers financés",
          promise: "La preuve de présence exigée par le bailleur",
          proof: "Attestation et émargement automatiques",
          description:
            "Chaque participant repart avec une attestation nominative, et vous fournissez la preuve de présence que votre financeur demande.",
        },
        {
          title: "Réunions de diaspora & ressortissants",
          promise: "Organiser à distance",
          proof: "Fuseau horaire par événement",
          description:
            "Votre événement s'affiche dans son propre fuseau horaire, où que vos membres se trouvent dans le monde.",
        },
      ],
    },
  ],
  cta: {
    heading: "Votre événement mérite une porte sereine.",
    text: "Créez un compte gratuit, importez dix invités, envoyez-vous une invitation : en cinq minutes vous saurez si Jikū est fait pour vous.",
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
    title: "Jikū use cases — Weddings, seminars, general assemblies, training",
    description:
      "Weddings, baptisms, seminars, general assemblies, funded training: see how Jikū removes the wait and the disorder at the door, whatever your event.",
    keywords: [
      "wedding invitations guinea",
      "general assembly quorum",
      "training attendance register",
      "seminar invitations",
      "event ticketing conakry",
      "QR check-in",
    ],
  },
  eyebrow: "One tool, every event",
  title: "No more waiting and disorder at the door.",
  intro:
    "Wedding, seminar, general assembly or training: Jikū removes the queue and the confusion at the entrance. One tool — the only thing that changes is the guest count and what you need to prove.",
  categories: [
    {
      title: "Ceremonies & celebrations",
      promise: "The door stays open to yours, closed to the rest.",
      cases: [
        {
          title: "Weddings & baptisms",
          promise: "No gatecrashers, no line at the door",
          proof: "Live arrivals, offline scanning",
          description:
            "Guests confirm from WhatsApp, show their QR ticket on the day, and you know exactly who has arrived. The paper list stays in the drawer.",
        },
        {
          title: "Engagements & dowry",
          promise: "A second ceremony, the same calm",
          proof: "The same account, one more event",
          description:
            "Every stage of the ceremony runs on the same account, without rebuilding the guest list each time.",
        },
      ],
    },
    {
      title: "Professional events",
      promise: "An entrance worthy of your image.",
      cases: [
        {
          title: "Seminars & corporate galas",
          promise: "An entrance worthy of your image",
          proof: "White-label + a fast door",
          description:
            "Your logo, your colors, and an entrance that never stalls. Each ticket passes exactly once, no matter what.",
        },
        {
          title: "Press conferences & launches",
          promise: "A controlled access list",
          proof: "The protocol becomes the guest list",
          description:
            "Every accredited journalist or partner receives their access, checked at the door with a single scan.",
        },
        {
          title: "Inaugurations & official ceremonies",
          promise: "Protocol respected at the door",
          proof: "Protocol list = guest list",
          description:
            "Dignitaries are expected, identified and welcomed in the right order, without friction or confusion.",
        },
        {
          title: "Graduations & open houses",
          promise: "Every graduate recognized",
          proof: "Named scan at the entrance",
          description:
            "Every graduate and their family are expected and welcomed, without an endless line at reception.",
        },
      ],
    },
    {
      title: "Institutional & community",
      promise: "Proof, not promises.",
      cases: [
        {
          title: "General assemblies",
          promise: "An incontestable, timestamped quorum",
          proof: "Timestamped, opposable register",
          description:
            "Quorum is counted live and stays opposable. The attendance register generates itself, without rebuilding it by hand.",
        },
        {
          title: "Funded training & workshops",
          promise: "The proof of attendance your funder demands",
          proof: "Automatic certificate and register",
          description:
            "Every participant leaves with a named certificate, and you provide the proof of attendance your funder requires.",
        },
        {
          title: "Diaspora & community meetings",
          promise: "Organize from a distance",
          proof: "Per-event timezone",
          description:
            "Your event renders in its own timezone, wherever your members are in the world.",
        },
      ],
    },
  ],
  cta: {
    heading: "Your event deserves a calm door.",
    text: "Create a free account, import ten guests, send yourself an invitation: within five minutes you'll know whether Jikū is for you.",
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
