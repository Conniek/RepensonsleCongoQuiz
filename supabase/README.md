# Phase 2 — Base de données

Schéma, sécurité et jeu de données initial pour Supabase.

## Contenu

```
supabase/
├── migrations/
│   ├── 20260919000100_contenu.sql          questions, tags, quiz spéciaux, campagnes
│   ├── 20260919000200_utilisateur.sql      profils, droits d'accès, maîtrise, badges
│   ├── 20260919000300_jeu.sql              parties et réponses
│   ├── 20260919000400_vues_et_fonctions.sql  vue publique et fonctions serveur
│   └── 20260919000500_rls.sql              politiques de sécurité
└── seed/
    └── seed.sql                            1 445 questions, 38 tags, 8 badges
```

## Installation

Depuis la racine du dépôt :

```bash
supabase link --project-ref <ta-ref-de-projet>
supabase db push
psql "$DATABASE_URL" -f supabase/seed/seed.sql
```

Le fichier de seed est **idempotent** : chaque insertion porte un
`on conflict do nothing`. Le rejouer ne crée pas de doublon et n'écrase rien.

Une chose à activer dans la console Supabase, sans laquelle le mode invité ne
fonctionne pas : **Authentication → Providers → Anonymous sign-ins**.

## Vérification après chargement

```sql
select count(*) from question;                     -- 1445
select count(*) from question_tag;                 -- 606
select categorie, count(*) from question group by 1 order by 2 desc;
select id, titre, quiz_special_nb_questions(quiz_special.*) as nb
  from quiz_special order by nb;                   -- 8 quiz sous le seuil de 3
```

## Les trois décisions structurantes

### Le mode invité passe par l'authentification anonyme

Un invité reçoit un `auth.uid()` réel. Ses parties sont donc enregistrées côté
serveur dès le premier jour, les politiques de sécurité s'appliquent
uniformément, et la conversion en compte réel se fait par liaison d'identité,
sans migration ni perte de progression.

C'est aussi la première des trois fondations exigées pour le duel asynchrone.

### La table `question` n'est pas exposée à l'API

Postgres ne sait pas restreindre l'accès colonne par colonne. Si la table était
lisible, n'importe qui lirait `bonne_reponse` depuis la console du navigateur.

Le client passe donc par :

- la vue `question_publique`, qui ne contient ni la réponse ni l'explication ;
- `composer_deck()` pour obtenir un deck ;
- `valider_reponse()` pour jouer un coup, qui renvoie la correction, l'explication
  et la source **après** le choix.

`pack_hors_ligne()` fait exception et contient les réponses, parce que le §19
exige de pouvoir jouer sans réseau. **Arbitrage assumé** : ce pack est lisible
par un utilisateur déterminé, il est donc réservé au solo. Les modes
compétitifs passent obligatoirement par le serveur.

### Aucune écriture directe depuis le client

`reponse` n'a pas de politique d'insertion : sinon le joueur s'attribuerait des
points. `entitlement` non plus : seuls les webhooks Stripe, avec la clé de
service, créent un droit d'accès. C'est le point le plus sensible du schéma.

## Ce que le schéma résout, issu des défauts constatés

| Défaut du prototype | Réponse dans le schéma |
| --- | --- |
| Rattachement des quiz spéciaux par sous-chaîne, faux positifs | Tables `tag` et `question_tag`, rattachement explicite |
| Compteurs de questions faux à l'écran | `quiz_special_nb_questions()`, compte réel |
| Niveau difficile injouable dans trois catégories | `composer_deck()` complète et signale, ne bloque jamais |
| Difficulté figée dans le fichier livré | Colonne serveur, modifiable sans republication |
| Pas de données pour recalibrer | `vues`, `reussites`, `difficulte_observee()` |
| Statut Plus dans le stockage local du navigateur | Table `entitlement`, vérifiée côté serveur |
| Progression perdue au changement d'appareil | Profil rattaché à `auth.users` |
| Réponses lisibles dans le code de la page | Vue sans réponse et validation serveur |

## Ce qui reste ouvert

**Les `image_alt` sont à `null`.** Le contrat d'accessibilité interdit un texte
alternatif générique : chacun doit décrire ce qu'il faut voir pour répondre.
Dix images seulement sont concernées aujourd'hui, c'est une heure de travail
éditorial, à faire dans le back-office en phase 5.

**Huit quiz spéciaux sont sous le seuil de trois questions** : Gizenga,
Kalonji, Twa, Banyamulenge, Maï-Maï, Mulele, Fédéralisme, La dot. Ils sont
créés et visibles, et annoncent leur condition d'ouverture. Ce sont les
priorités éditoriales de la phase 9, puisqu'ils font partie de l'offre payante.

**Les sources ne sont pas vérifiées.** Les 1 445 questions portent toutes une
URL, mais aucune n'a été ouverte. À traiter avant de communiquer sur la
fiabilité du corpus.
