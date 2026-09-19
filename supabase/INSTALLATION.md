# Installation — pas à pas

## 1. Copier les fichiers dans le dépôt

Décompresse l'archive à la racine du dépôt. L'arborescence doit donner :

```
supabase/
├── config.toml          (déjà là, créé par supabase init)
├── seed.sql             ← REMPLACE le fichier vide par défaut
└── migrations/
    ├── 20260919000100_contenu.sql
    ├── 20260919000200_utilisateur.sql
    ├── 20260919000300_jeu.sql
    ├── 20260919000400_vues_et_fonctions.sql
    ├── 20260919000500_rls.sql
    └── 20260919000600_nettoyage_anonymes.sql
```

`supabase/seed.sql` est le chemin que la CLI attend. Le fichier vide créé par
`supabase init` doit être écrasé par le mien.

## 2. Appliquer le schéma

```bash
supabase link --project-ref <ta-ref-de-projet>
supabase db push
```

`db push` applique les migrations. Il n'exécute pas le seed.

## 3. Charger les données

Récupère la chaîne de connexion dans Settings → Database → Connection string →
URI, puis :

```bash
psql "postgresql://postgres.<ref>:<mot-de-passe>@<hote>:5432/postgres" \
  -f supabase/seed.sql
```

Si `psql` n'est pas installé, ouvre le fichier et colle son contenu dans
l'éditeur SQL de la console. Il fait 900 Ko, ce qui passe mais reste lourd :
`psql` est plus confortable.

## 4. Vérifier

```sql
select count(*) from question;                 -- attendu : 1445
select count(*) from question_tag;             -- attendu : 606
select count(*) from tag;                      -- attendu : 38
select count(*) from badge;                    -- attendu : 8

-- État éditorial des quiz spéciaux
select id, titre, quiz_special_nb_questions(quiz_special.*) as nb
from quiz_special order by nb;
```

## 5. Vérifier que la sécurité tient

Le test qui compte. Depuis l'éditeur SQL, en simulant un visiteur :

```sql
set role anon;
select * from question limit 1;             -- doit ÉCHOUER : permission denied
select * from question_publique limit 1;    -- doit RÉUSSIR, sans bonne_reponse
reset role;
```

Si la première requête réussit, les bonnes réponses sont lisibles depuis le
navigateur et il faut s'arrêter là.

## 6. Activer pg_cron

Database → Extensions → activer `pg_cron`, puis rejouer la migration 600 pour
que la planification du nettoyage s'enregistre. Sans elle, la fonction reste
appelable à la main.
