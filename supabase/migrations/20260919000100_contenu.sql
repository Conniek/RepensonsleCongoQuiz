-- =========================================================================
-- Contenu editorial : questions, tags, quiz speciaux, campagnes.
-- Ces tables sont alimentees par le back-office (phase 5) et lues par le
-- jeu. Aucune donnee utilisateur ici.
-- =========================================================================

create type difficulte_niveau as enum ('facile', 'moyen', 'difficile');
create type question_type     as enum ('qcm', 'personnalite');
create type question_statut   as enum ('brouillon', 'valide', 'a_reverifier', 'retiree');

-- -------------------------------------------------------------------------
-- Campagnes : conteneur de contenu temporaire, partage par les modules
-- evenementiels (§24.1) et le comparateur civique (§24.2).
-- Aucune date d'evenement n'est codee dans l'application.
-- -------------------------------------------------------------------------
create table campagne (
  id            uuid primary key default gen_random_uuid(),
  titre         text not null,
  description   text,
  type          text not null check (type in ('quiz_thematique', 'comparateur_civique')),
  date_debut    timestamptz,
  date_fin      timestamptz,
  statut        text not null default 'brouillon'
                check (statut in ('brouillon', 'programmee', 'active', 'archivee')),
  mise_en_avant boolean not null default false,
  cree_le       timestamptz not null default now(),
  modifie_le    timestamptz not null default now(),
  constraint campagne_dates_coherentes check (date_fin is null or date_debut is null or date_fin > date_debut)
);

-- -------------------------------------------------------------------------
-- Questions.
--
-- difficulte est une donnee SERVEUR, modifiable en un clic depuis le
-- back-office, jamais figee dans le paquet livre au client.
-- difficulte_observee est calculee a partir des parties jouees : c'est
-- l'ecart entre les deux qui alimente l'ecran de recalibration.
-- -------------------------------------------------------------------------
create table question (
  id             text primary key,                    -- identifiants historiques RLC-0001
  type           question_type not null default 'qcm',
  categorie      text not null,
  sous_categorie text,
  enonce         text not null,
  reponses       jsonb not null,                      -- ["A","B","C","D"]
  bonne_reponse  smallint not null,                   -- index dans reponses, 0-3
  explication    text,
  source_url     text,
  source_titre   text,
  image_id       text,
  image_alt      text,                                -- jamais generique : cf. contrat d'accessibilite
  difficulte     smallint not null check (difficulte between 1 and 5),
  statut         question_statut not null default 'brouillon',
  campagne_id    uuid references campagne(id) on delete set null,
  langue         text not null default 'fr',          -- code BCP 47, pose le lang= du fragment
  vues           integer not null default 0,
  reussites      integer not null default 0,
  publique       boolean not null default false,      -- publiee comme page indexable (cf. SEO-GEO.md)
  cree_le        timestamptz not null default now(),
  modifie_le     timestamptz not null default now(),

  constraint question_reponses_valides check (jsonb_array_length(reponses) between 2 and 6),
  constraint question_bonne_reponse_dans_bornes
    check (bonne_reponse >= 0 and bonne_reponse < jsonb_array_length(reponses)),
  -- Une question validee doit etre sourcee (§16 du cahier des charges).
  constraint question_validee_est_sourcee
    check (statut <> 'valide' or source_url is not null),
  -- Une question de type personnalite n'a pas de bonne reponse au sens du jeu.
  constraint question_personnalite_sans_score
    check (type <> 'personnalite' or campagne_id is not null)
);

create index on question (categorie, difficulte) where statut = 'valide';
create index on question (campagne_id) where campagne_id is not null;
create index on question (publique) where publique = true;

-- Taux de reussite observe. Null tant que l'echantillon est trop faible :
-- en dessous de 50 presentations, le signal n'est pas exploitable.
create or replace function difficulte_observee(q question)
returns numeric language sql immutable as $$
  select case when q.vues >= 50 then round(q.reussites::numeric / q.vues, 3) end;
$$;

-- -------------------------------------------------------------------------
-- Tags : rattachement editorial EXPLICITE.
--
-- Remplace la recherche par sous-chaine du prototype, qui produisait des
-- faux positifs mesures : le dossier « Inga » remontait les questions
-- contenant « lingala », « dot » remontait « Jadotville ».
-- Le rattachement ne doit JAMAIS etre recalcule a partir du texte.
-- -------------------------------------------------------------------------
create table tag (
  id      text primary key,
  libelle text not null,
  famille text
);

create table question_tag (
  question_id text not null references question(id) on delete cascade,
  tag_id      text not null references tag(id) on delete cascade,
  primary key (question_id, tag_id)
);

create index on question_tag (tag_id);

-- -------------------------------------------------------------------------
-- Quiz speciaux : contenu de l'offre Plus.
-- longueur est administrable (§8.4), le seuil d'ouverture aussi : un quiz
-- sous le seuil reste visible et annonce sa condition, il ne disparait pas.
-- -------------------------------------------------------------------------
create table quiz_special (
  id           text primary key,
  titre        text not null,
  accroche     text,
  famille      text,
  tag_id       text references tag(id) on delete set null,
  longueur     smallint not null default 7 check (longueur between 3 and 20),
  seuil_min    smallint not null default 3,
  premium      boolean not null default true,
  actif        boolean not null default true,
  ordre        integer not null default 0
);

-- Compteur reel de questions rattachees. L'interface affiche CE nombre,
-- jamais une estimation : le prototype affichait des compteurs faux.
create or replace function quiz_special_nb_questions(qs quiz_special)
returns integer language sql stable as $$
  select count(*)::integer
  from question_tag qt
  join question q on q.id = qt.question_id
  where qt.tag_id = qs.tag_id and q.statut = 'valide';
$$;
