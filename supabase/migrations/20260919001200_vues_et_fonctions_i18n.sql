-- =========================================================================
-- Vues et fonctions reconstruites pour le modèle multilingue.
--
-- Toutes prennent désormais une langue. Règle centrale : on ne sert JAMAIS
-- une question dans une autre langue que celle demandée. Mieux vaut une
-- catégorie annoncée comme indisponible qu'une partie à moitié traduite.
-- =========================================================================

begin;

drop view if exists categorie_publique cascade;
drop view if exists question_publique cascade;

-- -------------------------------------------------------------------------
-- Catégories, par langue, avec le nombre RÉEL de questions jouables dans
-- cette langue. C'est ce compteur qui dira quand l'anglais peut s'ouvrir.
-- -------------------------------------------------------------------------
create view categorie_publique
with (security_invoker = false) as
select
  c.id                                                       as categorie_id,
  ct.langue,
  ct.libelle,
  ct.slug,
  c.ordre,
  count(qt.question_id)::int                                 as nb_questions,
  count(qt.question_id) filter (where q.difficulte between 1 and 2)::int as nb_facile,
  count(qt.question_id) filter (where q.difficulte = 3)::int            as nb_moyen,
  count(qt.question_id) filter (where q.difficulte between 4 and 5)::int as nb_difficile
from categorie c
join categorie_texte ct on ct.categorie_id = c.id
left join question q
       on q.categorie_id = c.id and q.statut = 'valide' and q.type = 'qcm'
left join question_texte qt
       on qt.question_id = q.id and qt.langue = ct.langue and qt.statut = 'valide'
where c.actif
group by c.id, ct.langue, ct.libelle, ct.slug, c.ordre;

grant select on categorie_publique to anon, authenticated;

-- Vue lisible par le client : ni bonne réponse, ni explication, ni source.
create view question_publique
with (security_invoker = false) as
select q.id, q.type, q.categorie_id, q.difficulte, q.image_id,
       qt.langue, qt.enonce, qt.reponses, qt.sous_categorie, qt.image_alt
from question q
join question_texte qt on qt.question_id = q.id and qt.statut = 'valide'
where q.statut = 'valide';

grant select on question_publique to anon, authenticated;

-- État de traduction, pour le back-office et pour décider de l'ouverture
-- d'une langue.
create view completude_traduction
with (security_invoker = false) as
select c.id as categorie_id, l.code as langue,
       count(q.id)::int as questions_totales,
       count(qt.question_id) filter (where qt.statut = 'valide')::int as questions_traduites,
       case when count(q.id) > 0
         then round(100.0 * count(qt.question_id) filter (where qt.statut = 'valide') / count(q.id))
       end as pourcentage
from categorie c
cross join langue l
left join question q on q.categorie_id = c.id and q.statut = 'valide'
left join question_texte qt on qt.question_id = q.id and qt.langue = l.code
group by c.id, l.code;

grant select on completude_traduction to anon, authenticated;

-- -------------------------------------------------------------------------
-- Déverrouillage : inchangé sur le fond, la clé devient l'identifiant.
-- -------------------------------------------------------------------------
create or replace function niveau_debloque(
  p_categorie_id text,
  p_niveau       difficulte_niveau,
  p_uid          uuid default auth.uid()
)
returns boolean
language sql stable security definer set search_path = public as $$
  select case p_niveau
    when 'facile' then true
    when 'moyen' then coalesce(
      (select etoiles >= 2 from maitrise
        where utilisateur_id = p_uid and categorie_id = p_categorie_id and niveau = 'facile'), false)
    when 'difficile' then coalesce(
      (select etoiles >= 2 from maitrise
        where utilisateur_id = p_uid and categorie_id = p_categorie_id and niveau = 'moyen'), false)
  end;
$$;

create or replace function etat_niveaux(p_categorie_id text, p_langue text default 'fr')
returns table (
  niveau        difficulte_niveau,
  etoiles       smallint,
  debloque      boolean,
  disponibles   integer
)
language sql stable security definer set search_path = public as $$
  select
    n.niveau,
    coalesce(m.etoiles, 0)::smallint,
    niveau_debloque(p_categorie_id, n.niveau),
    (select count(*)::int from question q
      join question_texte qt on qt.question_id = q.id
       and qt.langue = p_langue and qt.statut = 'valide'
     where q.categorie_id = p_categorie_id and q.statut = 'valide' and q.type = 'qcm'
       and q.difficulte between
           case n.niveau when 'facile' then 1 when 'moyen' then 3 else 4 end and
           case n.niveau when 'facile' then 2 when 'moyen' then 3 else 5 end)
  from (values ('facile'::difficulte_niveau), ('moyen'), ('difficile')) as n(niveau)
  left join maitrise m
    on m.utilisateur_id = auth.uid()
   and m.categorie_id = p_categorie_id
   and m.niveau = n.niveau
  order by array_position(array['facile','moyen','difficile']::difficulte_niveau[], n.niveau);
$$;

-- -------------------------------------------------------------------------
-- Composition du deck, dans une langue donnée.
--
-- On ne sert jamais une question non traduite. Au lancement, l'anglais
-- renverra donc peu ou pas de questions : c'est voulu et annoncé à
-- l'utilisateur, plutôt qu'une partie moitié française moitié anglaise.
-- -------------------------------------------------------------------------
drop function if exists composer_deck(text, difficulte_niveau, smallint);

