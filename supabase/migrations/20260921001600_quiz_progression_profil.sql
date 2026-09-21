-- =========================================================================
-- Page Quiz, page Progression, page Profil.
--
-- Rappel de la leçon des migrations 1100 à 1300 : « create or replace » ne
-- change ni les noms de paramètres ni le type de retour. Toute fonction dont
-- la signature bouge est supprimée d'abord. Ici, progression() garde
-- exactement sa signature : le remplacement direct est sûr.
-- =========================================================================

begin;

alter table profil add column if not exists langue_preferee text not null default 'fr'
  references langue(code);

-- -------------------------------------------------------------------------
-- Progression : ajoute thème favori, étoiles, catégories jouées, langue.
-- -------------------------------------------------------------------------
create or replace function progression(p_langue text default 'fr')
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_profil profil; v_rang text; v_seuil integer;
  v_suivant integer; v_rang_suivant text;
begin
  if auth.uid() is null then return null; end if;
  select * into v_profil from profil where id = auth.uid();
  if v_profil.id is null then return null; end if;

  select texte_i18n(libelle_i18n, p_langue), seuil into v_rang, v_seuil
    from rang where seuil <= v_profil.xp order by seuil desc limit 1;
  select seuil, texte_i18n(libelle_i18n, p_langue) into v_suivant, v_rang_suivant
    from rang where seuil > v_profil.xp order by seuil limit 1;

  return jsonb_build_object(
    'xp', v_profil.xp, 'pseudo', v_profil.pseudo, 'rang', v_rang,
    'rang_seuil', v_seuil, 'rang_suivant', v_rang_suivant,
    'xp_rang_suivant', v_suivant,
    'serie_jours', v_profil.serie_jours, 'serie_record', v_profil.serie_record,
    'anonyme', v_profil.anonyme,
    'langue_preferee', v_profil.langue_preferee,
    'parties', (select count(*) from partie
                 where utilisateur_id = auth.uid() and statut = 'terminee'),
    'taux_reussite', (
      select case when sum(array_length(deck,1)) > 0
        then round(100.0 * sum(bonnes) / sum(array_length(deck,1))) end
      from partie where utilisateur_id = auth.uid() and statut = 'terminee'),

    -- Étoiles gagnées, et le maximum possible dans les catégories jouables.
    'etoiles_total', (select coalesce(sum(etoiles), 0) from maitrise
                       where utilisateur_id = auth.uid()),
    'etoiles_max', (select count(*) * 6 from categorie_publique
                     where langue = p_langue and nb_questions >= 7),

    -- Thème favori : la catégorie la plus jouée, pas la mieux réussie.
    'theme_favori', (
      select ct.libelle from partie p
      join categorie_texte ct on ct.categorie_id = p.categorie_id and ct.langue = p_langue
      where p.utilisateur_id = auth.uid() and p.statut = 'terminee'
      group by ct.libelle order by count(*) desc, ct.libelle limit 1),

    'categories_jouees', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'categorie_id', x.categorie_id, 'libelle', x.libelle, 'slug', x.slug)
        order by x.libelle), '[]'::jsonb)
      from (select distinct ct.categorie_id, ct.libelle, ct.slug
              from partie p
              join categorie_texte ct on ct.categorie_id = p.categorie_id and ct.langue = p_langue
             where p.utilisateur_id = auth.uid() and p.statut = 'terminee') x),

    'badges', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.id,
        'libelle', texte_i18n(b.libelle_i18n, p_langue),
        'condition', texte_i18n(b.condition_i18n, p_langue),
        'objectif', b.objectif,
        'avancement', coalesce(bo.avancement, 0),
        'obtenu', bo.obtenu_le is not null,
        'obtenu_le', bo.obtenu_le) order by b.ordre), '[]'::jsonb)
      from badge b
      left join badge_obtenu bo on bo.badge_id = b.id and bo.utilisateur_id = auth.uid()),

    'maitrise', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'categorie_id', t.categorie_id, 'libelle', ct.libelle, 'slug', ct.slug,
        'etoiles', t.total) order by ct.libelle), '[]'::jsonb)
      from (select categorie_id, sum(etoiles)::int as total from maitrise
             where utilisateur_id = auth.uid() group by categorie_id) t
      join categorie_texte ct on ct.categorie_id = t.categorie_id and ct.langue = p_langue));
end;
$$;

