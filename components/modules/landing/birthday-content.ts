// CONTRACT — every word on the two birthday pages (JIKU-220), in both locales:
// the online birthday invitation card and the invitation texts to copy. They
// answer the searches OpenSEO found worth targeting ("invitation anniversaire",
// "carte d'invitation anniversaire", "texte invitation anniversaire"). Same
// rules as content.ts: no invented numbers, no claims the product cannot
// evidence. Texts use [brackets] for what the visitor fills in.

import type { LandingCardSample, LandingLocale } from "./content";
import type { MarketingNavContent } from "./marketing-header";

export interface BirthdayCardPageContent {
  meta: { title: string; description: string; keywords: string[] };
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta: string;
  /** The card drawn next to the intro. */
  sample: LandingCardSample;
  invites: string;
  steps: { heading: string; items: { title: string; text: string }[] };
  why: { heading: string; items: { title: string; text: string }[] };
  occasions: { heading: string; items: string[] };
  texts: { heading: string; text: string; cta: string };
  faq: { heading: string; items: { question: string; answer: string }[] };
  cta: { heading: string; text: string; primary: string; secondary: string };
  breadcrumb: string;
  nav: MarketingNavContent;
}

export interface InvitationTextGroup {
  id: string;
  heading: string;
  texts: string[];
}

export interface BirthdayTextsPageContent {
  meta: { title: string; description: string; keywords: string[] };
  eyebrow: string;
  title: string;
  intro: string;
  checklist: { heading: string; items: string[] };
  groups: InvitationTextGroup[];
  copy: { label: string; done: string };
  send: { heading: string; text: string; primary: string; secondary: string };
  breadcrumb: string;
  nav: MarketingNavContent;
}

const frNav: MarketingNavContent = {
  home: "Accueil",
  signIn: "Se connecter",
  createAccount: "Créer un compte",
  switchLocale: { label: "EN", locale: "en", ariaLabel: "Read this page in English" },
};

const enNav: MarketingNavContent = {
  home: "Home",
  signIn: "Sign in",
  createAccount: "Create account",
  switchLocale: { label: "FR", locale: "fr", ariaLabel: "Lire cette page en français" },
};

