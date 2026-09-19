# Contrat sémantique et accessibilité

Ce document est la référence unique. Chaque écran de l'application, présent et
futur, l'applique. Il est rédigé avant tout style, et il survivra à tous les
changements d'habillage.

**Critère de recette central : l'application doit rester complète,
compréhensible et utilisable avec les feuilles de style désactivées.**

Cible : WCAG 2.2 niveau AA, conformément au §15 du cahier des charges.

---

## 1. Structure de page

Chaque écran comporte, dans cet ordre :

1. un lien d'évitement vers `#contenu`, premier élément focusable du document ;
2. un `<header>` ;
3. un `<main id="contenu">`, unique, contenant un `<h1>` unique ;
4. un `<footer>` le cas échéant.

Les hiérarchies de titres sont continues : jamais de `h3` sans `h2` au-dessus.
Le niveau de titre exprime la structure, jamais la taille du texte.

Chaque `<nav>` porte un `aria-label` distinct : « Navigation principale »,
« Navigation secondaire », « Fil d'Ariane ». Sans cela, un lecteur d'écran
annonce plusieurs régions identiques.

`aria-current="page"` marque la page courante dans la navigation.

---

## 2. Éléments natifs avant ARIA

La règle est absolue : **si un élément HTML fait le travail, on ne le
reconstruit pas en ARIA.**

| Besoin | Élément | Ce qu'il apporte gratuitement |
| --- | --- | --- |
| Barre de progression | `<progress>` | Rôle, valeur, minimum, maximum |
| Panneau dépliable | `<details>` / `<summary>` | État ouvert/fermé, relation, clavier |
| Fenêtre modale | `<dialog>` | Piège à focus, touche Échap, restitution du focus |
| Date, durée | `<time datetime>` | Valeur machine-lisible |
| Couples libellé / valeur | `<dl>` | Relation entre le terme et sa définition |
| Données comparables | `<table>` + `<caption>` + `scope` | Navigation cellule par cellule |

Un `<div>` avec un `role` est toujours un aveu d'échec. Il n'est acceptable
que si aucun élément natif ne couvre le besoin.

---

## 3. Boutons contre liens

- **Lien** : change de page ou d'emplacement. Doit fonctionner en nouvel
  onglet et être partageable.
- **Bouton** : déclenche une action dans la page.

Sur l'écran de question, les réponses sont des **boutons**, pas des boutons
radio. Un bouton radio suppose qu'on sélectionne, qu'on peut changer d'avis,
puis qu'on valide. Ici le clic **est** la réponse : elle est immédiate,
définitive et chronométrée. Le choix de l'élément doit dire la vérité de
l'interaction.

---

## 4. Indisponibilité : `aria-disabled` plutôt que `disabled`

Un bouton avec l'attribut `disabled` sort de l'ordre de tabulation. Un
utilisateur de lecteur d'écran ne le rencontre donc jamais et n'apprend pas
qu'il existe, ni pourquoi il est verrouillé.

La règle :

- `aria-disabled="true"` pour tout ce qui est verrouillé mais déblocable :
  niveau non atteint, quiz spécial sans assez de questions, contenu Plus ;
- `aria-describedby` pointant vers un texte qui énonce la condition ;
- le gestionnaire d'événement ignore le clic ;
- `disabled` reste réservé aux champs d'un formulaire temporairement inertes.

---

## 5. Régions live

Trois règles, apprises du prototype.

**La région existe dès le chargement, vide.** Une région live insérée dans le
DOM après coup n'est pas annoncée de façon fiable.

**`polite`, jamais `assertive`.** Rien dans cette application ne justifie
d'interrompre l'utilisateur en cours de phrase.

**Ce qui change dix fois par seconde n'est jamais live.** Le chronomètre porte
`aria-hidden="true"` sur sa valeur visuelle. Les seuils, à 10 puis 5 secondes,
sont annoncés dans une région distincte.

Régions prévues : le retour de réponse (correction, explication, source), les
alertes de chronomètre, les confirmations d'enregistrement.

---

