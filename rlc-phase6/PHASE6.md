# Phase 6 — Habillage

Le design system posé en jetons, et l'application habillée en les consommant.

## Installation

```bash
unzip -o rlc-phase6.zip
cp rlc-phase6/app/jetons.css rlc-phase6/app/habillage.css app/
cp -r rlc-phase6/scripts .
rm app/lecture.css
```

Dans `app/[langue]/layout.tsx` :

```diff
-  import "../lecture.css";
+  import "../jetons.css";
+  import "../habillage.css";
```

L'ordre compte : les jetons se déclarent avant d'être consommés.

Dans `package.json`, section `scripts` :

```json
"verifier:jetons": "node scripts/verifier-jetons.mjs"
```

Et si tu veux que le contrôle bloque une construction défaillante :

```json
"build": "npm run verifier:jetons && next build"
```

## Le découplage à deux étages

C'est ce que cette phase rend explicite, et ce qui détermine le coût de tout
changement futur.

| Ce qui change | Ce que ça touche |
| --- | --- |
| Identité visuelle, charte d'un partenaire, thème | `jetons.css`, rien d'autre |
| Hiérarchie, ordre des écrans, contenu | Le balisage de la phase 1 |

Aucune structure n'a été modifiée dans cette phase. Le critère de recette est
donc inchangé, et il est à retester : **désactiver les deux feuilles de style
doit laisser l'application complète et utilisable**.

## La discipline, et comment elle est tenue

`app/jetons.css` est le seul fichier autorisé à contenir une valeur
littérale. Partout ailleurs, uniquement des `var(--…)`.

`npm run verifier:jetons` échoue si une couleur hexadécimale, un `rgb()`, un
`px` ou un `rem` apparaît ailleurs, et signale aussi les styles en ligne dans
le JSX, qui contourneraient le contrôle. Vérifié dans les deux sens : il passe
sur les fichiers livrés, et il échoue si on y glisse un `#ff0000`.

Sans ce contrôle, la promesse « on change les jetons, tout suit » devient
fausse en trois semaines, et personne ne s'en aperçoit avant d'essayer.

### La seule exception, et elle est documentée

Une variable CSS **ne fonctionne pas dans une media query**. Les points de
rupture restent donc littéraux dans `habillage.css`. Ils sont listés en
commentaire dans `jetons.css` pour rester trouvables, et le contrôle ignore
les lignes `@media`.

## Les choix d'apparence, et pourquoi

**Fond crème, jamais blanc pur.** Un écran blanc éblouit au soleil, et une
partie de l'audience joue dehors.

**Cibles tactiles à 48px**, soit le double du minimum WCAG. L'application
s'utilise debout, en marchant.

**Aucune police téléchargée.** Pile système : rien à héberger, rien à
déclarer au RGPD, premier affichage immédiat sur connexion faible. Le jour où
une police de marque est retenue, seules deux valeurs de `jetons.css`
changent — aucun composant ne nomme de police.

**Le motif kuba est une texture, pas un ornement.** Il vit en fond de bandeau
à faible opacité, jamais derrière un texte au contraste limite.

**L'ocre ne porte jamais de texte blanc.** 1,9:1, sous tous les seuils. D'où
le jeton `encre-sur-ocre`, qui ne change pas de valeur entre thème clair et
sombre puisque l'ocre reste clair dans les deux.

**Aucune couleur ne porte d'information seule.** Une bonne réponse est écrite
dans le libellé du bouton ; le vert ne fait que renforcer. Un niveau
verrouillé a un trait discontinu en plus de sa condition écrite.

**Thème sombre** via `prefers-color-scheme`, avec sa propre palette : ce n'est
pas une inversion, les valeurs ont été choisies pour tenir les contrastes.

## Vérifications

**Le contrôle de jetons.**

```bash
npm run verifier:jetons
```

**Sans feuilles de style.** Dans les outils de développement, désactive les
deux feuilles. L'application doit rester complète et navigable. C'est le
critère qui garantit que l'habillage n'a rien cassé.

**Les deux thèmes.** Bascule le système en mode sombre et repasse sur
l'écran de quiz, les cartes catégories et le back-office.

**Au clavier.** Le contour de focus doit être visible partout, dans les deux
thèmes, y compris sur le bandeau bleu.

**À 200 % de zoom et à 320px de large.** Rien ne doit déborder
horizontalement, et les tableaux du back-office doivent défiler dans leur
conteneur sans emporter la page.

**Mouvement réduit.** Active la préférence système : aucune information ne
doit disparaître, puisque rien n'en dépend.

## Ce que j'ai décidé par défaut

Trois arbitrages pris faute de réponse, à contester si besoin :

- **Illustrations** : aplats de couleur et motif kuba, avec l'emplacement
  prévu dans la carte. Ajouter une image plus tard ne demandera aucun
  changement de structure.
- **Back-office habillé**, avec les mêmes jetons. Ça ne coûtait presque rien,
  et des tableaux bruts fatiguent vite quand on traduit cinquante questions
  d'affilée.
- **Score en fin de partie seulement**, comme aujourd'hui. L'arbitrage
  appartient aux porteurs du projet : techniquement c'est trois lignes.

## Ce qui reste pour la V1

| Phase | Reste |
| --- | --- |
| 7 — Paiement | Bloquée par la structure juridique |
| 8 — PWA | Manifeste, hors ligne, installation, notifications |
| 9 — Contenu | Huit quiz vides, questions difficiles manquantes, vérification des sources, lingala, traduction anglaise |
| 10 — Recette | Tests, RGPD, mise en ligne |

La phase 9 n'a toujours pas démarré et reste le chemin critique réel : le code
sera prêt avant le contenu.
