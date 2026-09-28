// CONTRACT — the step-by-step journeys shown on the use-cases page, in both
// locales. Each step names who acts, what they do, and what their screen shows.
// Only shipped behaviour is described; the screens are drawn by
// journey-screens.tsx from the `screen` data below.

import type { LandingLocale } from "./content";

export type ScreenKind = "import" | "message" | "card" | "ticket" | "scan" | "list" | "slots" | "call" | "stats";

export interface JourneyScreen {
  kind: ScreenKind;
  title: string;
  /**
   * Rows, lines of a message, or "label|value" pairs for stats. For a card:
   * the invitation line, the date, then the three answers.
   */
  lines: string[];
  /** The emphasised item: a status, the chosen slot, the called number. */
  highlight?: string;
  /** A button label shown at the bottom of the screen. */
  action?: string;
}

export interface JourneyStep {
  actor: string;
  title: string;
  text: string;
  screen: JourneyScreen;
}

export interface Journey {
  id: string;
  label: string;
  audience: string;
  steps: JourneyStep[];
}

export interface JourneysContent {
  eyebrow: string;
  heading: string;
  intro: string;
  stepOf: string;
  previous: string;
  next: string;
  journeys: Journey[];
}

const fr: JourneysContent = {
  eyebrow: "Voyez-le fonctionner",
  heading: "Chaque étape, vue par celui qui la vit",
  intro: "Choisissez une situation, puis cliquez sur une étape : l'écran montre exactement ce que voit l'organisateur, l'invité, le client ou l'équipe.",
  stepOf: "Étape {current} sur {total}",
  previous: "Étape précédente",
  next: "Étape suivante",
  journeys: [
    {
      id: "wedding",
      label: "Un mariage",
      audience: "250 invités, une entrée",
      steps: [
        {
          actor: "Organisateur",
          title: "Importe la liste",
          text: "Le fichier Excel de la famille devient la liste d'invités en un glisser-déposer. Les doublons sont signalés.",
          screen: { kind: "import", title: "Invités · 250", lines: ["Awa Diallo", "Mamadou Bah", "Fatoumata Camara", "Ibrahima Sow"], action: "Envoyer les invitations" },
        },
        {
          actor: "Invité",
          title: "Reçoit son invitation",
          text: "Un message personnel sur WhatsApp, aux couleurs des mariés, avec un lien qui n'appartient qu'à lui.",
          screen: { kind: "message", title: "Famille Diallo", lines: ["Bonjour Awa, la famille Diallo vous invite au mariage de Mariam et Alpha, le samedi 12 décembre à 16:00."], action: "Répondre à l'invitation" },
        },
        {
          actor: "Invité",
          title: "Confirme en un geste",
          text: "Un appui suffit. Son billet QR signé arrive aussitôt, prêt à être présenté.",
          screen: { kind: "ticket", title: "Mariage de Mariam & Alpha", lines: ["Awa Diallo", "Famille proche"], highlight: "Confirmé" },
        },
        {
          actor: "Porte",
          title: "Scanne à l'entrée",
          text: "Le contrôleur scanne depuis son téléphone, même sans réseau. Un billet ne passe jamais deux fois.",
          screen: { kind: "scan", title: "Entrée validée", lines: ["Awa Diallo", "Famille proche · 16:12"], highlight: "Hors ligne" },
        },
        {
          actor: "Organisateur",
          title: "Suit les arrivées",
          text: "Qui est là, qui manque : les mariés le savent en direct, sans liste papier.",
          screen: { kind: "stats", title: "En direct", lines: ["Confirmés|231", "Arrivés|187", "Refusés|12"] },
        },
      ],
    },
    {
      id: "birthday",
      label: "Un anniversaire",
      audience: "Une carte partagée, sans liste d'invités",
      steps: [
        {
          actor: "Organisatrice",
          title: "Crée sa carte",
          text: "Un style, une photo, un nombre d'accompagnants et une date limite : la carte est prête à partager.",
          screen: { kind: "card", title: "Les 30 ans d'Aïssatou", lines: ["Maison Diallo vous invite", "sam. 14 nov. · 19 h", "Je viens", "Peut-être", "Non"], action: "Partager la carte" },
        },
        {
          actor: "Groupe WhatsApp",
          title: "La carte circule",
          text: "Elle est publiée dans les groupes et les statuts. Le lien et le QR code mènent tous deux à la même carte.",
          screen: { kind: "message", title: "Cousins & cousines", lines: ["Venez fêter mes 30 ans avec moi, le samedi 14 novembre à 19 h. Tenue blanche souhaitée !"], action: "Répondre à la carte" },
        },
        {
          actor: "Invitée",
          title: "Répond en un geste",
          text: "Sur WhatsApp ou sur la page de la carte : « Je viens », avec une personne, puis son nom et son numéro.",
          screen: { kind: "card", title: "Les 30 ans d'Aïssatou", lines: ["Maison Diallo vous invite", "sam. 14 nov. · 19 h", "Je viens", "Peut-être", "Non"], highlight: "Je viens", action: "Continuer" },
        },
        {
          actor: "Invitée",
          title: "Reçoit son billet",
          text: "Chaque « oui » reçoit son billet QR, contrôlé à l'entrée comme les autres.",
          screen: { kind: "ticket", title: "Les 30 ans d'Aïssatou", lines: ["Mariama Bah + 1", "Carte partagée"], highlight: "Valide" },
        },
        {
          actor: "Organisatrice",
          title: "Compte les « oui »",
          text: "Personnes attendues, accompagnants compris, et places restantes : en direct.",
          screen: { kind: "stats", title: "En direct", lines: ["Attendus|64", "Je viens|41", "Peut-être|9"] },
        },
      ],
    },
    {
      id: "assembly",
      label: "Une assemblée générale",
      audience: "Quorum et émargement",
      steps: [
        {
          actor: "Organisateur",
          title: "Convoque les membres",
          text: "Chaque membre reçoit sa convocation personnelle par e-mail ou WhatsApp.",
          screen: { kind: "message", title: "Association des ressortissants", lines: ["Bonjour Mamadou, vous êtes convoqué à l'assemblée générale ordinaire du 20 novembre à 10:00."], action: "Confirmer ma présence" },
        },
        {
          actor: "Membre",
          title: "Présente son billet",
          text: "À l'accueil, le scan vaut signature : l'émargement se remplit tout seul, horodaté.",
          screen: { kind: "scan", title: "Présence enregistrée", lines: ["Mamadou Bah", "Membre titulaire · 09:52"] },
        },
        {
          actor: "Bureau",
          title: "Voit le quorum",
          text: "Le quorum est compté en direct : on ouvre la séance dès qu'il est atteint, preuve à l'appui.",
          screen: { kind: "stats", title: "Quorum", lines: ["Présents|128", "Requis|101", "Atteint à|09:58"] },
        },
        {
          actor: "Organisateur",
          title: "Édite les attestations",
          text: "Feuille d'émargement et attestations nominatives sont prêtes à la sortie, sans rien retaper.",
          screen: { kind: "list", title: "Documents", lines: ["Feuille d'émargement.pdf", "Attestations · 128", "Liste des absents.csv"], action: "Télécharger" },
        },
      ],
    },
    {
      id: "seminar",
      label: "Un séminaire",
      audience: "Plusieurs catégories, plusieurs entrées",
      steps: [
        {
          actor: "Organisateur",
          title: "Ouvre les catégories",
          text: "VIP, presse, standard : chacune son prix, sa couleur et sa jauge.",
          screen: { kind: "list", title: "Catégories", lines: ["VIP · 40 places", "Presse · 20 places", "Standard · 300 places"], highlight: "VIP", action: "Ouvrir la vente" },
        },
        {
          actor: "Participant",
          title: "Réserve et paie",
          text: "Il réserve sa place sur la page de l'événement et vous paie directement. Son billet arrive dès que vous confirmez.",
          screen: { kind: "ticket", title: "Forum Numérique 2026", lines: ["Ibrahima Sow", "VIP"], highlight: "Payé" },
        },
        {
          actor: "Portes",
          title: "Trois entrées, un décompte",
          text: "Chaque contrôleur scanne depuis son téléphone, même sans réseau. Un billet ne passe qu'une fois, quelle que soit la porte.",
          screen: { kind: "scan", title: "Entrée validée", lines: ["Ibrahima Sow", "VIP · Porte B · 08:47"], highlight: "Hors ligne" },
        },
        {
          actor: "Organisateur",
          title: "Suit la salle",
          text: "Entrées par catégorie et par porte, en direct.",
          screen: { kind: "stats", title: "En direct", lines: ["Entrés|286", "VIP|38", "Presse|17"] },
        },
      ],
    },
    {
      id: "clinic",
      label: "Une clinique",
      audience: "Rendez-vous et file du jour",
      steps: [
        {
          actor: "Patient",
          title: "Réserve son créneau",
          text: "Depuis le lien ou le QR affiché à l'accueil : il choisit un créneau libre, sans compte ni appel.",
          screen: { kind: "slots", title: "Consultation générale · Mardi", lines: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"], highlight: "10:00", action: "Confirmer le rendez-vous" },
        },
        {
          actor: "Patient",
          title: "Reçoit un rappel",
          text: "La veille, un rappel WhatsApp. Si WhatsApp échoue, un SMS prend le relais.",
          screen: { kind: "message", title: "Clinique Espoir", lines: ["Bonjour Fatoumata, petit rappel de votre rendez-vous avec le Dr Camara le mardi 3 novembre à 10:00."] },
        },
        {
          actor: "Accueil",
          title: "Tient la file du jour",
          text: "Rendez-vous et sans-rendez-vous dans une seule liste, dans le bon ordre.",
          screen: { kind: "list", title: "File du jour", lines: ["A-14 · En consultation", "A-15 · Fatoumata C.", "A-16 · Sans rendez-vous", "B-04 · Contrôle"], highlight: "A-15", action: "Appeler le suivant" },
        },
        {
          actor: "Patient",
          title: "Est appelé",
          text: "Il attend dehors ou au café : le message lui dit quand venir, et dans quelle salle.",
          screen: { kind: "call", title: "C'est votre tour", lines: ["Salle 2"], highlight: "A-15" },
        },
      ],
    },
    {
      id: "office",
      label: "Une agence",
      audience: "Guichets sans bousculade",
      steps: [
        {
          actor: "Accueil",
          title: "Remet un ticket",
          text: "Le client arrive : l'accueil l'ajoute à la file en quelques secondes, avec son numéro de téléphone.",
          screen: { kind: "list", title: "Ouverture de compte", lines: ["C-07 · Guichet 3", "C-08 · En attente", "C-09 · Nouveau"], highlight: "C-09", action: "Ajouter à la file" },
        },
        {
          actor: "Agent",
          title: "Appelle le suivant",
          text: "Un seul bouton au guichet. Jikū choisit la bonne personne, dans le bon ordre.",
          screen: { kind: "list", title: "Guichet 4", lines: ["C-08 · Appelé", "C-09 · Suivant", "C-10 · En attente"], highlight: "C-08", action: "Suivant" },
        },
        {
          actor: "Client",
          title: "Reçoit l'appel",
          text: "« C'est votre tour, guichet 4 » arrive sur son téléphone : fini la foule devant les guichets.",
          screen: { kind: "call", title: "C'est votre tour", lines: ["Guichet 4"], highlight: "C-08" },
        },
        {
          actor: "Responsable",
          title: "Suit l'attente",
          text: "Clients servis, en attente, absents : la journée se lit d'un coup d'œil.",
          screen: { kind: "stats", title: "Aujourd'hui", lines: ["Servis|214", "En attente|6", "Absents|9"] },
        },
      ],
    },
  ],
};

const en: JourneysContent = {
  eyebrow: "See it work",
  heading: "Every step, seen by whoever lives it",
  intro: "Pick a situation, then click a step: the screen shows exactly what the organizer, the guest, the client or the team sees.",
  stepOf: "Step {current} of {total}",
  previous: "Previous step",
  next: "Next step",
  journeys: [
    {
      id: "wedding",
      label: "A wedding",
      audience: "250 guests, one entrance",
      steps: [
        {
          actor: "Organizer",
          title: "Imports the list",
          text: "The family's Excel file becomes the guest list in one drag and drop. Duplicates are flagged.",
          screen: { kind: "import", title: "Guests · 250", lines: ["Awa Diallo", "Mamadou Bah", "Fatoumata Camara", "Ibrahima Sow"], action: "Send invitations" },
        },
        {
          actor: "Guest",
          title: "Gets the invitation",
          text: "A personal WhatsApp message, in the couple's colours, with a link that belongs to them alone.",
          screen: { kind: "message", title: "Diallo family", lines: ["Hello Awa, the Diallo family invites you to the wedding of Mariam and Alpha, on Saturday 12 December at 4:00 pm."], action: "Reply to the invitation" },
        },
        {
          actor: "Guest",
          title: "Confirms in one tap",
          text: "One tap is enough. Their signed QR ticket arrives right away, ready to show.",
          screen: { kind: "ticket", title: "Mariam & Alpha's wedding", lines: ["Awa Diallo", "Close family"], highlight: "Confirmed" },
        },
        {
          actor: "Door",
          title: "Scans at the entrance",
          text: "Door staff scan from their phone, even offline. A ticket never gets in twice.",
          screen: { kind: "scan", title: "Entry confirmed", lines: ["Awa Diallo", "Close family · 4:12 pm"], highlight: "Offline" },
        },
        {
          actor: "Organizer",
          title: "Follows arrivals",
          text: "Who is here, who is missing: the couple know it live, without a paper list.",
          screen: { kind: "stats", title: "Live", lines: ["Confirmed|231", "Arrived|187", "Declined|12"] },
        },
      ],
    },
    {
      id: "birthday",
      label: "A birthday",
      audience: "A shared card, no guest list",
      steps: [
        {
          actor: "Organizer",
          title: "Creates her card",
          text: "A style, a photo, how many companions and an answer deadline: the card is ready to share.",
          screen: { kind: "card", title: "Aïssatou turns 30", lines: ["Maison Diallo invites you", "Sat, Nov 14 · 7 PM", "I'm coming", "Maybe", "No"], action: "Share the card" },
        },
        {
          actor: "WhatsApp group",
          title: "The card goes round",
          text: "It is posted in groups and statuses. The link and the QR code both lead to the same card.",
          screen: { kind: "message", title: "Cousins", lines: ["Come and celebrate my 30th with me, Saturday November 14 at 7 PM. White outfits, please!"], action: "Answer the card" },
        },
        {
          actor: "Guest",
          title: "Answers in one tap",
          text: "On WhatsApp or on the card's page: \"I'm coming\", with one person, then her name and number.",
          screen: { kind: "card", title: "Aïssatou turns 30", lines: ["Maison Diallo invites you", "Sat, Nov 14 · 7 PM", "I'm coming", "Maybe", "No"], highlight: "I'm coming", action: "Continue" },
        },
        {
          actor: "Guest",
          title: "Gets her ticket",
          text: "Every yes gets a QR ticket, checked at the door like any other.",
          screen: { kind: "ticket", title: "Aïssatou turns 30", lines: ["Mariama Bah + 1", "Shared card"], highlight: "Valid" },
        },
        {
          actor: "Organizer",
          title: "Counts the yeses",
          text: "People expected, companions included, and places left: live.",
          screen: { kind: "stats", title: "Live", lines: ["Expected|64", "I'm coming|41", "Maybe|9"] },
        },
      ],
    },
    {
      id: "assembly",
      label: "A general assembly",
      audience: "Quorum and sign-in",
      steps: [
        {
          actor: "Organizer",
          title: "Convenes the members",
          text: "Each member receives a personal notice by email or WhatsApp.",
          screen: { kind: "message", title: "Nationals' association", lines: ["Hello Mamadou, you are invited to the ordinary general assembly on 20 November at 10:00 am."], action: "Confirm attendance" },
        },
        {
          actor: "Member",
          title: "Shows their ticket",
          text: "At the desk, the scan counts as a signature: the sign-in sheet fills itself, timestamped.",
          screen: { kind: "scan", title: "Attendance recorded", lines: ["Mamadou Bah", "Full member · 9:52 am"] },
        },
        {
          actor: "Board",
          title: "Sees the quorum",
          text: "The quorum is counted live: the session opens as soon as it is reached, with proof.",
          screen: { kind: "stats", title: "Quorum", lines: ["Present|128", "Required|101", "Reached at|9:58 am"] },
        },
        {
          actor: "Organizer",
          title: "Issues certificates",
          text: "The sign-in sheet and named attendance certificates are ready at the end, nothing retyped.",
          screen: { kind: "list", title: "Documents", lines: ["Sign-in sheet.pdf", "Certificates · 128", "Absentees.csv"], action: "Download" },
        },
      ],
    },
    {
      id: "seminar",
      label: "A seminar",
      audience: "Several categories, several doors",
      steps: [
        {
          actor: "Organizer",
          title: "Opens the categories",
          text: "VIP, press, standard: each has its price, color and capacity.",
          screen: { kind: "list", title: "Categories", lines: ["VIP · 40 places", "Press · 20 places", "Standard · 300 places"], highlight: "VIP", action: "Open sales" },
        },
        {
          actor: "Attendee",
          title: "Books and pays",
          text: "They hold a place on the event's page and pay you directly. The ticket arrives as soon as you confirm.",
          screen: { kind: "ticket", title: "Digital Forum 2026", lines: ["Ibrahima Sow", "VIP"], highlight: "Paid" },
        },
        {
          actor: "Doors",
          title: "Three doors, one count",
          text: "Each door staff member scans from their phone, even offline. A ticket only gets in once, whatever the door.",
          screen: { kind: "scan", title: "Entry confirmed", lines: ["Ibrahima Sow", "VIP · Door B · 8:47 AM"], highlight: "Offline" },
        },
        {
          actor: "Organizer",
          title: "Follows the room",
          text: "Entries by category and by door, live.",
          screen: { kind: "stats", title: "Live", lines: ["Checked in|286", "VIP|38", "Press|17"] },
        },
      ],
    },
    {
      id: "clinic",
      label: "A clinic",
      audience: "Appointments and today's line",
      steps: [
        {
          actor: "Patient",
          title: "Books a slot",
          text: "From the link or the QR code at the desk: they pick a free slot, no account, no call.",
          screen: { kind: "slots", title: "General consultation · Tuesday", lines: ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30"], highlight: "10:00", action: "Confirm the appointment" },
        },
        {
          actor: "Patient",
          title: "Gets a reminder",
          text: "The day before, a WhatsApp reminder. If WhatsApp fails, an SMS takes over.",
          screen: { kind: "message", title: "Hope Clinic", lines: ["Hello Fatoumata, a reminder of your appointment with Dr Camara on Tuesday 3 November at 10:00 am."] },
        },
        {
          actor: "Front desk",
          title: "Runs today's line",
          text: "Appointments and walk-ins in one list, in the right order.",
          screen: { kind: "list", title: "Today's line", lines: ["A-14 · In consultation", "A-15 · Fatoumata C.", "A-16 · Walk-in", "B-04 · Follow-up"], highlight: "A-15", action: "Call next" },
        },
        {
          actor: "Patient",
          title: "Gets called",
          text: "They wait outside or at the café: the message tells them when to come, and which room.",
          screen: { kind: "call", title: "It's your turn", lines: ["Room 2"], highlight: "A-15" },
        },
      ],
    },
    {
      id: "office",
      label: "An agency",
      audience: "Counters without a crowd",
      steps: [
        {
          actor: "Front desk",
          title: "Hands out a ticket",
          text: "A client arrives: the desk adds them to the line in seconds, with their phone number.",
          screen: { kind: "list", title: "Account opening", lines: ["C-07 · Counter 3", "C-08 · Waiting", "C-09 · New"], highlight: "C-09", action: "Add to the line" },
        },
        {
          actor: "Agent",
          title: "Calls the next client",
          text: "One button at the counter. Jikū picks the right person, in the right order.",
          screen: { kind: "list", title: "Counter 4", lines: ["C-08 · Called", "C-09 · Next", "C-10 · Waiting"], highlight: "C-08", action: "Next" },
        },
        {
          actor: "Client",
          title: "Gets the call",
          text: "\"It's your turn, counter 4\" lands on their phone: no more crowd in front of the counters.",
          screen: { kind: "call", title: "It's your turn", lines: ["Counter 4"], highlight: "C-08" },
        },
        {
          actor: "Manager",
          title: "Follows the wait",
          text: "Clients served, waiting, no-shows: the day reads at a glance.",
          screen: { kind: "stats", title: "Today", lines: ["Served|214", "Waiting|6", "No-shows|9"] },
        },
      ],
    },
  ],
};

export const USE_CASE_JOURNEYS: Record<LandingLocale, JourneysContent> = { fr, en };
