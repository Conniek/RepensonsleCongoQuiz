-- =========================================================================
-- Nettoyage des comptes anonymes inactifs.
--
-- POURQUOI : Supabase facture les utilisateurs actifs mensuels, comptes
-- anonymes compris. Sans nettoyage, chaque ouverture de l'application par un
-- robot ou un curieux cree un compte qui ne disparait jamais. C'est le risque
-- signale par la console, et il se paie en euros.
--
-- ARBITRAGE : 90 jours, pas 30. Supprimer un compte anonyme supprime la
-- progression du joueur. Quelqu'un qui revient apres deux mois doit retrouver
-- sa serie. Le vrai correctif reste d'inciter a creer un compte.
-- =========================================================================

create or replace function nettoyer_comptes_anonymes(p_jours integer default 90)
returns integer
language plpgsql security definer set search_path = public, auth as $$
declare
  v_supprimes integer;
begin
  with cibles as (
    select u.id
    from auth.users u
    join profil p on p.id = u.id
    where u.is_anonymous = true
      and coalesce(u.last_sign_in_at, u.created_at) < now() - make_interval(days => p_jours)
      -- Filet de securite : on ne supprime jamais quelqu'un qui a paye,
      -- meme anonyme, meme inactif.
      and not exists (select 1 from entitlement e where e.utilisateur_id = u.id)
  )
  delete from auth.users u using cibles c where u.id = c.id;

  get diagnostics v_supprimes = row_count;
  return v_supprimes;
end;
$$;

revoke all on function nettoyer_comptes_anonymes(integer) from anon, authenticated;

comment on function nettoyer_comptes_anonymes(integer) is
  'Supprime les comptes anonymes inactifs depuis N jours, sauf ceux qui detiennent un droit paye. A planifier une fois par semaine.';

-- Planification hebdomadaire. Necessite l'extension pg_cron, a activer dans
-- Database > Extensions. Si elle n'est pas active, la fonction reste
-- appelable a la main et ce bloc ne fait rien.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'nettoyage-comptes-anonymes',
      '0 4 * * 1',
      $cron$ select nettoyer_comptes_anonymes(90); $cron$
    );
  else
    raise notice 'pg_cron absent : planifier nettoyer_comptes_anonymes(90) manuellement.';
  end if;
end;
$$;
