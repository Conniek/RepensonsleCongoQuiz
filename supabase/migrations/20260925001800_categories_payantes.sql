-- =========================================================================
-- Categories payantes.
--
-- Jusqu'ici, « payant » n'existait que dans le discours commercial : aucune
-- categorie ne portait de produit, donc rien n'etait verrouille. Cette
-- migration relie les deux : une categorie peut exiger un produit, la vue
-- publique le dit, et composer_deck refuse une partie sans le droit.
--
-- L'ordre compte : la vue sert a GRISER dans l'interface, la verification
-- dans composer_deck est celle qui protege reellement. Une interface se
-- contourne, une fonction serveur non.
-- =========================================================================

begin;

-- -------------------------------------------------------------------------
-- Produit requis par categorie. NULL = gratuit, ce qui reste le cas de la
-- tres grande majorite : le quiz general doit rester ouvert, c'est lui qui
-- fait venir les gens.
-- -------------------------------------------------------------------------
alter table categorie add column if not exists produit_requis text
  check (produit_requis is null
         or produit_requis in ('plus', 'langue_lingala', 'pack_langues'));

comment on column categorie.produit_requis is
  'Produit exige pour jouer cette categorie. NULL = accessible a tous.';

-- -------------------------------------------------------------------------
-- La vue publique expose le produit requis. Elle n'expose PAS le droit du
-- joueur : c'est une vue mise en cache, partagee par tous. Le droit se
-- demande par mes_droits, qui depend de auth.uid().
-- -------------------------------------------------------------------------
drop view if exists categorie_publique cascade;

create view categorie_publique
with (security_invoker = false) as
select
  c.id                                                       as categorie_id,
  ct.langue,
  ct.libelle,
  ct.slug,
  c.ordre,
  c.produit_requis,
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
group by c.id, ct.langue, ct.libelle, ct.slug, c.ordre, c.produit_requis;

grant select on categorie_publique to anon, authenticated;

-- -------------------------------------------------------------------------
-- Le verrou reel. Meme corps que la version precedente, avec un controle de
-- droit ajoute juste apres le controle de niveau : les deux raisons de
-- refuser une partie se lisent donc au meme endroit.
-- -------------------------------------------------------------------------
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
  v_produit text;
begin
  if auth.uid() is null then
    raise exception 'Session requise pour composer un deck' using errcode = '28000';
  end if;

  select produit_requis into v_produit from categorie where id = p_categorie_id;

  if v_produit is not null and not a_droit(auth.uid(), v_produit) then
    raise exception 'Contenu reserve : ce theme demande le produit %', v_produit
      using errcode = '42501';
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
-- Rattachement du catalogue paye, par slug francais. Sans correspondance,
-- rien ne se passe : la requete ne casse pas si la categorie n'existe pas
-- encore, elle ne marque simplement rien.
-- -------------------------------------------------------------------------
update categorie c
   set produit_requis = 'plus'
  from categorie_texte ct
 where ct.categorie_id = c.id
   and ct.langue = 'fr'
   and ct.slug in ('elections', 'independance');

update categorie c
   set produit_requis = 'langue_lingala'
  from categorie_texte ct
 where ct.categorie_id = c.id
   and ct.langue = 'fr'
   and ct.slug in ('lingala');

commit;
