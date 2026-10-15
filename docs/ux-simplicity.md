# Simplicité des écrans : règles et budgets (JIKU-247)

Jikū se sert d'abord sur un téléphone, souvent debout, souvent pressé. Chaque
écran doit montrer **ce qu'il faut faire maintenant**, et rien d'autre. Ces
règles s'appliquent à toute PR qui touche l'interface ; la revue ux-expert les
vérifie (`.claude/skills/ux-expert`).

## Les sept règles

1. **Une seule action principale par écran.** Elle porte le style plein
   (`Button` par défaut). Les autres actions sont secondaires (`outline`,
   `ghost`) ou rangées dans un menu « … » (`DropdownMenu`).
2. **Rien en double.** Une information, un lien ou une action n'existe qu'à un
   endroit : menu, accueil ou page — pas les trois. Une action répétée sur
   chaque ligne d'une liste passe dans le menu de la ligne.
3. **Pas de mode d'emploi à l'écran.** Un paragraphe qui explique l'interface
   devient une infobulle, un lien vers le guide (`/docs`), ou disparaît. Les
   libellés et les états vides parlent d'eux-mêmes.
4. **Montrer quand c'est utile.** Un graphique sans données, un bloc « jour J »
   trois semaines avant, une section vide : on ne les affiche pas. L'état vide
   propose l'action suivante (`Empty`), il n'empile pas des zéros.
5. **Le secondaire se replie.** Réglages avancés, historique, détails :
   `Collapsible`, `Sheet` (ordinateur) ou `Drawer` (téléphone), jamais déroulés
   d'office.
6. **Le téléphone d'abord.** Chaque écran se vérifie à 390 px avant 1440 px.
   Pas de défilement horizontal, sauf dans un tableau.
7. **Des liens courts.** Un lien partagé (invitation, réservation, file,
   opérateur) passe par un code court (`/i/…`, `/r/…`), jamais par un jeton long.

## L'échelle tactile

Les composants de `components/ui` ont deux tailles. Sous 768 px (`max-md:`),
boutons, champs, onglets, choix et éléments de menu font **44 px** (WCAG 2.5.5,
recommandation Apple et Google) et les champs passent en **16 px**, sinon
iOS zoome à chaque saisie. Au-delà de 768 px, la densité compacte reste, faite
pour la souris.

- Ne pas forcer une hauteur (`h-7`, `size-8`…) sur un bouton dans un module :
  utiliser `size="sm"` (40 px sur mobile) ou `size="icon-sm"`.
- Une grille à colonnes fixes (`grid-cols-[1fr_8rem_…]`) commence par une
  version mobile (`grid-cols-2 sm:grid-cols-[…]`).

## Les budgets, mesurés à 390 × 844

| Mesure | Budget | Pourquoi |
|---|---|---|
| Hauteur de page | ≤ 2 écrans (parcours public : 1) | Au-delà, l'essentiel passe sous le pli |
| Actions principales | 1 | Règle 1 |
| Actions visibles avant défilement | ≤ 8 | Charge de choix (loi de Hick) |
| Mots avant défilement | ≤ 80 (public : ≤ 50) | On lit en diagonale sur un téléphone |
| Paragraphes de plus de 20 mots | 0 | Règle 3 |
| Cibles tactiles < 44 px (hors liens dans le texte) | 0, 40 px toléré pour `sm` | WCAG 2.5.5 / 2.5.8 |
| Actions répétées à l'identique | 0 | Règle 2 |
| Cartes dans des cartes | 0 | Bruit visuel |

La mesure se fait avec Playwright : chaque écran est ouvert à 390 × 844, puis
on compte la hauteur, les mots et les actions (avant et après le pli), les
boutons principaux, les paragraphes longs, les cibles de moins de 44 px et les
actions répétées. Une PR qui touche un écran donne ses chiffres avant / après.
