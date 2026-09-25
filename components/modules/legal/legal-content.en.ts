import { COMPANY } from "./company";
import type { LegalDocuments } from "./legal-types";

const C = COMPANY;

/** English translation. The French version prevails in case of discrepancy. */
export const LEGAL_EN: LegalDocuments = {
  legal: {
    title: "Legal notice",
    description:
      "Publisher, hosting providers and contacts of the Jikū service, published by a Guinean company based in Conakry.",
    intro:
      "This notice identifies the company that publishes Jikū, the providers that host it and how to reach us. The French version prevails in case of discrepancy.",
    sections: [
      {
        id: "editeur",
        heading: "Publisher",
        body: [
          `The Jikū website and application are published by ${C.legalName}, ${C.legalForm} with a share capital of ${C.shareCapital}, registered with the Conakry Trade and Personal Property Credit Register (RCCM) under number ${C.rccm}, tax identification number ${C.nif}.`,
          `Registered office: ${C.address}.`,
          [`Email: ${C.email}`, `Phone and WhatsApp: ${C.phone}`],
        ],
      },
      {
        id: "publication",
        heading: "Publication director",
        body: [`${C.director}, as legal representative of ${C.legalName}.`],
      },
      {
        id: "hebergement",
        heading: "Hosting",
        body: [
          "The service is hosted by providers located outside Guinea, which process data only on our instructions:",
          [
            "Website: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, United States.",
            "Application server: Render Services, Inc., San Francisco, California, United States.",
            "Database: Neon (managed PostgreSQL), cloud infrastructure in the United States or the European Union depending on the selected region.",
          ],
          "The full list of providers that process personal data is in the privacy policy.",
        ],
      },
      {
        id: "propriete",
        heading: "Intellectual property",
        body: [
          `The Jikū brand, its logo, texts, visuals and code belong to ${C.legalName} or its licensors. Any reproduction or reuse without written permission is prohibited.`,
          "Logos, colours and content an organization adds to its space remain its property. It allows us to display them only to run the service it uses.",
        ],
      },
      {
        id: "signalement",
        heading: "Report content",
        body: [
          `Does an invitation, page or message seem unlawful or misleading? Write to ${C.email} with the link concerned. We reply within five working days and may suspend the content while we review it.`,
        ],
      },
      {
        id: "droit",
        heading: "Governing law",
        body: [
          "This notice is governed by the law of the Republic of Guinea. The terms of use and sale set out how disputes are resolved.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of use and sale",
    description:
      "The rules for using Jikū, prices, billing, each party's obligations and how your guests' and clients' data is handled.",
    intro:
      "These terms form the contract between the company that publishes Jikū and any organization or person who creates an account. Creating an account or paying for an offer means accepting the version in force on that date. The French version prevails in case of discrepancy.",
    sections: [
      {
        id: "definitions",
        heading: "1. Definitions",
        body: [
          [
            `"Jikū", "we": ${C.legalName}, publisher of the service.`,
            '"Organization": the company, association, public body or person who opens an account to manage events or services.',
            '"User": anyone who signs in to an organization\'s space (owner, administrator, member, person who serves clients).',
            '"Guest" or "client": a person an organization invites to an event or receives as part of a service (appointment, queue).',
            '"Operator" or "checker": a person who scans tickets or calls clients on an organization\'s behalf.',
          ],
        ],
      },
      {
        id: "service",
        heading: "2. The service",
        body: [
          "Jikū lets an organization:",
          [
            "invite people to an event by email or WhatsApp, follow their answers and issue them a ticket with a QR code;",
            "sell tickets whose price is paid directly to the organization;",
            "manage appointments, bookings and a queue for its services;",
            "check people in, including without an internet connection, and track attendance.",
          ],
          'We improve the service regularly. A feature announced as "coming soon" is not owed until it is released.',
        ],
      },
      {
        id: "compte",
        heading: "3. Account and access",
        body: [
          "The person opening the account declares they have authority to bind the organization. They provide accurate information and keep it up to date.",
          "Each user keeps their credentials confidential. The organization is responsible for actions taken from its accounts and tells us immediately of any unauthorized access.",
          "We may ask for documents to verify an organization, in particular before a ticket sale opens.",
        ],
      },
      {
        id: "prix",
        heading: "4. Prices and offers",
        body: [
          "Current prices are published on the pricing page and in the simulator, in Guinean francs (GNF) for organizations based in Guinea. A US dollar equivalent may be shown for information; only the local-currency amount is binding.",
          [
            "Services (appointments, bookings, queue): a subscription per person who serves clients, per month, payable monthly or yearly. The Solo offer is free for one person.",
            "Events with free invitations: free up to 100 guests over a rolling twelve months per organization, then a price per event based on the number of guests. Moving up a tier only charges the difference.",
            "Paid tickets: a commission of 3% of the price of each ticket sold, paid to Jikū in tranches before the sale (see section 6).",
            "SMS sends are a paid option whose price is shown before each send.",
          ],
          "Prices are [exclusive / inclusive] of taxes. Any price change is announced by email at least thirty days in advance and does not apply to a period already paid.",
        ],
      },
      {
        id: "paiement",
        heading: "5. Payment and invoicing",
        body: [
          "Amounts owed to Jikū are paid in advance, by Orange Money, MTN Mobile Money, bank card or any other method offered at checkout. Online payments are handled by our payment provider; we never store your card details.",
          "An invoice is issued for each payment and stays available in the organization's space.",
          "A subscription that expires without renewal remains usable during a three-day grace period. After that, paid features are suspended until payment; the data is not deleted.",
          "Unless the law provides otherwise, amounts paid are not refundable. A current period is not refunded pro rata on termination.",
        ],
      },
      {
        id: "billetterie",
        heading: "6. Ticket sales",
        body: [
          "Ticket money is paid by the buyer directly to the organization, using the payment methods it has listed. Jikū never collects, holds or passes on that money, and plays no part in refunds to buyers: they are the organization's sole responsibility.",
          'When a sale opens, Jikū asks for the commission on one tranche of tickets (by default the next 50, never more than the places left). Each ticket marked "paid" uses one place of the tranche. The sale pauses when the tranche is used up, until the next one is paid.',
          "Any unused part of a tranche at the end of the event is carried over to the organization's next sales or payments for twelve months. It is neither refunded in cash nor transferable.",
          "The organization sets its prices and its sale and cancellation terms, and tells buyers about them. It alone is responsible for its tax obligations on its sales.",
        ],
      },
      {
        id: "obligations",
        heading: "7. The organization's commitments",
        body: [
          "The organization undertakes to:",
          [
            "import only contacts it is entitled to use, and invite only people who can expect to receive its messages;",
            "not use Jikū for unsolicited marketing, or for unlawful, misleading or hateful content, or content that infringes others' rights;",
            "follow the rules of the messaging channels used, including the WhatsApp Business policy;",
            "hold the event or provide the service announced, and answer its guests' and clients' requests itself.",
          ],
          "If these commitments are breached, we may suspend a send, a page or the account, after a warning except in urgent cases (fraud, risk to people, a request from an authority).",
        ],
      },
      {
        id: "donnees",
        heading: "8. Guests' and clients' data",
        body: [
          "For its guests' and clients' data, the organization is the controller and Jikū acts as processor, within the meaning of the Guinean law on personal data protection. Jikū undertakes to:",
          [
            "process this data only to provide the service the organization requested, never on its own behalf or for advertising;",
            "keep it confidential, including through its staff and providers, who are bound by the same obligations;",
            "apply appropriate security measures (encrypted connections, access control, separation of each organization's data, logging);",
            "help the organization answer people's requests, and inform it without delay of any data breach affecting it;",
            "delete or anonymize the data at the end of its retention period, or when the account closes after a thirty-day export window.",
          ],
          "The providers involved (hosting, email, WhatsApp, SMS, payment) are listed in the privacy policy. The organization authorizes their involvement; we inform it of any change.",
        ],
      },
      {
        id: "disponibilite",
        heading: "9. Availability and support",
        body: [
          "We do our best to keep the service available at all times but cannot guarantee it: maintenance, or outages at telecom operators or providers, may interrupt it. Tickets already displayed and entrance checks keep working offline.",
          `Support is available by email (${C.email}) and WhatsApp (${C.phone}) on working days.`,
        ],
      },
      {
        id: "responsabilite",
        heading: "10. Liability",
        body: [
          "Jikū provides a tool. The organization remains responsible for its events, services, prices, messages and relationships with its guests and clients.",
          "We are liable only for proven fault and for direct damage only. Our liability is limited to the total amounts the organization paid Jikū in the twelve months before the event giving rise to the claim.",
          "Neither party is liable for a failure caused by force majeure, including a general internet or power outage, a decision by an authority or a telecom operator failure.",
        ],
      },
      {
        id: "duree",
        heading: "11. Term, termination and export",
        body: [
          "The contract lasts as long as the account exists. The organization can close its account at any time from its settings or by writing to us.",
          "Before closing, the organization can export its guest lists and data. After closure, data stays exportable for thirty days and is then deleted or anonymized, except what the law requires us to keep (invoices in particular).",
        ],
      },
      {
        id: "modifications",
        heading: "12. Changes to these terms",
        body: [
          "We may change these terms. A significant change is announced by email at least thirty days before it applies. Continuing to use the service after that date means accepting it; otherwise, the organization may close its account.",
        ],
      },
      {
        id: "litiges",
        heading: "13. Governing law and disputes",
        body: [
          "These terms are governed by the law of the Republic of Guinea and the applicable OHADA Uniform Acts.",
          `In case of disagreement, write to us first at ${C.email}: we seek an amicable solution within thirty days. Failing that, the dispute is brought before the Commercial Court of Conakry.`,
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    description:
      "What data Jikū processes, why, with whom, for how long, and how to exercise your rights: organizers, guests and clients.",
    intro:
      "This policy is for two audiences: organizations and their users, whose account data we are responsible for, and an organization's guests or clients, whose data is processed on that organization's behalf. It applies the Guinean law on cybersecurity and personal data protection. The French version prevails in case of discrepancy.",
    sections: [
      {
        id: "invites",
        heading: "You are a guest or client of an organization",
        body: [
          "The organization that invited you, or that you are visiting, entered your details. It decides how your data is used and is responsible for it; Jikū processes it on its behalf, only to:",
          [
            "send you the invitation, ticket, reminders and changes (cancellation, postponement);",
            "record your answer, your answers to the organizer's questions and any payment you declared;",
            "check your ticket at the entrance or call you in the queue;",
            "produce anonymous attendance statistics for the organization.",
          ],
          "We do not sell your data and never use it for our own advertising.",
          'You can erase your personal data at any time with the "Request deletion of my data" button on your invitation or ticket page. Erasure is immediate and permanent; only an anonymous record that a guest was invited remains. For any other request, contact the organization, or write to us and we will pass it on.',
        ],
      },
      {
        id: "responsable",
        heading: "Who is responsible",
        body: [
          `For organizations' and users' accounts, and for the public website: ${C.legalName}, ${C.address}. Privacy contact: ${C.privacyEmail}.`,
          `Declaration with the data protection authority: ${C.dpaDeclaration}.`,
        ],
      },
      {
        id: "donnees",
        heading: "The data we process",
        body: [
          [
            "Account: name, email, phone, password (stored as an irreversible hash), role, language.",
            "Organization: name, logo, colours, country, payment methods shown to its clients, settings.",
            "Guests and clients (on the organization's behalf): name, email and/or phone, answer, ticket category, answers to questions, attendance, declared payment status.",
            "Payments to Jikū: amount, reference, status. Card and Mobile Money details stay with the payment provider.",
            "Usage: technical logs (IP address, browser, errors), feedback and messages sent to support.",
          ],
        ],
      },
      {
        id: "finalites",
        heading: "Why, and on what basis",
        body: [
          [
            "Providing the service and performing the contract: account, events, sends, tickets, entrance checks, invoicing.",
            "Security and abuse prevention: logs, rate limiting, fraud detection (legitimate interest).",
            "Improving the service: cookieless, non-identifying audience measurement, and feedback given voluntarily (legitimate interest).",
            "Meeting our legal obligations: invoices, accounting, answers to authorities.",
            "Informing you of significant changes to the service (contract); any commercial newsletter requires your consent and can be turned off in one click.",
          ],
        ],
      },
      {
        id: "destinataires",
        heading: "Who receives the data",
        body: [
          "Only authorized people at the organization concerned and at Jikū can access it. Our technical providers process it on our instructions:",
          [
            "Hosting: Vercel (website), Render (application server), Neon (database).",
            "Email: Resend or Brevo, depending on the organization's configuration.",
            "WhatsApp: Meta Platforms (WhatsApp Business Platform).",
            "SMS: Nimba SMS (Guinea).",
            "Payments to Jikū: CinetPay.",
            "Error tracking: Sentry.",
            "Audience measurement: Umami, cookieless, on an instance we operate.",
          ],
          "We disclose data to an authority only on a lawful request.",
        ],
      },
      {
        id: "transferts",
        heading: "Transfers outside Guinea",
        body: [
          "Several of these providers are located in the United States or the European Union. These transfers are necessary for the service; they rely on each provider's contractual data protection commitments, and connections are encrypted.",
        ],
      },
      {
        id: "conservation",
        heading: "How long",
        body: [
          [
            "Guests and clients: during the event or relationship, then automatic anonymization twelve months after the event (adjustable by the organization); immediately on an erasure request.",
            "Accounts: while the account is open, then thirty days for export before deletion.",
            "Invoices and accounting records: ten years, as OHADA accounting law requires.",
            "Technical logs: twelve months at most.",
          ],
        ],
      },
      {
        id: "securite",
        heading: "Security",
        body: [
          "Encrypted connections (HTTPS), hashed passwords, session tokens in secure cookies, each organization's data kept separate, limited and logged staff access, regular backups. In the event of a data breach, we inform the organizations concerned and the competent authority within the time limits set by law.",
        ],
      },
      {
        id: "droits",
        heading: "Your rights",
        body: [
          "You can ask to access, correct or erase your data, object to processing based on our legitimate interest, and ask for an export in a common format.",
          `Write to ${C.privacyEmail} stating your request; we may ask you to prove your identity. We reply within one month. If you are not satisfied with our answer, you can contact the Guinean personal data protection authority.`,
        ],
      },
      {
        id: "cookies",
        heading: "Cookies",
        body: [
          "Jikū uses only necessary cookies: the sign-in session and the chosen language. No advertising or cross-site tracking cookies. Audience measurement works without cookies and without storing IP addresses, so it does not require consent.",
        ],
      },
      {
        id: "mineurs",
        heading: "Minors",
        body: [
          "Organizer accounts are for adults only. An organization that invites minors (a school, a family event) makes sure it has their legal guardians' consent.",
        ],
      },
      {
        id: "modifications",
        heading: "Changes",
        body: [
          "We update this policy when the service or the law changes. The date at the top of the page shows the version in force; significant changes are announced to organizations by email.",
        ],
      },
    ],
  },
};
