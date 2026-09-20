-- =========================================================================
-- Analyse, campagnes, quiz spéciaux et gestion des inscrits.
--
-- Principe de répartition : ce que Stripe sait, Stripe le garde. Les
-- recettes, le churn d'abonnement et les échecs de paiement resteront dans
-- Stripe. L'application mesure ce que Stripe ne peut pas voir : l'USAGE.
-- =========================================================================

begin;

-- -------------------------------------------------------------------------
-- 1. Parties abandonnées.
--
-- CORRECTIF DE DONNÉES, pas un confort : une partie quittée reste
-- « en_cours » indéfiniment. Sans expiration, le taux de complétion est faux
-- et on ne sait jamais à quelle question les gens décrochent.
-- -------------------------------------------------------------------------
create or replace function expirer_parties_abandonnees(p_heures integer default 6)
returns integer
language plpgsql security definer set search_path = public as $$
declare v_n integer;
begin
  update partie
     set statut = 'expiree'
   where statut = 'en_cours'
     and commencee_le < now() - make_interval(hours => p_heures);
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

revoke all on function expirer_parties_abandonnees(integer) from anon, authenticated;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('expiration-parties', '0 * * * *',
      $cron$ select expirer_parties_abandonnees(6); $cron$);
  else
    raise notice 'pg_cron absent : planifier expirer_parties_abandonnees(6) manuellement.';
  end if;
end;
$$;

-- -------------------------------------------------------------------------
-- 2. Vues d'analyse.
--
-- Une vue par question métier. Elles servent tout de suite à un écran
-- simple, et le jour où vous branchez un outil de BI, il se branche dessus
-- sans rien recoder.
-- -------------------------------------------------------------------------

-- Rétention par cohorte hebdomadaire.
-- La cohorte est fixée sur la PREMIÈRE PARTIE, pas sur l'inscription :
-- sinon la conversion d'un compte anonyme en compte réel ferait bouger les
-- courbes rétroactivement.
create or replace view vue_retention as
with premiere as (
  select utilisateur_id, min(commencee_le)::date as jour_un
  from partie where statut = 'terminee' group by utilisateur_id
),
activite as (
  select p.utilisateur_id, pr.jour_un,
         (p.commencee_le::date - pr.jour_un) as jours_apres
  from partie p join premiere pr on pr.utilisateur_id = p.utilisateur_id
  where p.statut = 'terminee'
)
select
  date_trunc('week', jour_un)::date as cohorte,
  count(distinct utilisateur_id)::int as joueurs,
  count(distinct utilisateur_id) filter (where jours_apres between 1 and 1)::int  as revenus_j1,
  count(distinct utilisateur_id) filter (where jours_apres between 1 and 7)::int  as revenus_j7,
  count(distinct utilisateur_id) filter (where jours_apres between 1 and 30)::int as revenus_j30
from activite
group by 1 order by 1 desc;

-- Complétion et abandon.
create or replace view vue_completion as
select
  date_trunc('week', commencee_le)::date as semaine,
  count(*)::int as parties_lancees,
  count(*) filter (where statut = 'terminee')::int as terminees,
  count(*) filter (where statut = 'expiree')::int as abandonnees,
  round(100.0 * count(*) filter (where statut = 'terminee') / nullif(count(*), 0))
    as taux_completion,
  count(*) filter (where statut = 'terminee' and points >= 900 and bonnes >= 5)::int
    as gagnees
from partie group by 1 order by 1 desc;

-- À quelle question les gens décrochent.
-- Deux niveaux d'agrégation : d'abord la dernière position atteinte par
-- partie, ensuite le comptage. Postgres refuse de regrouper sur une
-- expression contenant elle-même un agrégat.
create or replace view vue_abandon_position as
select derniere_question, count(*)::int as parties
from (
  select p.id, coalesce(max(r.position) + 1, 0) as derniere_question
  from partie p
  left join reponse r on r.partie_id = p.id
  where p.statut = 'expiree'
  group by p.id
) t
group by derniere_question
order by derniere_question;

-- Popularité par catégorie et par langue.
create or replace view vue_popularite as
select
  p.categorie_id, ct.langue, ct.libelle, p.niveau,
  count(*)::int as parties,
  count(distinct p.utilisateur_id)::int as joueurs,
  round(avg(p.points))::int as points_moyens,
  round(100.0 * count(*) filter (where p.points >= 900 and p.bonnes >= 5)
        / nullif(count(*), 0)) as taux_victoire
from partie p
join categorie_texte ct on ct.categorie_id = p.categorie_id
where p.statut = 'terminee'
group by 1, 2, 3, 4;

