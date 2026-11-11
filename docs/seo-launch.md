# Référencement de Jikū — mise en ligne et suivi (JIKU-239)

Ce document dit ce que le code fait déjà pour le référencement, et ce qu'il reste
à faire **hors du code**, dans l'ordre, pour que « Jikū » donne un résultat de
marque complet.

## Ce qu'on vise : les « liens annexes » et le « panneau de marque »

Un résultat comme celui de roadmap.sh, avec le site en tête et ses pages
principales groupées en dessous, s'appelle des **liens annexes** (*sitelinks*).
L'encadré à droite qui présente une marque est le **panneau de connaissances**
(*knowledge panel*). L'ensemble forme la page de résultats de marque (*brand
SERP*).

Aucun réglage ne les déclenche. Google les génère seul quand trois conditions
sont réunies :

1. **La requête est clairement une recherche de la marque.** Aujourd'hui,
   « jiku » renvoie surtout des musiciens homonymes (YouTube, Spotify,
   SoundCloud). Le site n'est pas dans les 20 premiers résultats pour ce mot
   seul (relevé seorch du 14 octobre 2026).
2. **Le site est structuré lisiblement :** navigation stable, titres uniques,
   liens internes, fil d'Ariane, sitemap. C'est fait dans le code (voir plus
   bas).
3. **Google fait confiance à l'entité :** profils officiels cohérents, liens
   d'autres sites, recherches répétées du nom, ancienneté.

Les conditions 1 et 3 se construisent en semaines, voire en mois, avec les
étapes ci-dessous.

## Mesures de départ (14 octobre 2026)

| Outil | Résultat |
|---|---|
| HubSpot Website Grader | 92/100 : performance 22/30 (37 requêtes, 6 s), SEO 30/30, mobile 30/30, sécurité 10/10 |
| PageSpeed desktop | Performance 59 (TBT 9,8 s, Speed Index 10,7 s), SEO 92 (`robots.txt` en délai dépassé), navigation agentique 2/3 |
| seorch, « Jikū » | Absent du top 20 ; les homonymes musicaux occupent la page |
| Google, « jiku mrvin100 » | Site indexé, cité par l'aperçu IA, sans liens annexes |

## Ce que le code fait (JIKU-239)

- **Performance :**
  - le fond WebGL du hero ne démarre qu'une fois la page au repos, et jamais sur
    un navigateur sans GPU (rendu logiciel) : c'était la cause des 9,8 s de TBT ;
  - le SDK Sentry perd son code de débogage, de traçage et de Replay (non
    utilisés) : 53 Ko de JavaScript en moins sur chaque page ;
  - le logo est servi à sa taille réelle au lieu de 640 px.
- **Mesures locales, page d'accueil, médiane de 3 passages Lighthouse :**
  - desktop : 57 → 99 ;
  - mobile : 60 → 77 ;
  - LCP réel sur téléphone lent simulé : 1,8 s.
- **Identité de marque :**
  - un seul graphe `Organization` + `WebSite` sur toutes les pages, avec
    `alternateName: "Jiku"` pour les recherches sans macron ;
  - les profils officiels (`NEXT_PUBLIC_BRAND_PROFILES`) en `sameAs` ;
  - la société éditrice (`NEXT_PUBLIC_PUBLISHER_NAME`, `_URL`) ;
  - le contact support.
  - Le `LocalBusiness` sans adresse, invalide pour Google, est retiré.
  - Le `WebSite` nommé « Jikū » est le signal que Google lit pour afficher
    « Jikū » au-dessus du résultat.
- **Langues :** `x-default` dans chaque balise hreflang et dans le sitemap.
- **Hiérarchie :** fil d'Ariane structuré sur les guides, en plus des pages
  marketing.
- **Moteurs autres que Google :**
  - balises de vérification Bing (`NEXT_PUBLIC_BING_SITE_VERIFICATION`) et
    Yandex ;
  - IndexNow : clé servie à `/indexnow-key.txt` et commande
    `pnpm seo:indexnow`.
- **Assistants IA :** `llms.txt` est statique (il ne peut plus dépasser le
  délai) et liste aussi les guides.
- **Accessibilité :** le nom accessible des liens FR/EN contient le texte
  visible (WCAG 2.5.3), et le logo n'est plus lu deux fois.

## À faire hors du code, dans l'ordre

### 1. Google Search Console (jour 1)

1. Créer une propriété **Domaine** `hellojiku.com`, vérifiée par un
   enregistrement DNS TXT dans Cloudflare.
2. Envoyer le sitemap : `https://hellojiku.com/sitemap.xml`.
3. Une fois la redirection de `jiku.mrvin100.de` en place (ADR 110), déclarer
   le **changement d'adresse** depuis la propriété `mrvin100.de` si elle
   existe.
4. Avec **Inspection de l'URL**, demander l'indexation de :
   - `/` et `/en` ;
   - `/use-cases`, `/simulator`, `/faq` et `/docs`.