-- -------------------------------------------------------------------------
-- Erreurs à revoir.
--
-- Une question figure ici si la DERNIÈRE réponse qu'on lui a donnée était
-- fausse. Dès qu'on y répond juste plus tard, elle disparaît de la liste :
-- c'est un carnet d'erreurs qui se vide à mesure qu'on apprend.
--
-- La bonne réponse et l'explication sont renvoyées : c'est sans risque,
-- puisque la personne a déjà joué la question.
-- -------------------------------------------------------------------------
create or replace function mes_erreurs(p_langue text default 'fr', p_limite integer default 50)
returns table (
  question_id text, enonce text, reponses jsonb, bonne_reponse smallint,
  explication text, source_url text, source_titre text,
  categorie text, repondue_le timestamptz
)
language sql stable security definer set search_path = public as $$
  with dernieres as (
    select distinct on (r.question_id) r.question_id, r.correcte, r.repondue_le
    from reponse r
    join partie p on p.id = r.partie_id
    where p.utilisateur_id = auth.uid()
    order by r.question_id, r.repondue_le desc
  )
  select q.id, qt.enonce, qt.reponses, q.bonne_reponse,
         qt.explication, qt.source_url, qt.source_titre,
         ct.libelle, d.repondue_le
  from dernieres d
  join question q on q.id = d.question_id
  join question_texte qt on qt.question_id = q.id and qt.langue = p_langue
  join categorie_texte ct on ct.categorie_id = q.categorie_id and ct.langue = p_langue
  where d.correcte = false
  order by d.repondue_le desc
  limit p_limite;
$$;

create or replace function compter_erreurs(p_langue text default 'fr')
returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::int from mes_erreurs(p_langue, 10000);
$$;

-- -------------------------------------------------------------------------
-- Historique des parties.
-- -------------------------------------------------------------------------
create or replace function mon_historique(p_langue text default 'fr', p_limite integer default 50)
returns table (
  partie_id uuid, categorie text, slug text, niveau difficulte_niveau,
  mode partie_mode, points integer, bonnes smallint, total integer,
  gagnee boolean, terminee_le timestamptz
)
language sql stable security definer set search_path = public as $$
  select p.id, ct.libelle, ct.slug, p.niveau, p.mode, p.points, p.bonnes,
         array_length(p.deck, 1), (p.points >= 900 and p.bonnes >= 5), p.terminee_le
  from partie p
  join categorie_texte ct on ct.categorie_id = p.categorie_id and ct.langue = p_langue
  where p.utilisateur_id = auth.uid() and p.statut = 'terminee'
  order by p.terminee_le desc
  limit p_limite;
$$;

-- -------------------------------------------------------------------------
-- « Pour toi » : le prochain niveau à jouer dans chaque catégorie.
--
-- Les catégories déjà commencées passent en premier : on propose de
-- continuer avant de proposer de découvrir.
-- -------------------------------------------------------------------------
create or replace function recommandations(p_langue text default 'fr', p_limite integer default 6)
returns table (
  categorie_id text, libelle text, slug text, niveau difficulte_niveau,
  etoiles_niveau smallint, etoiles_categorie integer
)
language sql stable security definer set search_path = public as $$
  with cats as (
    select categorie_id, libelle, slug from categorie_publique
    where langue = p_langue and nb_questions >= 7
  ),
  m as (select categorie_id, niveau, etoiles from maitrise where utilisateur_id = auth.uid()),
  e as (
    select c.categorie_id, c.libelle, c.slug,
      coalesce((select etoiles from m where m.categorie_id = c.categorie_id and m.niveau = 'facile'), 0) as f,
      coalesce((select etoiles from m where m.categorie_id = c.categorie_id and m.niveau = 'moyen'), 0)  as mo,
      coalesce((select etoiles from m where m.categorie_id = c.categorie_id and m.niveau = 'difficile'), 0) as d
    from cats c
  )
  select categorie_id, libelle, slug,
    case when f < 2 then 'facile'::difficulte_niveau
         when mo < 2 then 'moyen'::difficulte_niveau
         else 'difficile'::difficulte_niveau end,
    (case when f < 2 then f when mo < 2 then mo else d end)::smallint,
    (f + mo + d)::int
  from e
  where f + mo + d < 6
  order by (f + mo + d) desc, libelle
  limit p_limite;
$$;

-- -------------------------------------------------------------------------
-- Langue par défaut.
-- -------------------------------------------------------------------------
create or replace function definir_langue(p_langue text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Session requise' using errcode = '28000';
  end if;
  if not exists (select 1 from langue where code = p_langue and actif) then
    raise exception 'Langue inconnue';
  end if;
  update profil set langue_preferee = p_langue where id = auth.uid();
end;
$$;

-- -------------------------------------------------------------------------
-- Abonnement en cours, pour la page profil.
-- -------------------------------------------------------------------------
create or replace function mes_droits()
returns table (produit text, debut_le timestamptz, fin_le timestamptz, a_vie boolean)
language sql stable security definer set search_path = public as $$
  select produit, debut_le, fin_le, fin_le is null
  from entitlement
  where utilisateur_id = auth.uid()
    and debut_le <= now()
    and (fin_le is null or fin_le > now())
  order by debut_le desc;
$$;

grant execute on function progression, mes_erreurs, compter_erreurs,
                          mon_historique, recommandations, definir_langue, mes_droits
  to authenticated;

commit;