-- Questions jamais servies : angle mort éditorial classique.
create or replace view vue_questions_jamais_servies as
select q.id, q.categorie_id, q.difficulte, qt.enonce
from question q
join question_texte qt on qt.question_id = q.id and qt.langue = 'fr'
where q.statut = 'valide' and q.vues = 0;

-- Les vues d'analyse ne contiennent aucune donnée nominative : pas
-- d'adresse, pas de pseudo, seulement des agrégats.
create or replace function analyse_usage()
returns jsonb
language sql stable security definer set search_path = public as $$
  select case when not est_editeur() then null else jsonb_build_object(
    'retention',  (select coalesce(jsonb_agg(to_jsonb(v)), '[]'::jsonb)
                     from (select * from vue_retention limit 8) v),
    'completion', (select coalesce(jsonb_agg(to_jsonb(v)), '[]'::jsonb)
                     from (select * from vue_completion limit 8) v),
    'abandon',    (select coalesce(jsonb_agg(to_jsonb(v)), '[]'::jsonb)
                     from vue_abandon_position v),
    'popularite', (select coalesce(jsonb_agg(to_jsonb(v)), '[]'::jsonb)
                     from (select * from vue_popularite
                            where langue = 'fr' order by parties desc limit 20) v),
    'jamais_servies', (select count(*) from vue_questions_jamais_servies),
    'joueurs', jsonb_build_object(
      'total',     (select count(*) from profil),
      'avec_compte', (select count(*) from profil where not anonyme),
      'actifs_7j', (select count(distinct utilisateur_id) from partie
                     where commencee_le > now() - interval '7 days'),
      'actifs_30j',(select count(distinct utilisateur_id) from partie
                     where commencee_le > now() - interval '30 days'))
  ) end;
$$;

grant execute on function analyse_usage to authenticated;

-- -------------------------------------------------------------------------
-- 3. Gestion des inscrits — RÉSERVÉE AUX ADMINISTRATEURS.
--
-- Aucune liste complète d'adresses : la recherche est ciblée, pour traiter
-- une demande précise. Une liste de mille adresses exportable d'un clic est
-- un risque inutile.
-- -------------------------------------------------------------------------
create or replace function rechercher_inscrit(p_terme text)
returns table (
  id uuid, email text, pseudo text, role text, anonyme boolean,
  xp integer, parties integer, inscrit_le timestamptz, derniere_partie date
)
language sql stable security definer set search_path = public, auth as $$
  select u.id, u.email, p.pseudo, p.role, p.anonyme, p.xp,
         (select count(*)::int from partie where utilisateur_id = p.id),
         p.cree_le, p.derniere_partie_le
  from profil p join auth.users u on u.id = p.id
  where est_admin()
    and char_length(trim(p_terme)) >= 3
    and (u.email ilike '%' || trim(p_terme) || '%'
      or p.pseudo ilike '%' || trim(p_terme) || '%')
  limit 20;
$$;

create or replace function definir_role(p_utilisateur uuid, p_role text)
returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not est_admin() then
    raise exception 'Droits insuffisants' using errcode = '42501';
  end if;
  if p_role not in ('joueur', 'editeur', 'admin') then
    return jsonb_build_object('ok', false, 'motif', 'role_inconnu');
  end if;
  -- Filet : un administrateur ne peut pas se retirer ses propres droits,
  -- sinon plus personne ne peut en attribuer.
  if p_utilisateur = auth.uid() and p_role <> 'admin' then
    return jsonb_build_object('ok', false, 'motif', 'auto_retrait');
  end if;

  update profil set role = p_role where id = p_utilisateur;
  return jsonb_build_object('ok', true);
end;
$$;

-- RGPD : traiter une demande reçue par message, sans ouvrir la console.
create or replace function exporter_donnees_de(p_utilisateur uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not est_admin() then
    raise exception 'Droits insuffisants' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'exporte_le', now(),
    'profil', (select to_jsonb(p) from profil p where p.id = p_utilisateur),
    'parties', (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb)
                  from partie x where x.utilisateur_id = p_utilisateur),
    'badges', (select coalesce(jsonb_agg(to_jsonb(b)), '[]'::jsonb)
                 from badge_obtenu b where b.utilisateur_id = p_utilisateur));
end;
$$;

create or replace function supprimer_compte_de(p_utilisateur uuid)
returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not est_admin() then
    raise exception 'Droits insuffisants' using errcode = '42501';
  end if;
  if p_utilisateur = auth.uid() then
    raise exception 'Utilisez la suppression depuis votre profil';
  end if;
  delete from auth.users where id = p_utilisateur;
end;
$$;

grant execute on function rechercher_inscrit, definir_role,
                          exporter_donnees_de, supprimer_compte_de
  to authenticated;

commit;
