-- =========================================================================
-- Progression : experience, rang, serie quotidienne, badges, defi du jour.
--
-- TOUT est calcule cote serveur, a la cloture d'une partie. Le navigateur
-- ne fait qu'afficher. Regle constante du projet : ce qui recompense ne
-- peut pas vivre dans le client.
-- =========================================================================

-- Tracer ce qu'une partie a rapporte, pour que l'ecran de resultat puisse
-- l'afficher sans recalculer.
alter table partie add column if not exists xp_gagne      integer not null default 0;
alter table partie add column if not exists badges_gagnes text[]  not null default '{}';

-- -------------------------------------------------------------------------
-- Rangs. Seuils cumulatifs d'experience.
-- -------------------------------------------------------------------------
create table if not exists rang (
  seuil   integer primary key,
  libelle text not null,
  ordre   smallint not null
);

insert into rang (seuil, libelle, ordre) values
  (0,    'Curieux du Congo',     1),
  (500,  'Explorateur du Congo', 2),
  (1500, 'Connaisseur du Congo', 3),
  (3500, 'Expert du Congo',      4),
  (7500, 'Mémoire du Congo',     5)
on conflict (seuil) do nothing;

alter table rang enable row level security;
do $$ begin
  create policy "rangs lisibles" on rang for select using (true);
exception when duplicate_object then null; end $$;

-- -------------------------------------------------------------------------
-- Evaluation des badges.
--
-- Les badges sont TRANSVERSAUX : ils recompensent des faits marquants, pas
-- la maitrise d'une categorie, qui est deja portee par les etoiles. Des
-- qu'un badge devient « Expert en Culture », il empiete sur les etoiles et
-- l'ecran de progression redevient confus.
--
-- Renvoie les identifiants des badges NOUVELLEMENT obtenus, pour que
-- l'interface puisse les annoncer.
-- -------------------------------------------------------------------------
create or replace function evaluer_badges(p_uid uuid)
returns text[]
language plpgsql security definer set search_path = public as $$
declare
  v_nouveaux text[] := '{}';
  v_avancements jsonb;
begin
  select jsonb_build_object(
    'premiere_victoire', (select count(*) from partie
                           where utilisateur_id = p_uid and statut = 'terminee'
                             and points >= 900 and bonnes >= 5),
    'serie_7',           (select serie_jours from profil where id = p_uid),
    'serie_30',          (select serie_jours from profil where id = p_uid),
    'incollable',        (select count(*) from partie
                           where utilisateur_id = p_uid and statut = 'terminee'
                             and bonnes = array_length(deck, 1)),
    'cent_bonnes',       (select coalesce(sum(bonnes), 0) from partie
                           where utilisateur_id = p_uid and statut = 'terminee'),
    'explorateur',       (select count(distinct categorie) from partie
                           where utilisateur_id = p_uid and statut = 'terminee'
                             and categorie is not null),
    'maitre_categorie',  (select coalesce(max(total), 0) from (
                            select sum(etoiles) as total from maitrise
                             where utilisateur_id = p_uid group by categorie) t),
    'veteran',           (select count(*) from partie
                           where utilisateur_id = p_uid and statut = 'terminee')
  ) into v_avancements;

  with maj as (
    insert into badge_obtenu (utilisateur_id, badge_id, avancement, obtenu_le)
    select
      p_uid,
      b.id,
      least((v_avancements ->> b.id)::int, b.objectif),
      case when (v_avancements ->> b.id)::int >= b.objectif then now() end
    from badge b
    where v_avancements ? b.id
    on conflict (utilisateur_id, badge_id) do update
      set avancement = greatest(badge_obtenu.avancement, excluded.avancement),
          -- obtenu_le ne se reecrit jamais : une serie qui retombe ne retire
          -- pas un badge deja gagne.
          obtenu_le  = coalesce(badge_obtenu.obtenu_le, excluded.obtenu_le)
    returning badge_id, obtenu_le, (xmax = 0) as cree
  )
  select coalesce(array_agg(badge_id), '{}')
    into v_nouveaux
  from maj
  where obtenu_le is not null
    and obtenu_le >= now() - interval '5 seconds';

  return v_nouveaux;
