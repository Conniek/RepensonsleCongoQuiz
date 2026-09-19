-- =========================================================================
-- Parties et reponses.
--
-- La partie est enregistree cote SERVEUR des la V1, y compris en solo.
-- C'est la fondation qui rend le duel asynchrone ajoutable plus tard sans
-- refonte : un duel sera « une partie, deux joueurs ».
-- Dans le prototype, tout vivait dans un objet JavaScript local.
-- =========================================================================

create type partie_mode   as enum ('solo', 'defi_du_jour', 'quiz_special', 'duel');
create type partie_statut as enum ('en_cours', 'terminee', 'abandonnee', 'expiree');

create table partie (
  id             uuid primary key default gen_random_uuid(),
  utilisateur_id uuid not null references profil(id) on delete cascade,
  -- Prevu des maintenant pour le duel asynchrone. Reste null en solo.
  adversaire_id  uuid references profil(id) on delete set null,
  mode           partie_mode not null default 'solo',
  categorie      text,
  niveau         difficulte_niveau,
  quiz_special_id text references quiz_special(id) on delete set null,
  deck           text[] not null,              -- ids des questions, ordre fige
  -- Vrai quand le pool etait insuffisant et que la partie a ete completee
  -- par les difficultes voisines. Affiche honnetement au joueur.
  deck_complete  boolean not null default false,
  points         integer not null default 0,
  bonnes         smallint not null default 0,
  chrono_actif   boolean not null default true,
  statut         partie_statut not null default 'en_cours',
  commencee_le   timestamptz not null default now(),
  terminee_le    timestamptz,

  constraint partie_deck_non_vide check (array_length(deck, 1) >= 1)
);

create index on partie (utilisateur_id, commencee_le desc);
create index on partie (adversaire_id) where adversaire_id is not null;

create table reponse (
  id             bigserial primary key,
  partie_id      uuid not null references partie(id) on delete cascade,
  question_id    text not null references question(id) on delete cascade,
  position       smallint not null,
  choix          smallint,                     -- null = temps ecoule
  correcte       boolean not null,
  duree_ms       integer,
  points         integer not null default 0,
  repondue_le    timestamptz not null default now(),
  unique (partie_id, position)
);

create index on reponse (question_id);

-- Alimente les compteurs de la question : c'est ce qui rend la
-- recalibration de la difficulte possible en phase 5.
create or replace function maj_compteurs_question()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update question
     set vues      = vues + 1,
         reussites = reussites + case when new.correcte then 1 else 0 end
   where id = new.question_id;
  return new;
end;
$$;

create trigger compteurs_apres_reponse
  after insert on reponse
  for each row execute function maj_compteurs_question();
