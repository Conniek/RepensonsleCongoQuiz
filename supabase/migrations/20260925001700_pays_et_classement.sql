-- =========================================================================
-- Pays du joueur et classement.
--
-- Le pays est saisi a l'inscription (etape 2 de l'onboarding) et sert deux
-- choses : le classement national et, plus tard, l'editorialisation par
-- diaspora. C'est une donnee personnelle : elle suit l'export et la
-- suppression de compte comme le reste du profil.
--
-- Le classement est calcule COTE SERVEUR, comme tout ce qui recompense. Un
-- classement calcule dans le navigateur serait un classement declaratif.
-- =========================================================================

begin;

-- -------------------------------------------------------------------------
-- Pays.
-- Code ISO 3166-1 alpha-2, en majuscules. On ne stocke pas le libelle : il
-- est traduit a l'affichage par Intl.DisplayNames, donc jamais a maintenir.
-- -------------------------------------------------------------------------
alter table profil add column if not exists pays text
  check (pays is null or pays ~ '^[A-Z]{2}$');

create index if not exists profil_pays_idx on profil (pays) where pays is not null;

create or replace function definir_pays(p_pays text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Session requise' using errcode = '28000';
  end if;
  if p_pays is not null and p_pays !~ '^[A-Z]{2}$' then
    raise exception 'Code pays invalide';
  end if;
  update profil set pays = p_pays where id = auth.uid();
end;
$$;

-- -------------------------------------------------------------------------
-- Classement.
--
-- p_portee  : 'monde' | 'pays'  (pays = celui du joueur courant)
-- p_periode : 'semaine' | 'mois' | 'tout'
--
-- 'tout' s'appuie sur profil.xp, deja cumule. Les periodes glissantes
-- reconstituent l'experience a partir des parties terminees : partie.xp_gagne
-- est ecrit a la cloture, donc la somme est fidele sans recalcul de regles.
--
-- Les comptes sans pseudo sont exclus : un classement d'invites anonymes
-- n'a aucun sens, et le pseudo est la seule donnee qu'on accepte d'exposer.
-- -------------------------------------------------------------------------
create or replace function classement(
  p_portee  text default 'monde',
  p_periode text default 'tout',
  p_limite  integer default 10
)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_depuis timestamptz;
  v_pays   text;
  v_top    jsonb;
  v_moi    jsonb;
begin
  if p_portee not in ('monde', 'pays') then
    raise exception 'Portee inconnue : %', p_portee;
  end if;
  if p_periode not in ('semaine', 'mois', 'tout') then
    raise exception 'Periode inconnue : %', p_periode;
  end if;

  v_depuis := case p_periode
    when 'semaine' then now() - interval '7 days'
    when 'mois'    then now() - interval '30 days'
    else null end;

  select pays into v_pays from profil where id = auth.uid();

  -- Portee 'pays' sans pays renseigne : on ne peut pas classer, on le dit.
  if p_portee = 'pays' and v_pays is null then
    return jsonb_build_object('portee', p_portee, 'periode', p_periode,
                              'pays', null, 'top', '[]'::jsonb, 'moi', null);
  end if;

  with eligibles as (
    select p.id, p.pseudo, p.pays,
           case
             when v_depuis is null then p.xp
             else coalesce((
               select sum(g.xp_gagne) from partie g
                where g.utilisateur_id = p.id
                  and g.statut = 'terminee'
                  and g.terminee_le >= v_depuis), 0)
           end as points
      from profil p
     where p.pseudo is not null
       and (p_portee = 'monde' or p.pays = v_pays)
  ),
  classee as (
    select id, pseudo, pays, points,
           rank() over (order by points desc, pseudo) as position
      from eligibles
     where points > 0
  )
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'position', position, 'pseudo', pseudo, 'pays', pays, 'points', points,
      'moi', id = auth.uid()) order by position), '[]'::jsonb)
    from (select * from classee order by position limit p_limite) t
  into v_top;

  -- La ligne du joueur courant, meme hors du haut de tableau : sans elle,
  -- un classement decourage tout le monde sauf les dix premiers.
  with eligibles as (
    select p.id, p.pseudo, p.pays,
           case
             when v_depuis is null then p.xp
             else coalesce((
               select sum(g.xp_gagne) from partie g
                where g.utilisateur_id = p.id
                  and g.statut = 'terminee'
                  and g.terminee_le >= v_depuis), 0)
           end as points
      from profil p
     where p.pseudo is not null
       and (p_portee = 'monde' or p.pays = v_pays)
  ),
  classee as (
    select id, pseudo, pays, points,
           rank() over (order by points desc, pseudo) as position
      from eligibles
     where points > 0
  )
  select jsonb_build_object(
    'position', position, 'pseudo', pseudo, 'pays', pays, 'points', points,
    'moi', true)
    from classee where id = auth.uid()
  into v_moi;

  return jsonb_build_object(
    'portee', p_portee, 'periode', p_periode, 'pays',
    case when p_portee = 'pays' then v_pays else null end,
    'top', v_top, 'moi', v_moi);
end;
$$;

grant execute on function definir_pays, classement to anon, authenticated;

commit;