5. Suivre chaque semaine :
   - **Performances** : requêtes de marque, positions, clics ;
   - **Signaux Web essentiels** : données de vrais visiteurs, celles qui
     comptent pour le classement ;
   - **Améliorations** : fil d'Ariane.

### 2. Bing Webmaster Tools (jour 1)

1. **Importer depuis Google Search Console** : site et sitemap repris en un
   clic. Sinon, coller la balise dans `NEXT_PUBLIC_BING_SITE_VERIFICATION`.
2. L'index de Bing alimente aussi Yahoo, DuckDuckGo, Ecosia, ainsi que la
   recherche de ChatGPT et de Copilot.
3. Générer une clé IndexNow et la déployer dans `INDEXNOW_KEY`. Après chaque
   mise en production qui change des pages publiques, lancer :

   ```
   SITE_URL=https://hellojiku.com INDEXNOW_KEY=<clé> pnpm seo:indexnow
   ```

Yandex (`NEXT_PUBLIC_YANDEX_SITE_VERIFICATION`) est facultatif : peu utilisé
dans nos marchés.

### 3. Profils officiels de la marque (semaine 1)

Créer ou compléter, avec **exactement** le même nom (« Jikū »), le même logo,
la même description d'une phrase et un lien vers le site :

- page entreprise LinkedIn, page Facebook, Instagram, X, YouTube ;
- chaîne WhatsApp.

Mettre leurs URL dans `NEXT_PUBLIC_BRAND_PROFILES` (séparées par des virgules),
puis redéployer. Ces liens `sameAs` sont le signal principal du panneau de
marque.

### 4. Fiche d'établissement Google (Google Business Profile) : seulement si éligible

Google **refuse les entreprises uniquement en ligne**. Une fiche n'est permise
que si l'entreprise :

- reçoit des clients à une adresse pendant ses heures d'ouverture ; **ou**
- se déplace chez eux dans une zone définie (zone desservie, adresse masquée).

- **Si c'est le cas** (bureau à Conakry, ou équipe qui installe le check-in sur
  place) :
  1. créer la fiche au nom légal de la société, catégorie « Éditeur de
     logiciels » ;
  2. renseigner le site `https://hellojiku.com`, le même téléphone et le
     même e-mail que sur le site ;
  3. vérifier la fiche (vidéo ou courrier).
- **Sinon, ne pas en créer** : une fiche non conforme est suspendue et peut
  pénaliser le domaine. Le panneau de marque s'obtient alors par les étapes 3,
  5 et 6.

**Bloquant dans les deux cas :** les mentions légales contiennent encore des
champs à compléter (`components/modules/legal/company.ts` : dénomination, RCCM,
adresse, téléphone). Google compare le nom, l'adresse et le téléphone partout ;
ils doivent être réels et identiques.

### 5. Annuaires et sites qui citent Jikū (mois 1)

Chaque lien vers le site renforce l'entité et la position :

- **Lancements et annuaires :**
  - Product Hunt (lancement) ;
  - Crunchbase ;
  - G2 et Capterra (catégorie « Event management ») ;
  - annuaires de startups africaines et guinéennes.
- **Écosystème MRVIN100 :** liens depuis `mrvin100.de` (page produit) et depuis
  la page Cal.com du collectif.
- **Wikidata :** une fois qu'il existe des sources indépendantes (presse,
  annuaires), créer un élément « Jikū », logiciel, éditeur MRVIN100, site
  officiel, et l'ajouter à `NEXT_PUBLIC_BRAND_PROFILES`.
- **Presse et partenaires :** organisateurs de mariages, salles, cliniques
  pilotes qui mentionnent Jikū sur leur site.

### 6. Revendiquer le panneau de marque (dès qu'il apparaît)

Quand une recherche « Jikū » affiche un encadré à droite, cliquer sur
**Revendiquer ce panneau de connaissances**. La vérification passe par la
Search Console de l'étape 1. On peut ensuite proposer le bon logo, la
description et les profils.

## Domaine

Le site est servi sur `hellojiku.com` (ADR 110 du dépôt de l'API). L'ancien
`jiku.mrvin100.de` est redirigé en 308 page par page, une fois la vérification
Meta terminée, et la préproduction `jiku-web.vercel.app` envoie `noindex`.

## Suivi mensuel

| Indicateur | Où | Cible à 3 mois |
|---|---|---|
| Position sur « Jikū » et « Jiku invitations » | Search Console, seorch | Top 3 |
| Clics des requêtes de marque | Search Console → Performances | En hausse chaque mois |
| Signaux Web essentiels (mobile) | Search Console | « Bonnes » URL à 100 % |
| Pages indexées | Search Console → Pages | Toutes les pages du sitemap |
| Score PageSpeed mobile / desktop | pagespeed.web.dev | ≥ 80 / ≥ 95 |
