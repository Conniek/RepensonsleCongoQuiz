-- =========================================================================
-- Modèle multilingue : séparer l'IDENTITÉ de la PRÉSENTATION.
--
-- Deux dettes réglées d'un coup :
--   1. La catégorie était une chaîne française recopiée sur chaque question
--      et utilisée comme clé dans partie et maitrise. La renommer aurait
--      cassé l'historique de tous les joueurs.
--   2. Rien ne permettait de servir l'application dans une autre langue.
--
-- Ce qui ne dépend PAS de la langue reste sur `question` : catégorie,
-- difficulté, image, tags, compteurs, et surtout l'INDEX de la bonne
-- réponse. Ce qui en dépend part dans `question_texte`, une ligne par
-- langue.
--
-- Conséquence importante : `vues` et `reussites` restent sur la question,
-- donc la recalibration de la difficulté travaille sur un seul échantillon.
-- La même question a le même taux de réussite dans toutes les langues.
--
-- ATTENTION : cette migration réécrit question, partie et maitrise.
-- Sauvegarder avant de l'appliquer.
-- =========================================================================

begin;

-- Slug sans accents, utilisé pour dériver les codes de catégorie.
create or replace function slugifier(txt text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(
    lower(translate(txt,
      'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝ',
      'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY')),
    '[^a-z0-9]+', '-', 'g'));
$$;

-- -------------------------------------------------------------------------
-- 1. Langues
-- -------------------------------------------------------------------------
create table langue (
  code    text primary key check (code ~ '^[a-z]{2}$'),
  libelle text not null,
  actif   boolean not null default true,
  defaut  boolean not null default false,
  ordre   smallint not null default 0
);

insert into langue (code, libelle, actif, defaut, ordre) values
  ('fr', 'Français', true, true,  1),
  ('en', 'English',  true, false, 2);

-- Une seule langue par défaut.
create unique index langue_une_seule_defaut on langue (defaut) where defaut;

-- -------------------------------------------------------------------------
-- 2. Catégories : identité stable, présentation par langue
-- -------------------------------------------------------------------------
create table categorie (
  id    text primary key,          -- code stable, ex. « geographie-26-provinces »
  ordre smallint not null default 0,
  actif boolean not null default true
);

create table categorie_texte (
  categorie_id text not null references categorie(id) on delete cascade,
  langue       text not null references langue(code) on delete cascade,
  libelle      text not null,
  slug         text not null,
  description  text,
  primary key (categorie_id, langue),
  unique (langue, slug)            -- deux catégories ne partagent pas une URL
);

-- Reprise des 12 catégories existantes, depuis les libellés portés par les
-- questions. Le code est dérivé du libellé français une seule fois : il ne
-- changera plus jamais, même si le libellé change.
insert into categorie (id, ordre)
select distinct slugifier(categorie), 0 from question;

insert into categorie_texte (categorie_id, langue, libelle, slug)
select distinct slugifier(categorie), 'fr', categorie, slugifier(categorie)
from question;

-- -------------------------------------------------------------------------
-- 3. Questions : le texte part dans sa propre table
-- -------------------------------------------------------------------------
create table question_texte (
  question_id    text not null references question(id) on delete cascade,
  langue         text not null references langue(code) on delete cascade,
  enonce         text not null,
  reponses       jsonb not null,
  sous_categorie text,
  explication    text,
  -- La source vit ici : une question en anglais qui cite une page en
  -- français affaiblit la promesse « sourcé ».
  source_url     text,
  source_titre   text,
  -- Le texte alternatif est du texte : il se traduit aussi.
  image_alt      text,
  statut         question_statut not null default 'brouillon',
  traduit_par    uuid references auth.users(id) on delete set null,
  traduit_le     timestamptz,
  modifie_le     timestamptz not null default now(),
  primary key (question_id, langue),

  constraint qt_reponses_valides
    check (jsonb_array_length(reponses) between 2 and 6),
  constraint qt_validee_est_sourcee
    check (statut <> 'valide' or source_url is not null)
);

create index on question_texte (langue, statut);

-- Les 1 445 questions deviennent les lignes françaises. Le contenu ne bouge
-- pas d'un caractère, il change seulement de table.
insert into question_texte
  (question_id, langue, enonce, reponses, sous_categorie, explication,
   source_url, source_titre, image_alt, statut, traduit_le)
select id, 'fr', enonce, reponses, sous_categorie, explication,
       source_url, source_titre, image_alt, statut, now()