create or replace function composer_deck(
  p_categorie_id text,
  p_niveau       difficulte_niveau,
  p_langue       text default 'fr',
  p_longueur     smallint default 7
)
returns table (question_id text, complete boolean)
language plpgsql stable security definer set search_path = public as $$
declare
  v_min int := case p_niveau when 'facile' then 1 when 'moyen' then 3 else 4 end;
  v_max int := case p_niveau when 'facile' then 2 when 'moyen' then 3 else 5 end;
  v_dispo int;
  v_total int;
begin
  if auth.uid() is null then
    raise exception 'Session requise pour composer un deck' using errcode = '28000';
  end if;
  if not niveau_debloque(p_categorie_id, p_niveau) then
    raise exception 'Niveau verrouillé : remporte deux parties au niveau précédent'
      using errcode = '42501';
  end if;

  select count(*) into v_dispo
  from question q
  join question_texte qt on qt.question_id = q.id
   and qt.langue = p_langue and qt.statut = 'valide'
  where q.categorie_id = p_categorie_id and q.statut = 'valide' and q.type = 'qcm'
    and q.difficulte between v_min and v_max;

  select count(*) into v_total
  from question q
  join question_texte qt on qt.question_id = q.id
   and qt.langue = p_langue and qt.statut = 'valide'
  where q.categorie_id = p_categorie_id and q.statut = 'valide' and q.type = 'qcm';

  if v_total < p_longueur then
    raise exception 'Catégorie pas encore disponible dans cette langue'
      using errcode = 'P0002';
  end if;

  if v_dispo >= p_longueur then
    return query
      select q.id, false
      from question q
      join question_texte qt on qt.question_id = q.id
       and qt.langue = p_langue and qt.statut = 'valide'
      where q.categorie_id = p_categorie_id and q.statut = 'valide' and q.type = 'qcm'
        and q.difficulte between v_min and v_max
      order by random() limit p_longueur;
  else
    -- Repli sur les difficultés voisines de la même catégorie, toujours
    -- dans la langue demandée.
    return query
      select q.id, true
      from question q
      join question_texte qt on qt.question_id = q.id
       and qt.langue = p_langue and qt.statut = 'valide'
      where q.categorie_id = p_categorie_id and q.statut = 'valide' and q.type = 'qcm'
      order by abs(q.difficulte - ((v_min + v_max) / 2.0)), random()
      limit p_longueur;
  end if;
end;
$$;

-- -------------------------------------------------------------------------
-- Validation d'une réponse : l'explication et la source arrivent dans la
-- langue de la partie.
-- -------------------------------------------------------------------------
create or replace function valider_reponse(
  p_partie_id uuid,
  p_position  smallint,
  p_choix     smallint,
  p_duree_ms  integer
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_partie   partie;
  v_qid      text;
  v_bonne    smallint;
  v_texte    question_texte;
  v_correcte boolean;
  v_points   integer := 0;
  v_bonus    integer := 0;
begin
  select * into v_partie from partie where id = p_partie_id;
  if v_partie.id is null then raise exception 'Partie introuvable'; end if;
  if v_partie.utilisateur_id <> auth.uid() then
    raise exception 'Cette partie ne vous appartient pas';
  end if;
  if v_partie.statut <> 'en_cours' then
    raise exception 'Cette partie est terminée';
  end if;

  v_qid := v_partie.deck[p_position + 1];
  select bonne_reponse into v_bonne from question where id = v_qid;
  select * into v_texte from question_texte
   where question_id = v_qid and langue = v_partie.langue;

  v_correcte := (p_choix is not null and p_choix = v_bonne);

  if v_correcte then
    v_points := 125;
    if v_partie.chrono_actif and p_duree_ms is not null then
      v_bonus := greatest(0, least(75, ((15000 - p_duree_ms) * 75) / 15000));
    end if;
  end if;

  insert into reponse (partie_id, question_id, position, choix, correcte, duree_ms, points)
  values (p_partie_id, v_qid, p_position, p_choix, v_correcte, p_duree_ms, v_points + v_bonus)
  on conflict (partie_id, position) do nothing;

  update partie
     set points = points + v_points + v_bonus,
         bonnes = bonnes + case when v_correcte then 1 else 0 end
   where id = p_partie_id;

  return jsonb_build_object(
    'correcte',      v_correcte,
    'bonne_reponse', v_bonne,
    'explication',   v_texte.explication,
    'source_url',    v_texte.source_url,
    'source_titre',  v_texte.source_titre,
    'points',        v_points + v_bonus);
end;
$$;

create or replace function pack_hors_ligne(p_categorie_id text, p_langue text default 'fr')
returns table (
  id text, difficulte smallint, bonne_reponse smallint, image_id text,
  enonce text, reponses jsonb, sous_categorie text, explication text,
  source_url text, source_titre text, image_alt text
)
language sql stable security definer set search_path = public as $$
  select q.id, q.difficulte, q.bonne_reponse, q.image_id,
         qt.enonce, qt.reponses, qt.sous_categorie, qt.explication,
         qt.source_url, qt.source_titre, qt.image_alt
  from question q
  join question_texte qt on qt.question_id = q.id
   and qt.langue = p_langue and qt.statut = 'valide'
  where q.categorie_id = p_categorie_id and q.statut = 'valide' and q.type = 'qcm';
$$;

grant execute on function niveau_debloque, etat_niveaux, composer_deck,
                          valider_reponse, pack_hors_ligne
  to anon, authenticated;

commit;