end;
$$;

-- -------------------------------------------------------------------------
-- Cloture d'une partie, version complete.
-- Remplace celle de la migration 700 : ajoute l'experience, la serie et
-- les badges.
-- -------------------------------------------------------------------------
create or replace function terminer_partie(p_partie_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_partie   partie;
  v_profil   profil;
  v_gagnee   boolean;
  v_xp       integer;
  v_etoiles  smallint;
  v_badges   text[];
  v_serie    integer;
  v_rang     text;
  v_suivant  integer;
begin
  select * into v_partie from partie where id = p_partie_id;

  if v_partie.id is null then
    raise exception 'Partie introuvable';
  end if;
  if v_partie.utilisateur_id <> auth.uid() then
    raise exception 'Cette partie ne vous appartient pas';
  end if;

  -- Idempotent : rejouer la cloture ne recompense pas deux fois.
  if v_partie.statut = 'terminee' then
    select * into v_profil from profil where id = v_partie.utilisateur_id;
    select etoiles into v_etoiles from maitrise
     where utilisateur_id = v_partie.utilisateur_id
       and categorie = v_partie.categorie and niveau = v_partie.niveau;
    select libelle into v_rang from rang where seuil <= v_profil.xp order by seuil desc limit 1;
    return jsonb_build_object(
      'deja_terminee', true,
      'points', v_partie.points, 'bonnes', v_partie.bonnes,
      'gagnee', v_partie.points >= 900 and v_partie.bonnes >= 5,
      'xp_gagne', v_partie.xp_gagne, 'badges_gagnes', v_partie.badges_gagnes,
      'xp_total', v_profil.xp, 'rang', v_rang,
      'serie_jours', v_profil.serie_jours,
      'deck_complete', v_partie.deck_complete,
      'etoiles_categorie', coalesce(v_etoiles, 0));
  end if;

  v_gagnee := (v_partie.points >= 900 and v_partie.bonnes >= 5);

  -- Experience : un dixieme des points, plus 40 pour une victoire, plus 50
  -- si c'etait le defi du jour.
  v_xp := (v_partie.points / 10)
        + case when v_gagnee then 40 else 0 end
        + case when v_gagnee and v_partie.mode = 'defi_du_jour' then 50 else 0 end;

  select * into v_profil from profil where id = v_partie.utilisateur_id;

  -- Serie quotidienne : +1 si la derniere partie datait d'hier, inchangee
  -- si c'etait aujourd'hui, remise a 1 sinon.
  v_serie := case
    when v_profil.derniere_partie_le = current_date          then v_profil.serie_jours
    when v_profil.derniere_partie_le = current_date - 1      then v_profil.serie_jours + 1
    else 1
  end;

  update partie
     set statut = 'terminee', terminee_le = now(), xp_gagne = v_xp
   where id = p_partie_id;

  update profil
     set xp = xp + v_xp,
         serie_jours = v_serie,
         serie_record = greatest(serie_record, v_serie),
         derniere_partie_le = current_date
   where id = v_partie.utilisateur_id;

  if v_gagnee and v_partie.categorie is not null and v_partie.niveau is not null then
    insert into maitrise (utilisateur_id, categorie, niveau, etoiles)
    values (v_partie.utilisateur_id, v_partie.categorie, v_partie.niveau, 1)
    on conflict (utilisateur_id, categorie, niveau)
      do update set etoiles = least(2, maitrise.etoiles + 1);
  end if;

  v_badges := evaluer_badges(v_partie.utilisateur_id);
  update partie set badges_gagnes = v_badges where id = p_partie_id;

  select etoiles into v_etoiles from maitrise
   where utilisateur_id = v_partie.utilisateur_id
     and categorie = v_partie.categorie and niveau = v_partie.niveau;

  select * into v_profil from profil where id = v_partie.utilisateur_id;
  select libelle into v_rang from rang where seuil <= v_profil.xp order by seuil desc limit 1;
  select min(seuil) into v_suivant from rang where seuil > v_profil.xp;

  return jsonb_build_object(
    'deja_terminee', false,
    'points', v_partie.points,
    'bonnes', v_partie.bonnes,
    'gagnee', v_gagnee,
    'xp_gagne', v_xp,
    'xp_total', v_profil.xp,
    'rang', v_rang,
    'xp_rang_suivant', v_suivant,
    'serie_jours', v_serie,
    'badges_gagnes', v_badges,
    'deck_complete', v_partie.deck_complete,
    'etoiles_categorie', coalesce(v_etoiles, 0));
end;
$$;

-- -------------------------------------------------------------------------
-- Etat de progression du joueur courant. Une seule requete pour l'accueil
-- et le profil.
-- -------------------------------------------------------------------------
create or replace function progression()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_profil  profil;
  v_rang    text;
  v_seuil   integer;
  v_suivant integer;
  v_rang_suivant text;
begin
  if auth.uid() is null then
    return null;
  end if;

  select * into v_profil from profil where id = auth.uid();
  if v_profil.id is null then
    return null;
  end if;

  select libelle, seuil into v_rang, v_seuil
    from rang where seuil <= v_profil.xp order by seuil desc limit 1;
  select seuil, libelle into v_suivant, v_rang_suivant
    from rang where seuil > v_profil.xp order by seuil limit 1;

  return jsonb_build_object(
    'xp', v_profil.xp,
    'rang', v_rang,
    'rang_seuil', v_seuil,
    'rang_suivant', v_rang_suivant,
    'xp_rang_suivant', v_suivant,
    'serie_jours', v_profil.serie_jours,
    'serie_record', v_profil.serie_record,
    'anonyme', v_profil.anonyme,
    'parties', (select count(*) from partie
                 where utilisateur_id = auth.uid() and statut = 'terminee'),
    'taux_reussite', (
      select case when sum(array_length(deck,1)) > 0
        then round(100.0 * sum(bonnes) / sum(array_length(deck,1)))
      end
      from partie where utilisateur_id = auth.uid() and statut = 'terminee'),
    'badges', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.id, 'libelle', b.libelle, 'condition', b.condition,
        'objectif', b.objectif,
        'avancement', coalesce(bo.avancement, 0),
        'obtenu', bo.obtenu_le is not null) order by b.ordre), '[]'::jsonb)
      from badge b
      left join badge_obtenu bo on bo.badge_id = b.id and bo.utilisateur_id = auth.uid()),
    'maitrise', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'categorie', categorie, 'etoiles', total) order by categorie), '[]'::jsonb)
      from (select categorie, sum(etoiles)::int as total from maitrise
             where utilisateur_id = auth.uid() group by categorie) t));
end;
$$;

-- -------------------------------------------------------------------------
-- Defi du jour. Deterministe : la meme categorie pour tout le monde un jour
-- donne, sans aucune date codee en dur.
-- -------------------------------------------------------------------------
create or replace function defi_du_jour()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_categorie text;
  v_total int;
  v_fait boolean := false;
begin
  select count(*) into v_total from categorie_publique;
  if v_total = 0 then return null; end if;

  select categorie into v_categorie
  from (select categorie, row_number() over (order by categorie) - 1 as n
          from categorie_publique) t
  where n = (extract(doy from current_date)::int % v_total);

  if auth.uid() is not null then
    select exists (
      select 1 from partie
      where utilisateur_id = auth.uid()
        and mode = 'defi_du_jour'
        and statut = 'terminee'
        and terminee_le::date = current_date
    ) into v_fait;
  end if;

  return jsonb_build_object(
    'categorie', v_categorie, 'niveau', 'facile',
    'recompense_xp', 50, 'fait', v_fait);
end;
$$;

grant execute on function progression, defi_du_jour to anon, authenticated;
revoke all on function evaluer_badges(uuid) from anon, authenticated;
