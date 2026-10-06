# Décisions du design system

Pourquoi chaque composant existe, et ce qui a été écarté. Un composant sans
ligne ici ne devrait pas exister.

## Règles de nommage

Les composants de ce dossier portent des noms **anglais** : ce sont des
briques techniques, sans lien avec le domaine. Les composants d'application
(`CarteTheme`, `SelecteurNiveau`) gardent des noms **français**, parce qu'ils
parlent le vocabulaire de la base de données : catégorie, thème, niveau,
étoile. Mélanger les deux dans un même fichier est ce qui crée les erreurs de
traduction interne.

## Les composants

### Card
Une seule carte, six teintes pastel plus blanc, bleu et crème. Écartée : une
carte par couleur (`BlueCard`, `OcherCard`). La teinte est une donnée, pas un
composant.

### Button
Trois intentions : `principal` (fond encre), `inverse` (blanc sur fond
coloré), `discret` (contour seul). Écartés : `DangerButton`, `UnlockButton`.
« Débloquer » est un libellé et une flèche, pas une intention nouvelle.
Rend un `<button>`, ou un `<a>` si `href` est fourni : une action reste un
bouton, une navigation reste un lien.

### Tag
Étiquette courte : `Plus`, `Nouveau`, `Session invité`, `Gratuit`. Quatre
tons. Écarté : `LockTag`. Le cadenas est une icône passée en `icone`.

### Stars
Zéro à six étoiles. Le dessin est masqué aux lecteurs d'écran et doublé d'un
texte : six caractères `★` lus à la suite ne veulent rien dire.

### Meter
Barre de progression, trois tons : `avancement` (bleu), `xp` (ocre sur fond
bleu), `temps` (rouge). Écarté : `Timer`. Le décompte est un `Meter` avec un
ton différent, pas un composant à part.

### Ring
Anneau de pourcentage en `conic-gradient` : ni image, ni SVG, et il suit la
taille du texte.

### StatTile
Chiffre, libellé, icône. Utilisé pour « 23 parties jouées », « 7 jours ».

### Medallion
Badge rond avec son pictogramme, son libellé et son état. Distinct de `Tag` :
`Medallion` représente une récompense, `Tag` qualifie un contenu.

### SectionHeader
Titre de section et lien « Voir tout ». Trois écrans le répétaient.

### Segmented
Choix court et exclusif, visible d'un coup d'œil : Monde / Mon pays,
Semaine / Mois / Tout, FR / EN. Écarté : une liste déroulante, qui cache
l'état courant.

### Modal
Enveloppe l'élément `<dialog>` natif, qui apporte le piège à focus, la
fermeture par Échap et le retour du focus. Les réimplémenter, c'est se
tromper quelque part.

### AnswerOption
Proposition de réponse : lettre, texte, et un état (`neutre`, `juste`,
`faux`, `attendu`). L'état ne repose jamais sur la seule couleur.

## La charte

Reprise de l'identité Instagram : jaune `#FFD700`, encre bleu nuit `#15151B`,
et les couleurs du drapeau en appoint. Photographies en noir et blanc, titres
très gras, filets d'encre.

Trois décisions qui en découlent.

**Le texte sur le bleu de la charte est de l'encre, jamais du blanc.** Mesuré :
du blanc sur `#40A8E8` donne 2,63 contre 1, loin sous le seuil AA. Les couleurs
de texte sur aplat sont donc nommées (`--color-sur-bleu`, `--color-sur-rouge`)
plutôt que choisies au cas par cas.

**Six pastels pour les cartes de catégories.** Ils portent tous le texte en
encre, entre 13,5 et 16 contre 1. Ils ne se détachent du fond jaune que de 1,1
contre 1 : ce sont donc le rayon et l'ombre portée qui dessinent la carte, pas
la couleur. Le filet d'encre existe en option, mais il n'est pas posé d'office.

**Le rouge et le vert ne servent pas de fond aux cartes de catégories.** Ils
demandent du texte clair. Ils restent pour les états : juste, faux, alerte.

### BrandWordmark
Le logo est du TEXTE, pas une image : net à toute taille, zéro octet
téléchargé, lisible par les moteurs. Poppins, contour d'un pixel par
`-webkit-text-stroke`, avec un repli en texte plein si la propriété n'est pas
comprise. L'écusson est décoratif, le nom est écrit juste à côté.

## Journal

### 0.2.1
Correction après relecture des maquettes : les six pastels des cartes sont
rétablis, le filet d'encre redevient optionnel, la carte de rang passe en bleu
roi. Ajout de BrandWordmark.

### 0.2.0
Charte Repensons le Congo : jaune, encre bleu nuit, couleurs du drapeau en
appoint. Police Poppins, chargée par next/font.

### 0.1.0
Première version, extraite des écrans portés : Card, Button, Tag, Stars,
Meter, Ring, StatTile, Medallion, SectionHeader, Segmented, Modal,
AnswerOption.