const frCard: BirthdayCardPageContent = {
  meta: {
    title: "Carte d'invitation anniversaire en ligne",
    description:
      "Créez une carte d'invitation d'anniversaire en ligne, partagez-la sur WhatsApp et voyez qui vient. Un billet QR pour chaque « oui ». Gratuit jusqu'à 100 invités.",
    keywords: [
      "carte d'invitation anniversaire",
      "invitation anniversaire",
      "carte d'invitation anniversaire virtuelle",
      "invitation anniversaire WhatsApp",
      "créer une carte d'invitation en ligne",
      "carte d'invitation à personnaliser",
    ],
  },
  eyebrow: "Carte d'invitation d'anniversaire",
  title: "Carte d'invitation d'anniversaire en ligne, à partager sur WhatsApp",
  intro:
    "Fini le carton à imprimer et les « tu viens ? » un par un. Créez la carte de votre anniversaire en quelques minutes, publiez-la dans vos groupes WhatsApp et voyez en direct qui vient. Chaque invité qui répond « oui » reçoit son billet, contrôlé à l'entrée.",
  primaryCta: "Créer ma carte",
  sample: {
    style: "FESTIVE",
    event: "Les 30 ans d'Aïssatou",
    organizer: "Aïssatou",
    when: "sam. 14 nov. · 19 h",
    color: "#7C2D12",
    photo: true,
  },
  invites: "vous invite",
  steps: {
    heading: "Votre invitation en trois gestes",
    items: [
      {
        title: "Créez votre carte",
        text: "Le titre, la date et le lieu, puis un style : Élégant, Moderne ou Festif, avec votre photo ou votre couleur.",
      },
      {
        title: "Partagez-la sur WhatsApp",
        text: "Dans vos groupes et vos statuts, ou par son lien et son QR code. L'aperçu de la carte s'affiche directement dans la conversation.",
      },
      {
        title: "Comptez les « oui »",
        text: "Vos invités répondent sur WhatsApp ou sur la page de la carte, avec le nombre d'accompagnants que vous autorisez. Chaque « oui » reçoit son billet QR.",
      },
    ],
  },
  why: {
    heading: "Pourquoi une carte en ligne plutôt qu'un carton ?",
    items: [
      { title: "Rien à imprimer, rien à distribuer", text: "La carte arrive là où vos proches sont déjà : sur WhatsApp." },
      { title: "Vous savez qui vient", text: "Les réponses s'affichent en direct : plus besoin de relancer chacun." },
      {
        title: "Une entrée sans mauvaise surprise",
        text: "Le billet QR ne passe qu'une fois, et le contrôle à l'entrée marche même sans réseau.",
      },
      {
        title: "Aucune application à installer",
        text: "Ni pour vous, ni pour vos invités : tout se passe sur WhatsApp et dans le navigateur.",
      },
    ],
  },
  occasions: {
    heading: "Pour tous les anniversaires",
    items: ["18 ans", "30 ans", "40 ans", "50 ans", "Anniversaire surprise", "Anniversaire d'enfant"],
  },
  texts: {
    heading: "Besoin des mots justes ?",
    text: "Piochez dans nos textes d'invitation d'anniversaire, à copier tels quels ou à adapter, puis collez-les sur votre carte.",
    cta: "Voir les textes d'invitation",
  },
  faq: {
    heading: "Questions fréquentes",
    items: [
      {
        question: "La carte d'invitation est-elle gratuite ?",
        answer:
          "Oui, jusqu'à 100 invités. Au-delà, vous payez une fois pour l'événement : le simulateur de tarifs vous donne le prix exact.",
      },
      {
        question: "Mes invités doivent-ils installer une application ?",
        answer: "Non. Ils ouvrent la carte depuis WhatsApp ou un navigateur et répondent en un geste.",
      },
      {
        question: "Puis-je limiter le nombre d'accompagnants ?",
        answer: "Oui. Vous fixez combien de personnes chaque invité peut amener, et la réponse en tient compte.",
      },
      {
        question: "Comment contrôler les entrées le jour de la fête ?",
        answer:
          "Chaque « oui » reçoit un billet QR. À l'entrée, un proche le scanne avec son téléphone, même sans réseau, et un billet ne passe qu'une fois.",
      },
      {
        question: "Puis-je aussi inviter mes proches un par un ?",
        answer:
          "Oui. Si vous avez votre liste, importez-la : chacun reçoit son invitation personnelle par e-mail ou par WhatsApp, avec son propre lien.",
      },
    ],
  },
  cta: {
    heading: "Créez la carte de votre anniversaire",
    text: "Gratuit jusqu'à 100 invités, sans application à installer.",
    primary: "Créer ma carte",
    secondary: "Voir les tarifs",
  },
  breadcrumb: "Carte d'invitation d'anniversaire",
  nav: frNav,
};

