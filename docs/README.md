# Phase 1 — Socle sémantique

Structure et contenu de l'application, sans aucune feuille de style.

Le test qui gouverne tout : **si l'application est complète et utilisable
sans CSS, l'accessibilité et le référencement suivront, et l'habillage
deviendra une couche remplaçable.**

## Écrans

| Fichier | Écran | Points saillants |
| --- | --- | --- |
| `index.html` | Accueil | Progression, badges, catégories |
| `categorie.html` | Parcours d'une catégorie | Niveaux ordonnés, niveau verrouillé |
| `quiz.html` | Question en cours | Chronomètre, réponses, régions live |
| `quiz-reponse.html` | Question répondue | Correction annoncée, source |
| `resultat.html` | Résultat de partie | Score, débloquages, revue des réponses |
| `quiz-speciaux.html` | Quiz spéciaux | Quiz indisponible expliqué, fragment en lingala |
| `profil.html` | Profil | Statistiques, badges, tableau de maîtrise |
| `offre.html` | Offres | Trois offres, foire aux questions |

`quiz.html` et `quiz-reponse.html` sont deux états du même écran, séparés en
deux fichiers pour pouvoir tester chacun au lecteur d'écran sans JavaScript.

## Comment vérifier

```
python3 -m http.server 8000
```

Puis, dans l'ordre d'importance :

1. **Au clavier seul.** Tabulation du début à la fin, sans souris. Tout doit
   être atteignable et l'ordre doit suivre la lecture.
2. **Au lecteur d'écran.** VoiceOver sur macOS ou iOS, NVDA sur Windows.
   Naviguer par titres, puis par régions, puis par liens.
3. **Sans CSS.** Il n'y en a pas, donc c'est déjà le cas. C'est le but.
4. **En lecture seule.** Lire `index.html` dans un éditeur de texte : la
   structure doit se comprendre sans navigateur.

## Ce qui n'est pas là, volontairement

Aucun style, aucune couleur, aucune image décorative. Aucun JavaScript :
les comportements dynamiques (enchaînement des questions, chronomètre,
déplacement du focus) arrivent en phase 3, et le contrat dit déjà comment
ils devront se comporter.

Les données affichées sont des exemples représentatifs, pas des données
réelles. Elles viennent de la base en phase 2.

## Décisions à relire en priorité

Trois choix méritent ton avis avant qu'ils se propagent partout :

1. **Les réponses sont des boutons et non des boutons radio.** Le clic est
   la réponse, définitive et chronométrée.
2. **Les éléments verrouillés utilisent `aria-disabled` et non `disabled`**,
   pour rester atteignables et expliquer leur condition de déblocage.
3. **Le chronomètre peut être mis en pause et désactivé.** C'est la seule
   façon de satisfaire WCAG 2.2.1 sans toucher aux 15 secondes verrouillées
   par le §22. Cela touche à l'équité et doit être arbitré par les porteurs.

Le détail et la justification de chaque règle sont dans
`CONTRAT-ACCESSIBILITE.md`.
