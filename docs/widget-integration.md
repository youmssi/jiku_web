# Widget de réservation — contrat d'intégration (JIKU-92)

## Positionnement

Un script embarrable sur le site du client est la seule intégration « vendable en
dix minutes » : ceux qui savent consommer une API ont des cycles de douze mois,
ceux qu'on vend sans équipe technique non. Le widget donne le parcours de
réservation d'un service (rendez-vous sans compte) sur la page du client, sans
que celui-ci n'ait de développeur.

## Contrat v1

- **Périmètre** : réservation de créneau d'un **service** unique (lien signé).
  Hors périmètre v1 : événements/billets, paiement en ligne, multi-services,
  thème personnalisé.
- **Aucune authentification** : le widget consomme les points publics existants
  (`/appointments/{token}`, `/appointments/{token}/book`), déjà résolus sans
  compte via le lien de service signé. Le token est distribué par l'espace
  organisateur (GET `/services/{id}/booking-link`).
- **Forme** : une iframe isolée vers `/widget/{token}` du même hôte (locale `fr`
  par défaut). Aucune donnée du site hôte n'est requise ; l'iframe ne communique
  que sa hauteur.
- **Hauteur automatique** : la page embarrable envoie `jiku-widget:height` au
  parent ; le chargeur vérifie `event.origin` puis redimensionne l'iframe
  (minimum `data-minheight`, défaut 520 px).
- **Sécurité** : le chargeur n'accepte les messages que de l'origine du script ;
  le contenu de la page n'écrit jamais dans le parent.

## Usage

```html
<script src="https://<hôte>/jiku-widget.js" defer></script>
<div data-jiku-widget data-token="VOTRE_JETON"></div>
```

Attributs optionnels :

| Attribut | Rôle |
| --- | --- |
| `data-base` | Hôte du widget (défaut : origine du script) |
| `data-minheight` | Hauteur minimale en px (défaut 520) |
| `data-lang` | Réservé — locale (défaut : fr) |

## Suivi de réservation

Après une réservation, l'iframe propose « Voir ou annuler mon rendez-vous », qui
ouvre `/widget/{token}/suivi/{bookingToken}` — toujours dans l'iframe.

## Limites assumées (v2)

- Vocabulaire et marque par tenant (JIKU-91) à faire remonter jusqu'aux pages
  publiques et au widget.
- Thème (couleurs, texte d'appel) piloté par `data-*`.
- Passage de données du site hôte vers l'iframe (profil, campagne).