from question;

-- Rattachement des questions à l'identité de catégorie.
alter table question add column categorie_id text references categorie(id);
update question set categorie_id = slugifier(categorie);
alter table question alter column categorie_id set not null;

-- Les contraintes qui portaient sur les colonnes déplacées.
alter table question
  drop constraint if exists question_reponses_valides,
  drop constraint if exists question_bonne_reponse_dans_bornes,
  drop constraint if exists question_validee_est_sourcee;

alter table question
  drop column categorie,
  drop column sous_categorie,
  drop column enonce,
  drop column reponses,
  drop column explication,
  drop column source_url,
  drop column source_titre,
  drop column image_alt,
  drop column langue;

-- bonne_reponse reste sur la question : l'index est PARTAGÉ entre toutes les
-- langues. Un traducteur qui réordonne les propositions casserait la
-- justesse partout à la fois — d'où l'édition en liste ordonnée figée dans
-- le back-office.
alter table question add constraint question_bonne_reponse_positive
  check (bonne_reponse >= 0 and bonne_reponse < 6);

create index on question (categorie_id, difficulte) where statut = 'valide';

-- -------------------------------------------------------------------------
-- 4. Parties et maîtrise : la clé devient l'identité, plus le libellé
-- -------------------------------------------------------------------------
alter table partie add column categorie_id text references categorie(id);
update partie set categorie_id = slugifier(categorie) where categorie is not null;
alter table partie drop column categorie;
alter table partie add column langue text not null default 'fr'
  references langue(code);

alter table maitrise add column categorie_id text references categorie(id);
update maitrise set categorie_id = slugifier(categorie);
alter table maitrise drop constraint maitrise_pkey;
alter table maitrise drop column categorie;
alter table maitrise alter column categorie_id set not null;
alter table maitrise add primary key (utilisateur_id, categorie_id, niveau);

-- -------------------------------------------------------------------------
-- 5. Badges et rangs : libellés en JSON.
-- Peu de lignes, éditées d'un bloc, jamais filtrées par langue : le JSON
-- est ici le bon compromis, contrairement aux questions.
-- -------------------------------------------------------------------------
alter table badge add column libelle_i18n jsonb, add column condition_i18n jsonb;
update badge set libelle_i18n = jsonb_build_object('fr', libelle),
                 condition_i18n = jsonb_build_object('fr', condition);
alter table badge drop column libelle, drop column condition;

alter table rang add column libelle_i18n jsonb;
update rang set libelle_i18n = jsonb_build_object('fr', libelle);
alter table rang drop column libelle;

-- Repli sur le français si la traduction manque : un badge sans libellé
-- anglais reste affichable, il n'y a aucune raison de le masquer.
create or replace function texte_i18n(p jsonb, p_langue text)
returns text language sql immutable as $$
  select coalesce(p ->> p_langue, p ->> 'fr');
$$;

-- -------------------------------------------------------------------------
-- 6. Sécurité des nouvelles tables
-- -------------------------------------------------------------------------
alter table langue          enable row level security;
alter table categorie       enable row level security;
alter table categorie_texte enable row level security;
alter table question_texte  enable row level security;

create policy "langues lisibles"   on langue          for select using (actif);
create policy "categories lisibles" on categorie      for select using (actif);
create policy "libelles lisibles"  on categorie_texte for select using (true);
-- question_texte : aucune policy de select. Comme `question`, la table reste
-- inaccessible à l'API : elle contient l'explication et la source, qui ne
-- doivent arriver qu'APRÈS la réponse.

revoke all on question_texte from anon, authenticated;

-- Contrôle de cohérence : la migration échoue plutôt que de laisser des
-- données à moitié reprises.
do $$
declare v_q int; v_t int; v_c int; v_orphelines int;
begin
  select count(*) into v_q from question;
  select count(*) into v_t from question_texte where langue = 'fr';
  select count(*) into v_c from categorie;
  select count(*) into v_orphelines from question q
    left join categorie c on c.id = q.categorie_id where c.id is null;

  if v_q <> v_t then
    raise exception 'Reprise incomplète : % questions, % textes français', v_q, v_t;
  end if;
  if v_orphelines > 0 then
    raise exception '% questions sans catégorie valide', v_orphelines;
  end if;
  raise notice 'Reprise OK : % questions, % catégories', v_q, v_c;
end;
$$;

commit;