const enCard: BirthdayCardPageContent = {
  meta: {
    title: "Online birthday invitation card",
    description:
      "Create an online birthday invitation card, share it on WhatsApp and see who's coming. A QR ticket for every “yes”. Free for up to 100 guests.",
    keywords: [
      "birthday invitation card",
      "online birthday invitation",
      "virtual birthday invitation",
      "WhatsApp birthday invitation",
      "create an invitation card online",
    ],
  },
  eyebrow: "Birthday invitation card",
  title: "Online birthday invitation card, made to share on WhatsApp",
  intro:
    "No more printed cards and asking “are you coming?” one by one. Create your birthday card in minutes, post it in your WhatsApp groups and see who's coming as it happens. Every guest who says “yes” gets a ticket, checked at the door.",
  primaryCta: "Create my card",
  sample: {
    style: "FESTIVE",
    event: "Aïssatou turns 30",
    organizer: "Aïssatou",
    when: "Sat Nov 14 · 7 pm",
    color: "#7C2D12",
    photo: true,
  },
  invites: "invites you",
  steps: {
    heading: "Your invitation in three steps",
    items: [
      {
        title: "Create your card",
        text: "The title, date and place, then a style: Elegant, Modern or Festive, with your photo or your colour.",
      },
      {
        title: "Share it on WhatsApp",
        text: "In your groups and statuses, or with its link and QR code. The card's preview shows right in the chat.",
      },
      {
        title: "Count the “yes”",
        text: "Guests answer on WhatsApp or on the card's page, with as many companions as you allow. Every “yes” gets a QR ticket.",
      },
    ],
  },
  why: {
    heading: "Why an online card rather than a printed one?",
    items: [
      { title: "Nothing to print or hand out", text: "The card goes where your people already are: WhatsApp." },
      { title: "You know who's coming", text: "Answers show up as they come in: no more chasing everyone." },
      { title: "No surprises at the door", text: "A QR ticket only gets in once, and checking works even offline." },
      { title: "No app to install", text: "Not for you, not for your guests: it all happens on WhatsApp and in the browser." },
    ],
  },
  occasions: {
    heading: "For every birthday",
    items: ["18th", "30th", "40th", "50th", "Surprise party", "Kids' party"],
  },
  texts: {
    heading: "Looking for the right words?",
    text: "Pick from our birthday invitation texts, to copy as they are or adapt, then paste them on your card.",
    cta: "See the invitation texts",
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "Is the invitation card free?",
        answer:
          "Yes, for up to 100 guests. Beyond that you pay once for the event: the pricing simulator gives you the exact price.",
      },
      {
        question: "Do my guests need to install an app?",
        answer: "No. They open the card from WhatsApp or a browser and answer in one tap.",
      },
      {
        question: "Can I limit how many companions a guest brings?",
        answer: "Yes. You set how many people each guest may bring, and the answer counts them.",
      },
      {
        question: "How do I check people in on the day?",
        answer:
          "Every “yes” gets a QR ticket. At the door, a friend scans it with their phone, even offline, and a ticket only gets in once.",
      },
      {
        question: "Can I also invite people one by one?",
        answer:
          "Yes. If you have a guest list, import it: everyone gets a personal invitation by email or WhatsApp, with their own link.",
      },
    ],
  },
  cta: {
    heading: "Create your birthday card",
    text: "Free for up to 100 guests, no app to install.",
    primary: "Create my card",
    secondary: "See pricing",
  },
  breadcrumb: "Birthday invitation card",
  nav: enNav,
};