## 6. Gestion du focus

| Événement | Où va le focus |
| --- | --- |
| Question suivante | Sur le `<h1>` de la nouvelle question, porteur de `tabindex="-1"` |
| Fin de partie | Sur le `<h1>` du résultat |
| Ouverture d'une modale | Sur son premier élément interactif |
| Fermeture d'une modale | Sur l'élément qui l'a ouverte |
| Navigation entre écrans | Sur le `<h1>` de l'écran atteint |

Sans cela, le focus reste sur un bouton qui vient de disparaître, et la
personne se retrouve projetée en haut du document sans explication.

`:focus-visible` doit rester perceptible dans tous les thèmes. Ne jamais
écrire `outline: none` sans remplacement d'un contraste au moins équivalent.

---

## 7. Textes alternatifs

Trois cas, et un seul par image :

- **L'image porte la question** : le `alt` décrit ce qu'il faut voir pour
  pouvoir répondre. Jamais un texte générique partagé entre images.
- **L'image illustre sans informer** : `alt=""`, l'image est ignorée.
- **L'image est un lien ou un bouton** : le `alt` décrit la destination ou
  l'action, pas l'image.

Interdit : « image », « photo de », « illustration de la question ».

---

## 8. Couleur et contraste

Aucune information n'est portée par la seule couleur. Une réponse correcte ou
fausse est annoncée **par du texte**, la couleur ne fait que renforcer.

Seuils : 4,5 pour 1 sur le texte courant, 3 pour 1 sur le texte large et sur
les éléments d'interface porteurs de sens, y compris les états grisés.

`prefers-reduced-motion` supprime les transitions et les animations. Aucune
information ne dépend d'une animation.

---

## 9. Chronomètre et limite de temps

Une limite de 15 secondes par question relève du critère WCAG 2.2.1. Le §22
du cahier des charges verrouille la durée : la conformité passe donc par une
échappatoire, pas par un changement de règle du jeu.

- Le chronomètre peut être mis en pause à tout moment.
- Le chronomètre peut être entièrement désactivé dans les préférences.
- Une partie sans chronomètre ne rapporte pas de bonus de rapidité, mais
  reste valide et rapporte l'expérience.

Ce choix est à valider par les porteurs du projet : il touche à l'équité du
classement et devra être tranché avant le duel entre joueurs.

---

## 10. Langue

`<html lang="fr">` sur chaque page.

Tout fragment dans une autre langue porte son propre attribut : `lang="ln"`
pour le lingala, `lang="sw"` pour le swahili, `lang="lu"` pour le tshiluba,
`lang="kg"` pour le kikongo. Sans cela, la synthèse vocale prononce les mots
avec les règles du français, ce qui rend le parcours de langue inutilisable
pour ceux qui en auraient le plus besoin.

Cette règle est structurante pour la phase 9 : les contenus linguistiques
doivent porter leur code de langue dès la saisie dans le back-office.

---

## 11. Formulaires

Chaque champ a un `<label for>` visible. Le `placeholder` ne remplace jamais
un libellé.

Les erreurs sont annoncées dans une région live, rattachées au champ par
`aria-describedby`, et énoncent comment corriger, pas seulement ce qui ne va
pas.

Les champs d'identité et de paiement portent les bons `autocomplete`.

---

## 12. Ce qui sera vérifié en recette

Automatisable :

- validation HTML, aucune erreur ;
- axe-core sur chaque écran, aucune violation ;
- Lighthouse accessibilité à 100 ;
- contrastes calculés sur l'ensemble des jetons de design.

Non automatisable, donc à faire à la main :

- parcours complet au clavier seul, sans souris ;
- parcours complet avec VoiceOver sur iOS et TalkBack sur Android ;
- parcours complet **feuilles de style désactivées** ;
- affichage à 200 % de zoom et à 320 pixels de large ;
- une partie entière jouée en lecteur d'écran, du lancement au résultat.

Les outils automatiques détectent environ un tiers des problèmes réels. Les
deux tiers restants sont dans cette seconde liste.
