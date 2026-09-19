# SEO et GEO — principes et mise en œuvre

Deux objectifs distincts, qui partagent une grande partie de leurs moyens.

**SEO** : être trouvé dans un moteur de recherche, sur des requêtes comme
« quiz sur le Congo » ou « combien de provinces en RDC ».

**GEO** : être cité par un modèle de langage quand quelqu'un lui demande
« quelle application pour apprendre l'histoire du Congo » ou lui pose
directement une question factuelle sur la RDC.

---

## 1. Le constat stratégique à regarder en face

Une application de quiz est une impasse pour les deux. Le contenu vit derrière
une interaction : personne, ni robot ni modèle, ne joue une partie pour
découvrir tes questions. Une PWA seule est donc à peu près invisible.

Or l'actif du projet, ce sont **1 445 questions sourcées sur la RDC**. C'est
exactement le format que les moteurs et les modèles recherchent : une question
claire, une réponse courte, une explication, une source citable. Ce corpus
n'existe nulle part ailleurs sous cette forme.

**La recommandation** : publier une partie des questions comme pages HTML
publiques et indexables, à côté de l'application. Une page par question, ou
une page par thème regroupant dix à vingt questions. C'est là que se joueront
90 % du référencement et de la citabilité.

Deux contreparties à assumer :

- le contenu publié est copiable par n'importe qui, y compris un concurrent ;
- il faut choisir quoi publier. Publier tout le gratuit se défend, puisqu'il
  est déjà gratuit. Publier les quiz spéciaux payants, non.

Mon avis : publier un sous-ensemble représentatif, entre 200 et 400 questions,
choisies sur les sujets les plus recherchés (les 26 provinces, Lumumba, le
fleuve, la rumba, les langues nationales), et garder le reste dans
l'application.

---

## 2. Ce qui est déjà en place

| Élément | Où | Rôle |
| --- | --- | --- |
| `<title>` marque + fonction | chaque page | Premier signal moteur, première annonce lecteur d'écran |
| `<meta name="description">` | chaque page | Extrait affiché en résultat |
| `<link rel="canonical">` | chaque page | Évite le contenu dupliqué |
| Open Graph | chaque page | Aperçu au partage sur les réseaux |
| Paragraphe d'orientation | accueil | Réponse en une phrase à « qu'est-ce que c'est » |
| JSON-LD `WebSite` et `WebApplication` | accueil | Entité, offres, langue, sujet |

Le paragraphe d'orientation mérite une note : c'est la même phrase qui sert au
lecteur d'écran, au moteur et au modèle de langage. Une bonne structure
sémantique sert les trois publics à la fois, ce qui est l'argument le plus
solide en faveur de la méthode adoptée en phase 1.

---

## 3. Ce qu'il reste à ajouter

### `BreadcrumbList` sur chaque page interne

Le fil d'Ariane existe déjà en HTML sur `categorie.html`. Le doubler en JSON-LD
fait apparaître le chemin directement dans les résultats de recherche.

### `FAQPage` sur la page des offres

La foire aux questions est déjà écrite en `<details>`. La déclarer en JSON-LD
la rend éligible à l'affichage enrichi, et elle devient directement citable par
un modèle interrogé sur les tarifs.

### `Quiz`, `Question` et `Answer` sur les pages de questions publiques

C'est le bloc décisif. Le vocabulaire schema.org couvre nativement le format
question-réponse, avec la réponse acceptée, l'explication et la source :

```json
{
  "@context": "https://schema.org",
  "@type": "Question",
  "name": "Combien de provinces compte la République démocratique du Congo ?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "26 provinces depuis le découpage territorial entré en vigueur en 2015.",
    "citation": "https://www.caid.cd/"
  },
  "about": {
    "@type": "Country",
    "name": "République démocratique du Congo",
    "sameAs": "https://www.wikidata.org/wiki/Q974"
  },
  "inLanguage": "fr-FR"
}
```

Le champ `sameAs` vers Wikidata est ce qui relie ta page à l'entité « RDC »
telle que les moteurs et les modèles la connaissent déjà. Sans lui, ton contenu
flotte ; avec lui, il se rattache à un nœud existant. À faire aussi pour les
personnes (Lumumba, Mobutu, Franco) et les lieux (Kinshasa, le fleuve Congo).

### `Organization` avec `sameAs`

Dès que les comptes sociaux existent, les déclarer. C'est le premier pas vers
l'autorité, qui ne s'obtient pas autrement que par le temps et les liens
entrants.

### Fichiers de service

- `sitemap.xml`, régénéré à chaque publication de question ;
- `robots.txt`, avec une décision explicite sur les robots d'IA ;
- `llms.txt` à la racine, convention émergente : une page en texte brut qui
  décrit le site, ses sections et ses sources pour les modèles de langage. Peu
  coûteux, encore peu adopté, donc différenciant.

---

## 4. Les principes GEO qui changent la rédaction

Ils touchent les wordings, pas le code. Cinq règles :

**Répondre d'abord, développer ensuite.** Un modèle cite le fragment qui
répond. Une explication qui commence par du contexte et finit par la réponse
n'est pas citable. Les explications des 1 445 questions devraient être relues
sous cet angle.

**Une affirmation par phrase, avec ses chiffres.** « 26 provinces depuis 2015 »
est citable. « Le pays a connu plusieurs réorganisations territoriales » ne
l'est pas.

**Nommer les entités en entier au moins une fois par page.** « RDC » seul ne
raccroche à rien. « République démocratique du Congo (RDC) » raccroche.

**Citer la source dans le texte, pas seulement dans un lien.** « Selon
l'Institut national de la statistique » vaut mieux qu'un lien nu.

**Dater le contenu.** Les questions sur le Congo contemporain vieillissent.
Une date de dernière vérification visible sert autant la crédibilité que le
référencement, et elle justifie une révision périodique.

---

## 5. Un avertissement sur l'autorité

Tu as raison de dire qu'elle est à construire. Aucune balise ne la remplace.
Ce qui la construit, dans l'ordre d'efficacité :

1. du contenu que d'autres citent spontanément ;
2. des liens entrants depuis des sites reconnus sur le sujet, associations,
   médias de la diaspora, établissements scolaires ;
3. la constance dans le temps.

Le corpus sourcé est un bon point de départ, à condition que les sources
tiennent. D'où l'importance de la vérification d'échantillon : un corpus dont
30 % des liens sont morts ou hors sujet produira l'effet inverse de celui
recherché, auprès des lecteurs comme des modèles.

---

## 6. Ordre de mise en œuvre

| Quand | Quoi |
| --- | --- |
| Phase 1 | Balises de base, JSON-LD accueil, `BreadcrumbList`, `FAQPage` |
| Phase 2 | Vérification des sources de la banque |
| Phase 3 | Pages publiques de questions, `Question` et `Answer`, `sitemap.xml` |
| Phase 6 | Images sociales, `llms.txt` |
| Après lancement | `Organization` avec les réseaux, travail de liens entrants |
