-- =========================================================================
-- Utilisateurs, droits d'acces et progression.
--
-- Le mode invite passe par l'authentification ANONYME de Supabase : un
-- invite recoit un auth.uid() reel. Consequences :
--   - ses parties sont enregistrees cote serveur des le premier jour,
--     ce qui est la fondation exigee pour le duel asynchrone (§23) ;
--   - les politiques de securite s'appliquent uniformement ;
--   - la conversion en compte reel se fait par liaison d'identite, sans
--     migration de donnees ni perte de progression.
-- =========================================================================

create table profil (
  id           uuid primary key references auth.users(id) on delete cascade,
  pseudo       text unique check (char_length(pseudo) between 2 and 24),
  anonyme      boolean not null default true,
  xp           integer not null default 0 check (xp >= 0),
  serie_jours  integer not null default 0 check (serie_jours >= 0),
  serie_record integer not null default 0 check (serie_record >= 0),
  derniere_partie_le date,
  chrono_actif boolean not null default true,   -- cf. contrat d'accessibilite, WCAG 2.2.1
  cree_le      timestamptz not null default now()
);

-- Cree automatiquement le profil a l'inscription, y compris anonyme.
create or replace function creer_profil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profil (id, anonyme)
  values (new.id, coalesce(new.is_anonymous, false))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger profil_a_l_inscription
  after insert on auth.users
  for each row execute function creer_profil();

-- -------------------------------------------------------------------------
-- Droits d'acces payants.
--
-- SOURCE UNIQUE DE VERITE. Le droit n'est jamais un indicateur stocke cote
-- client : le prototype ouvrait l'acces Plus par une cle de stockage local
-- modifiable en trois secondes depuis la console.
-- fin_le null = acces a vie (achat unique du parcours de langue).
-- -------------------------------------------------------------------------
create table entitlement (
  id             uuid primary key default gen_random_uuid(),
  utilisateur_id uuid not null references profil(id) on delete cascade,
  produit        text not null check (produit in ('plus', 'langue_lingala', 'pack_langues')),
  debut_le       timestamptz not null default now(),
  fin_le         timestamptz,
  source         text not null default 'stripe',
  reference      text,                                -- identifiant Stripe
  cree_le        timestamptz not null default now()
);

create index on entitlement (utilisateur_id, produit);

create or replace function a_droit(uid uuid, produit_demande text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from entitlement e
    where e.utilisateur_id = uid
      and (e.produit = produit_demande
           or (e.produit = 'pack_langues' and produit_demande like 'langue_%'))
      and e.debut_le <= now()
      and (e.fin_le is null or e.fin_le > now())
  );
$$;

-- -------------------------------------------------------------------------
-- Maitrise par categorie : les 6 etoiles, 2 par niveau.
-- -------------------------------------------------------------------------
create table maitrise (
  utilisateur_id uuid not null references profil(id) on delete cascade,
  categorie      text not null,
  niveau         difficulte_niveau not null,
  etoiles        smallint not null default 0 check (etoiles between 0 and 2),
  primary key (utilisateur_id, categorie, niveau)
);

-- -------------------------------------------------------------------------
-- Badges : faits marquants et transversaux.
-- A ne pas confondre avec la maitrise par categorie : des qu'un badge
-- devient « Expert en Culture », il empiete sur les etoiles et l'ecran
-- redevient confus.
-- -------------------------------------------------------------------------
create table badge (
  id          text primary key,
  libelle     text not null,
  condition   text not null,
  objectif    integer not null default 1,
  ordre       integer not null default 0
);

create table badge_obtenu (
  utilisateur_id uuid not null references profil(id) on delete cascade,
  badge_id       text not null references badge(id) on delete cascade,
  avancement     integer not null default 0,
  obtenu_le      timestamptz,
  primary key (utilisateur_id, badge_id)
);
