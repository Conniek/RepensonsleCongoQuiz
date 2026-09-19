-- =========================================================================
-- Comptes : conversion d'un compte anonyme, pseudo, export et suppression.
--
-- PRINCIPE : le compte est FACULTATIF. On joue, on progresse et on gagne des
-- badges sans compte. Le compte ne sert qu'a retrouver sa progression sur un
-- autre appareil. Une partie de l'audience utilise peu l'e-mail : un mur
-- devant une option est acceptable, un mur devant le jeu ne l'aurait pas ete.
--
-- CONVERSION SANS PERTE : lier une identite a un compte anonyme conserve le
-- meme auth.uid(). Il n'y a donc RIEN a migrer : les parties, les etoiles,
-- les badges et l'experience restent attaches au meme identifiant.
-- =========================================================================

-- Supabase bascule is_anonymous a false une fois l'e-mail confirme. Le profil
-- doit suivre, sinon l'interface continue d'afficher « tu joues sans compte ».
create or replace function synchroniser_anonyme()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update profil
     set anonyme = coalesce(new.is_anonymous, false)
   where id = new.id
     and anonyme is distinct from coalesce(new.is_anonymous, false);
  return new;
end;
$$;

drop trigger if exists profil_suit_anonymat on auth.users;
create trigger profil_suit_anonymat
  after update on auth.users
  for each row execute function synchroniser_anonyme();

-- -------------------------------------------------------------------------
-- Pseudo.
--
-- La politique de securite ne laisse lire que son propre profil : le client
-- ne peut donc pas verifier lui-meme si un pseudo est pris. Cette fonction
-- repond par oui ou non, sans jamais divulguer a qui il appartient.
-- -------------------------------------------------------------------------
create or replace function pseudo_disponible(p_pseudo text)
returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (
    select 1 from profil
    where lower(pseudo) = lower(trim(p_pseudo))
      and id is distinct from auth.uid()
  );
$$;

create or replace function definir_pseudo(p_pseudo text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_pseudo text := trim(p_pseudo);
begin
  if auth.uid() is null then
    raise exception 'Session requise' using errcode = '28000';
  end if;
  if char_length(v_pseudo) < 2 or char_length(v_pseudo) > 24 then
    return jsonb_build_object('ok', false, 'motif', 'longueur');
  end if;
  if not pseudo_disponible(v_pseudo) then
    return jsonb_build_object('ok', false, 'motif', 'pris');
  end if;

  update profil set pseudo = v_pseudo where id = auth.uid();
  return jsonb_build_object('ok', true, 'pseudo', v_pseudo);
end;
$$;

-- -------------------------------------------------------------------------
-- RGPD : export et suppression.
--
-- Ces deux fonctions ne sont pas optionnelles des lors qu'il y a un compte.
-- Elles doivent exister avant la mise en ligne, pas apres.
-- -------------------------------------------------------------------------
create or replace function exporter_mes_donnees()
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'exporte_le', now(),
    'profil', (select to_jsonb(p) - 'id' from profil p where p.id = auth.uid()),
    'parties', (select coalesce(jsonb_agg(to_jsonb(x) - 'utilisateur_id' - 'adversaire_id'), '[]'::jsonb)
                  from partie x where x.utilisateur_id = auth.uid()),
    'reponses', (select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
                   from reponse r
                   join partie x on x.id = r.partie_id
                  where x.utilisateur_id = auth.uid()),
    'maitrise', (select coalesce(jsonb_agg(to_jsonb(m) - 'utilisateur_id'), '[]'::jsonb)
                   from maitrise m where m.utilisateur_id = auth.uid()),
    'badges', (select coalesce(jsonb_agg(to_jsonb(b) - 'utilisateur_id'), '[]'::jsonb)
                 from badge_obtenu b where b.utilisateur_id = auth.uid()),
    'droits', (select coalesce(jsonb_agg(to_jsonb(e) - 'utilisateur_id'), '[]'::jsonb)
                 from entitlement e where e.utilisateur_id = auth.uid()));
$$;

-- La suppression d'un compte passe normalement par l'API d'administration,
-- donc par la cle de service, qui n'a rien a faire dans un navigateur.
-- Cette fonction permet a la personne de supprimer SON PROPRE compte, et
-- rien d'autre. Les cascades du schema emportent profil, parties, reponses,
-- maitrise, badges et droits.
create or replace function supprimer_mon_compte()
returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Session requise' using errcode = '28000';
  end if;
  delete from auth.users where id = v_uid;
end;
$$;

grant execute on function pseudo_disponible, definir_pseudo,
                          exporter_mes_donnees, supprimer_mon_compte
  to authenticated;

-- Le profil expose desormais le pseudo dans progression().
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
  if auth.uid() is null then return null; end if;

  select * into v_profil from profil where id = auth.uid();
  if v_profil.id is null then return null; end if;

  select libelle, seuil into v_rang, v_seuil
    from rang where seuil <= v_profil.xp order by seuil desc limit 1;
  select seuil, libelle into v_suivant, v_rang_suivant
    from rang where seuil > v_profil.xp order by seuil limit 1;

  return jsonb_build_object(
    'xp', v_profil.xp,
    'pseudo', v_profil.pseudo,
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
        then round(100.0 * sum(bonnes) / sum(array_length(deck,1))) end
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