const frTexts: BirthdayTextsPageContent = {
  meta: {
    title: "Textes d'invitation d'anniversaire à copier",
    description:
      "Des textes d'invitation d'anniversaire à copier : adulte, surprise, enfant, 18, 30 ou 50 ans, et version courte pour WhatsApp. Avec ce qu'une invitation doit dire.",
    keywords: [
      "texte invitation anniversaire",
      "texte invitation anniversaire adulte",
      "exemple invitation anniversaire",
      "texte invitation anniversaire surprise",
      "texte carte d'invitation anniversaire",
    ],
  },
  eyebrow: "Textes d'invitation",
  title: "Textes d'invitation d'anniversaire à copier",
  intro:
    "Trouver la bonne formule prend souvent plus de temps que d'organiser la fête. Voici des textes prêts à copier pour chaque type d'anniversaire. Remplacez ce qui est entre crochets, puis collez le texte sur votre carte ou dans votre message WhatsApp.",
  checklist: {
    heading: "Ce qu'une invitation doit dire",
    items: [
      "Qui fête quoi : le prénom, et l'âge si on veut le dire",
      "La date et l'heure",
      "Le lieu, avec un lien de localisation",
      "La date limite pour répondre",
      "Le thème ou la tenue, s'il y en a un",
      "Si les accompagnants et les enfants sont les bienvenus",
    ],
  },
  groups: [
    {
      id: "adulte",
      heading: "Anniversaire adulte",
      texts: [
        "Le [date], je fête mes [âge] ans et j'aimerais beaucoup vous avoir à mes côtés. Rendez-vous à [lieu] à partir de [heure]. Merci de me répondre avant le [date limite].",
        "Une année de plus, ça se fête ! Rejoignez-moi le [date] à [heure], à [lieu], pour une soirée entre amis. Votre présence sera mon plus beau cadeau.",
        "[Prénom] vous invite à souffler ses bougies le [date] à [lieu]. Au programme : repas, musique et bonne humeur. Dites-nous vite si vous venez !",
      ],
    },
    {
      id: "surprise",
      heading: "Anniversaire surprise",
      texts: [
        "Chut ! Nous préparons une fête surprise pour les [âge] ans de [prénom], le [date] à [lieu]. Merci d'arriver avant [heure], et surtout, pas un mot !",
        "Opération surprise : [prénom] ne se doute de rien. Rendez-vous le [date] à [lieu] pour lui faire la fête. Répondez avant le [date limite] pour qu'on prévoie assez pour tout le monde.",
        "Gardez le secret : on fête les [âge] ans de [prénom] par surprise le [date]. Arrivée à [heure] précises à [lieu]. On compte sur vous !",
      ],
    },
    {
      id: "enfant",
      heading: "Anniversaire d'enfant",
      texts: [
        "[Prénom] va avoir [âge] ans et invite ses copains et copines à sa fête le [date], de [heure] à [heure], à [lieu]. Les parents peuvent venir chercher leurs enfants à [heure].",
        "Viens fêter mes [âge] ans ! Je t'attends le [date] à [heure] à [lieu] pour des jeux, du gâteau et plein de surprises. Réponse de tes parents avant le [date limite], s'il te plaît.",
        "Grande fête [thème] pour les [âge] ans de [prénom] ! Rendez-vous le [date] à [lieu], déguisement bienvenu. Merci de confirmer avant le [date limite].",
      ],
    },
    {
      id: "ages",
      heading: "18, 30, 40 ou 50 ans",
      texts: [
        "18 ans, ça ne se fête qu'une fois ! Rejoins-moi le [date] à [lieu] à partir de [heure] pour une soirée inoubliable.",
        "Les 30 ans, c'est le début des choses sérieuses… mais pas ce soir ! Rendez-vous le [date] à [heure] à [lieu] pour fêter ça avec moi.",
        "Pour mes 40 ans, je réunis celles et ceux qui comptent. Je vous attends le [date] à [lieu] à partir de [heure]. Merci de me répondre avant le [date limite].",
        "Un demi-siècle, ça se célèbre en famille et entre amis. Pour mes 50 ans, je vous attends le [date] à [lieu] à partir de [heure].",
      ],
    },
    {
      id: "whatsapp",
      heading: "Version courte pour WhatsApp",
      texts: [
        "Mes [âge] ans : [date], [heure], [lieu]. Tu viens ? Réponds sur la carte.",
        "Je fête mon anniversaire le [date] à [lieu], à partir de [heure]. Dis-moi si tu viens en répondant sur la carte.",
        "Anniversaire de [prénom] : [date], [heure], [lieu]. Merci de confirmer ta présence avant le [date limite].",
      ],
    },
  ],
  copy: { label: "Copier", done: "Copié" },
  send: {
    heading: "Envoyez votre texte sur une vraie carte",
    text: "Collez votre texte sur une carte d'invitation en ligne, partagez-la sur WhatsApp et voyez qui vient. Chaque « oui » reçoit son billet QR. Gratuit jusqu'à 100 invités.",
    primary: "Créer ma carte",
    secondary: "Comment marche la carte",
  },
  breadcrumb: "Textes d'invitation d'anniversaire",
  nav: frNav,
};

