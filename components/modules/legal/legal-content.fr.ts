import { COMPANY } from "./company";
import type { LegalDocuments } from "./legal-types";

const C = COMPANY;

export const LEGAL_FR: LegalDocuments = {
  legal: {
    title: "Mentions légales",
    description:
      "Éditeur, hébergeurs et contacts du service Jikū, édité par une société de droit guinéen établie à Conakry.",
    intro:
      "Ces mentions identifient la société qui édite Jikū, les prestataires qui l'hébergent et la façon de nous joindre.",
    sections: [
      {
        id: "editeur",
        heading: "Éditeur du service",
        body: [
          `Le site et l'application Jikū sont édités par ${C.legalName}, ${C.legalForm} au capital de ${C.shareCapital}, immatriculée au Registre du commerce et du crédit mobilier de Conakry sous le numéro ${C.rccm}, numéro d'identification fiscale ${C.nif}.`,
          `Siège social : ${C.address}.`,
          [`E-mail : ${C.email}`, `Téléphone et WhatsApp : ${C.phone}`],
        ],
      },
      {
        id: "publication",
        heading: "Directeur de la publication",
        body: [`${C.director}, en qualité de représentant légal de ${C.legalName}.`],
      },
      {
        id: "hebergement",
        heading: "Hébergement",
        body: [
          "Le service est hébergé par des prestataires situés hors de Guinée, qui ne traitent les données que sur nos instructions :",
          [
            "Site web : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.",
            "Serveur applicatif : Render Services, Inc., San Francisco, Californie, États-Unis.",
            "Base de données : Neon (PostgreSQL managé), infrastructure cloud aux États-Unis ou dans l'Union européenne selon la région retenue.",
          ],
          "La liste complète des prestataires qui traitent des données personnelles figure dans la politique de confidentialité.",
        ],
      },
      {
        id: "propriete",
        heading: "Propriété intellectuelle",
        body: [
          `La marque Jikū, son logo, les textes, les visuels et le code du service sont la propriété de ${C.legalName} ou de ses concédants. Toute reproduction ou réutilisation sans autorisation écrite est interdite.`,
          "Les logos, couleurs et contenus qu'une organisation ajoute à son espace restent sa propriété. Elle nous autorise à les afficher uniquement pour faire fonctionner le service qu'elle utilise.",
        ],
      },
      {
        id: "signalement",
        heading: "Signaler un contenu",
        body: [
          `Une invitation, une page ou un message vous semble illicite ou trompeur ? Écrivez à ${C.email} en joignant le lien concerné. Nous répondons sous cinq jours ouvrés et pouvons suspendre le contenu pendant l'examen.`,
        ],
      },
      {
        id: "droit",
        heading: "Droit applicable",
        body: [
          "Ces mentions sont régies par le droit de la République de Guinée. Les conditions d'utilisation et de vente précisent les règles de règlement des litiges.",
        ],
      },
    ],
  },
  terms: {
    title: "Conditions générales d'utilisation et de vente",
    description:
      "Les règles d'utilisation de Jikū, les prix, la facturation, les obligations de chacun et le traitement des données de vos invités et clients.",
    intro:
      "Ces conditions forment le contrat entre la société qui édite Jikū et toute organisation ou personne qui crée un compte. Créer un compte ou payer une offre vaut acceptation de la version en vigueur à cette date.",
    sections: [
      {
        id: "definitions",
        heading: "1. Définitions",
        body: [
          [
            `« Jikū », « nous » : ${C.legalName}, éditeur du service.`,
            "« Organisation » : l'entreprise, l'association, l'administration ou la personne qui ouvre un compte pour gérer des événements ou des services.",
            "« Utilisateur » : toute personne qui se connecte à l'espace d'une organisation (propriétaire, administrateur, membre, personne qui sert les clients).",
            "« Invité » ou « client » : la personne qu'une organisation invite à un événement ou reçoit dans le cadre d'un service (rendez-vous, file d'attente).",
            "« Opérateur » ou « contrôleur » : la personne qui scanne les billets ou appelle les clients pour le compte d'une organisation.",
          ],
        ],
      },
      {
        id: "service",
        heading: "2. Le service",
        body: [
          "Jikū permet à une organisation :",
          [
            "d'inviter des personnes à un événement par e-mail ou WhatsApp, de suivre leurs réponses et de leur délivrer un billet avec QR code ;",
            "de vendre des billets dont le prix est payé directement à l'organisation ;",
            "de gérer des rendez-vous, des réservations et une file d'attente pour ses services ;",
            "de contrôler les entrées, y compris sans connexion internet, et de suivre la présence.",
          ],
          "Nous faisons évoluer le service régulièrement. Une fonction annoncée comme « bientôt disponible » n'est pas due tant qu'elle n'est pas publiée.",
        ],
      },
      {
        id: "compte",
        heading: "3. Compte et accès",
        body: [
          "La personne qui ouvre le compte déclare avoir le pouvoir d'engager l'organisation. Elle fournit des informations exactes et les tient à jour.",
          "Chaque utilisateur garde ses identifiants confidentiels. L'organisation répond des actions faites depuis ses comptes et nous prévient sans délai de tout accès non autorisé.",
          "Nous pouvons demander des justificatifs pour vérifier une organisation, en particulier avant l'ouverture d'une vente de billets.",
        ],
      },
      {
        id: "prix",
        heading: "4. Prix et offres",
        body: [
          "Les prix en vigueur sont publiés sur la page des prix et dans le simulateur, en francs guinéens (GNF) pour les organisations établies en Guinée. Un équivalent en dollars peut être affiché à titre indicatif ; seul le montant en monnaie locale fait foi.",
          [
            "Services (rendez-vous, réservation, file d'attente) : abonnement par personne qui sert les clients et par mois, payable au mois ou à l'année. L'offre Solo est gratuite pour une personne.",
            "Événements avec invitations gratuites : gratuits jusqu'à 100 invités sur douze mois glissants par organisation, puis un prix par événement selon le nombre d'invités. Passer au palier supérieur ne fait payer que la différence.",
            "Billets payants : une commission de 3 % du prix de chaque billet vendu, payée à Jikū par tranche avant la vente (voir l'article 6).",
            "Les envois par SMS sont une option payante dont le prix est affiché avant chaque envoi.",
          ],
          "Les prix s'entendent [hors taxes / toutes taxes comprises]. Toute modification de prix est annoncée au moins trente jours à l'avance par e-mail et ne s'applique pas à une période déjà payée.",
        ],
      },
      {
        id: "paiement",
        heading: "5. Paiement et facturation",
        body: [
          "Les sommes dues à Jikū se paient d'avance, par Orange Money, MTN Mobile Money, carte bancaire ou tout autre moyen proposé au moment du paiement. Le paiement en ligne est traité par notre prestataire de paiement ; nous ne conservons jamais vos données de carte.",
          "Une facture est émise pour chaque paiement et reste disponible dans l'espace de l'organisation.",
          "Un abonnement arrivé à échéance et non renouvelé reste utilisable pendant un délai de grâce de trois jours. Passé ce délai, les fonctions payantes sont suspendues jusqu'au paiement ; les données ne sont pas supprimées pour autant.",
          "Sauf disposition légale contraire, une somme payée n'est pas remboursable. Une période en cours n'est pas remboursée au prorata en cas de résiliation.",
        ],
      },
      {
        id: "billetterie",
        heading: "6. Vente de billets",
        body: [
          "L'argent des billets est payé directement par l'acheteur à l'organisation, sur les moyens de paiement qu'elle a indiqués. Jikū n'encaisse, ne détient et ne reverse jamais cet argent, et n'intervient pas dans les remboursements aux acheteurs : ils relèvent de l'organisation seule.",
          "À l'ouverture de la vente, Jikū demande la commission d'une tranche de billets (par défaut les 50 prochains, jamais plus que les places restantes). Chaque billet marqué « payé » consomme une place de la tranche. La vente se met en pause quand la tranche est épuisée, jusqu'au paiement de la suivante.",
          "La part d'une tranche non utilisée à la fin de l'événement est reportée sur les ventes ou paiements suivants de l'organisation pendant douze mois. Elle n'est ni remboursée en argent ni transférable.",
          "L'organisation fixe ses prix, ses conditions de vente et d'annulation, et les communique aux acheteurs. Elle reste seule responsable de ses obligations fiscales sur ses ventes.",
        ],
      },
      {
        id: "obligations",
        heading: "7. Engagements de l'organisation",
        body: [
          "L'organisation s'engage à :",
          [
            "n'importer que des contacts qu'elle a le droit d'utiliser, et n'inviter que des personnes qui peuvent s'attendre à recevoir ses messages ;",
            "ne pas utiliser Jikū pour de la prospection non sollicitée, du contenu illicite, trompeur, haineux ou portant atteinte aux droits d'autrui ;",
            "respecter les règles des messageries utilisées, notamment la politique de WhatsApp Business ;",
            "organiser l'événement ou rendre le service annoncé, et répondre elle-même aux demandes de ses invités et clients.",
          ],
          "En cas de manquement, nous pouvons suspendre un envoi, une page ou le compte, après avertissement sauf urgence (fraude, risque pour les personnes, demande d'une autorité).",
        ],
      },
      {
        id: "donnees",
        heading: "8. Données des invités et des clients",
        body: [
          "Pour les données de ses invités et clients, l'organisation est responsable du traitement et Jikū agit comme sous-traitant, au sens de la loi guinéenne sur la protection des données personnelles. Jikū s'engage à :",
          [
            "ne traiter ces données que pour fournir le service demandé par l'organisation, et jamais pour son propre compte ni pour de la publicité ;",
            "en garantir la confidentialité, y compris par ses employés et prestataires, tenus aux mêmes obligations ;",
            "mettre en œuvre des mesures de sécurité adaptées (chiffrement des échanges, contrôle des accès, cloisonnement des données de chaque organisation, journalisation) ;",
            "aider l'organisation à répondre aux demandes des personnes et l'informer sans délai de toute violation de données la concernant ;",
            "supprimer ou anonymiser les données à la fin de leur durée de conservation, ou à la fermeture du compte après un délai d'export de trente jours.",
          ],
          "Les prestataires qui interviennent (hébergement, envoi d'e-mails, WhatsApp, SMS, paiement) sont listés dans la politique de confidentialité. L'organisation autorise leur intervention ; nous l'informons de tout changement.",
        ],
      },
      {
        id: "disponibilite",
        heading: "9. Disponibilité et assistance",
        body: [
          "Nous mettons tout en œuvre pour que le service soit disponible en continu, sans pouvoir le garantir : maintenances, pannes des opérateurs télécom ou des prestataires peuvent l'interrompre. Les billets déjà affichés et le contrôle d'entrée continuent de fonctionner sans connexion.",
          `L'assistance est joignable par e-mail (${C.email}) et WhatsApp (${C.phone}), les jours ouvrés.`,
        ],
      },
      {
        id: "responsabilite",
        heading: "10. Responsabilité",
        body: [
          "Jikū fournit un outil. L'organisation reste responsable de ses événements, de ses services, de ses prix, de ses messages et des relations avec ses invités et clients.",
          "Notre responsabilité ne peut être engagée que pour une faute prouvée, et pour les seuls dommages directs. Elle est limitée au total des sommes payées par l'organisation à Jikū au cours des douze mois précédant le fait générateur.",
          "Aucune des parties n'est responsable d'un manquement causé par un cas de force majeure, notamment une coupure générale d'internet ou d'électricité, une décision d'une autorité ou une défaillance d'un opérateur télécom.",
        ],
      },
      {
        id: "duree",
        heading: "11. Durée, résiliation et export",
        body: [
          "Le contrat dure tant que le compte existe. L'organisation peut fermer son compte à tout moment depuis ses paramètres ou en nous écrivant.",
          "Avant la fermeture, l'organisation peut exporter ses listes d'invités et ses données. Après fermeture, les données restent exportables trente jours, puis sont supprimées ou anonymisées, sauf celles que la loi nous impose de conserver (factures notamment).",
        ],
      },
      {
        id: "modifications",
        heading: "12. Modification des conditions",
        body: [
          "Nous pouvons modifier ces conditions. Une modification importante est annoncée par e-mail au moins trente jours avant de s'appliquer. Continuer à utiliser le service après cette date vaut acceptation ; à défaut, l'organisation peut fermer son compte.",
        ],
      },
      {
        id: "litiges",
        heading: "13. Droit applicable et litiges",
        body: [
          "Ces conditions sont régies par le droit de la République de Guinée et par les Actes uniformes de l'OHADA applicables.",
          `En cas de désaccord, écrivez-nous d'abord à ${C.email} : nous cherchons une solution amiable dans un délai de trente jours. À défaut, le litige est porté devant le Tribunal de commerce de Conakry.`,
        ],
      },
    ],
  },
  privacy: {
    title: "Politique de confidentialité",
    description:
      "Quelles données Jikū traite, pourquoi, avec qui, combien de temps, et comment exercer vos droits : organisateurs, invités et clients.",
    intro:
      "Cette politique s'adresse à deux publics : les organisations et leurs utilisateurs, dont nous sommes responsables des données de compte, et les invités ou clients d'une organisation, dont les données sont traitées pour le compte de celle-ci. Elle applique la loi guinéenne relative à la cybersécurité et à la protection des données à caractère personnel.",
    sections: [
      {
        id: "invites",
        heading: "Vous êtes invité ou client d'une organisation",
        body: [
          "L'organisation qui vous a invité ou que vous consultez a saisi vos coordonnées. Elle décide de l'usage de vos données et en est responsable ; Jikū les traite pour son compte, uniquement pour :",
          [
            "vous envoyer l'invitation, le billet, les rappels et les changements (annulation, report) ;",
            "enregistrer votre réponse, vos réponses aux questions de l'organisateur et votre éventuel paiement déclaré ;",
            "contrôler votre billet à l'entrée ou vous appeler dans la file ;",
            "établir des statistiques anonymes de présence pour l'organisation.",
          ],
          "Nous ne vendons pas vos données et ne les utilisons jamais pour notre propre publicité.",
          "Vous pouvez effacer vos données personnelles à tout moment avec le bouton « Demander la suppression de mes données » de votre page d'invitation ou de billet. L'effacement est immédiat et définitif ; il ne reste qu'une trace anonyme qu'un invité a été convié. Pour toute autre demande, adressez-vous à l'organisation, ou écrivez-nous et nous la lui transmettrons.",
        ],
      },
      {
        id: "responsable",
        heading: "Qui est responsable",
        body: [
          `Pour les comptes des organisations et de leurs utilisateurs, et pour le site public : ${C.legalName}, ${C.address}. Contact dédié : ${C.privacyEmail}.`,
          `Déclaration auprès de l'autorité de protection des données : ${C.dpaDeclaration}.`,
        ],
      },
      {
        id: "donnees",
        heading: "Les données que nous traitons",
        body: [
          [
            "Compte : nom, e-mail, téléphone, mot de passe (stocké sous forme chiffrée irréversible), rôle, langue.",
            "Organisation : nom, logo, couleurs, pays, moyens de paiement affichés à ses clients, paramètres.",
            "Invités et clients (pour le compte de l'organisation) : nom, e-mail et/ou téléphone, réponse, catégorie de billet, réponses aux questions, présence, statut de paiement déclaré.",
            "Paiements à Jikū : montant, référence, statut. Les données de carte ou de Mobile Money restent chez le prestataire de paiement.",
            "Utilisation : journaux techniques (adresse IP, navigateur, erreurs), avis et messages envoyés au support.",
          ],
        ],
      },
      {
        id: "finalites",
        heading: "Pourquoi et sur quelle base",
        body: [
          [
            "Fournir le service et exécuter le contrat : compte, événements, envois, billets, contrôle d'entrée, facturation.",
            "Sécurité et prévention des abus : journaux, limitation des tentatives, détection de fraude (intérêt légitime).",
            "Améliorer le service : mesures d'audience sans cookie et sans identification, avis donnés volontairement (intérêt légitime).",
            "Respecter nos obligations légales : factures, comptabilité, réponses aux autorités.",
            "Vous informer des évolutions importantes du service (contrat) ; toute lettre d'information commerciale nécessite votre accord et se désactive en un clic.",
          ],
        ],
      },
      {
        id: "destinataires",
        heading: "Qui reçoit les données",
        body: [
          "Seules les personnes habilitées de l'organisation concernée et de Jikū y accèdent. Nos prestataires techniques les traitent sur nos instructions :",
          [
            "Hébergement : Vercel (site web), Render (serveur applicatif), Neon (base de données).",
            "E-mails : Resend ou Brevo, selon la configuration de l'organisation.",
            "WhatsApp : Meta Platforms (WhatsApp Business Platform).",
            "SMS : Nimba SMS (Guinée).",
            "Paiements à Jikū : CinetPay.",
            "Suivi des erreurs : Sentry.",
            "Mesure d'audience : Umami, sans cookie, sur une instance que nous administrons.",
          ],
          "Nous ne communiquons de données à une autorité que sur demande légale.",
        ],
      },
      {
        id: "transferts",
        heading: "Transferts hors de Guinée",
        body: [
          "Plusieurs de ces prestataires sont situés aux États-Unis ou dans l'Union européenne. Ces transferts sont nécessaires au service ; ils s'appuient sur les engagements contractuels de protection des données de chaque prestataire, et les échanges sont chiffrés.",
        ],
      },
      {
        id: "conservation",
        heading: "Combien de temps",
        body: [
          [
            "Invités et clients : pendant l'événement ou la relation, puis anonymisation automatique douze mois après l'événement (durée ajustable par l'organisation) ; immédiatement en cas de demande d'effacement.",
            "Comptes : tant que le compte est ouvert, puis trente jours pour l'export avant suppression.",
            "Factures et pièces comptables : dix ans, comme le prévoit le droit comptable OHADA.",
            "Journaux techniques : douze mois au plus.",
          ],
        ],
      },
      {
        id: "securite",
        heading: "Sécurité",
        body: [
          "Échanges chiffrés (HTTPS), mots de passe hachés, jetons de session en cookies sécurisés, données de chaque organisation cloisonnées, accès du personnel limité et journalisé, sauvegardes régulières. En cas de violation de données, nous prévenons les organisations concernées et l'autorité compétente dans les délais prévus par la loi.",
        ],
      },
      {
        id: "droits",
        heading: "Vos droits",
        body: [
          "Vous pouvez demander l'accès à vos données, leur rectification, leur effacement, vous opposer à un traitement fondé sur notre intérêt légitime, et demander leur export dans un format courant.",
          `Écrivez à ${C.privacyEmail} en précisant votre demande ; nous pouvons vous demander de justifier votre identité. Nous répondons sous un mois. Si notre réponse ne vous satisfait pas, vous pouvez saisir l'autorité guinéenne de protection des données personnelles.`,
        ],
      },
      {
        id: "cookies",
        heading: "Cookies",
        body: [
          "Jikū n'utilise que des cookies nécessaires : la session de connexion et la langue choisie. Aucun cookie publicitaire ni de suivi entre sites. La mesure d'audience fonctionne sans cookie et sans conserver d'adresse IP : elle ne demande donc pas de consentement.",
        ],
      },
      {
        id: "mineurs",
        heading: "Mineurs",
        body: [
          "Le compte organisateur est réservé aux personnes majeures. Une organisation qui invite des mineurs (école, événement familial) s'assure d'avoir l'accord de leurs représentants légaux.",
        ],
      },
      {
        id: "modifications",
        heading: "Modifications",
        body: [
          "Nous mettons cette politique à jour quand le service ou la loi évolue. La date en tête de page indique la version en vigueur ; un changement important est annoncé par e-mail aux organisations.",
        ],
      },
    ],
  },
};