const enTexts: BirthdayTextsPageContent = {
  meta: {
    title: "Birthday invitation wording to copy",
    description:
      "Birthday invitation wording to copy: adults, surprise party, kids, 18th, 30th or 50th, and a short version for WhatsApp. Plus what an invitation must say.",
    keywords: [
      "birthday invitation wording",
      "birthday invitation text",
      "surprise party invitation wording",
      "kids birthday invitation wording",
    ],
  },
  eyebrow: "Invitation wording",
  title: "Birthday invitation wording to copy",
  intro:
    "Finding the right words often takes longer than planning the party. Here is ready-to-copy wording for every kind of birthday. Replace what's in brackets, then paste the text on your card or in your WhatsApp message.",
  checklist: {
    heading: "What an invitation must say",
    items: [
      "Who is celebrating what: the name, and the age if you want to share it",
      "The date and time",
      "The place, with a map link",
      "The date to reply by",
      "The theme or dress code, if there is one",
      "Whether companions and children are welcome",
    ],
  },
  groups: [
    {
      id: "adults",
      heading: "Adult birthday",
      texts: [
        "On [date] I'm turning [age] and I'd love to have you there. Join me at [place] from [time]. Please reply by [reply date].",
        "Another year older, time to celebrate! Join me on [date] at [time], at [place], for an evening with friends. Having you there is the best gift.",
        "[Name] invites you to blow out the candles on [date] at [place]. Food, music and good company. Let us know if you're coming!",
      ],
    },
    {
      id: "surprise",
      heading: "Surprise party",
      texts: [
        "Shh! We're throwing a surprise party for [name]'s [age]th, on [date] at [place]. Please arrive before [time], and not a word!",
        "Surprise mission: [name] has no idea. Meet us on [date] at [place] to celebrate. Reply by [reply date] so we plan for everyone.",
        "Keep the secret: we're celebrating [name]'s [age]th by surprise on [date]. Be at [place] at [time] sharp. We're counting on you!",
      ],
    },
    {
      id: "kids",
      heading: "Kids' birthday",
      texts: [
        "[Name] is turning [age] and invites friends to the party on [date], from [time] to [time], at [place]. Parents can pick their children up at [time].",
        "Come celebrate my [age]th birthday! See you on [date] at [time] at [place] for games, cake and lots of surprises. Parents, please reply by [reply date].",
        "Big [theme] party for [name]'s [age]th! Meet us on [date] at [place], costumes welcome. Please confirm by [reply date].",
      ],
    },
    {
      id: "milestones",
      heading: "18th, 30th, 40th or 50th",
      texts: [
        "You only turn 18 once! Join me on [date] at [place] from [time] for a night to remember.",
        "Thirty is when things get serious… but not tonight! Meet me on [date] at [time] at [place] to celebrate.",
        "For my 40th, I'm bringing together the people who matter. Join me on [date] at [place] from [time]. Please reply by [reply date].",
        "Half a century calls for family and friends. For my 50th, join me on [date] at [place] from [time].",
      ],
    },
    {
      id: "whatsapp",
      heading: "Short version for WhatsApp",
      texts: [
        "My [age]th: [date], [time], [place]. Coming? Reply on the card.",
        "I'm celebrating my birthday on [date] at [place], from [time]. Let me know if you're coming by replying on the card.",
        "[Name]'s birthday: [date], [time], [place]. Please confirm by [reply date].",
      ],
    },
  ],
  copy: { label: "Copy", done: "Copied" },
  send: {
    heading: "Send your wording on a real card",
    text: "Paste your text on an online invitation card, share it on WhatsApp and see who's coming. Every “yes” gets a QR ticket. Free for up to 100 guests.",
    primary: "Create my card",
    secondary: "How the card works",
  },
  breadcrumb: "Birthday invitation wording",
  nav: enNav,
};

export const BIRTHDAY_CARD_CONTENT: Record<LandingLocale, BirthdayCardPageContent> = { fr: frCard, en: enCard };
export const BIRTHDAY_TEXTS_CONTENT: Record<LandingLocale, BirthdayTextsPageContent> = { fr: frTexts, en: enTexts };
