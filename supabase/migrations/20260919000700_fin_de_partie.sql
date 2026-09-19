-- =========================================================================
-- Cloture d'une partie et vue des categories.
--
-- Manquait a la phase 2 : le client n'avait aucun moyen de terminer une
-- partie, et il n'existe aucune policy d'update sur `partie`. C'est voulu :
-- la regle de victoire (900 points ET 5 bonnes reponses sur 7, §22) ne doit
-- pas vivre dans le navigateur, sinon elle est contournable.
-- =========================================================================

create or replace function terminer_partie(p_partie_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_partie  partie;
  v_gagnee  boolean;
  v_etoile  boolean := false;
  v_etoiles smallint;
begin
  select * into v_partie from partie where id = p_partie_id;

  if v_partie.id is null then
    raise exception 'Partie introuvable';
  end if;
  if v_partie.utilisateur_id <> auth.uid() then
    raise exception 'Cette partie ne vous appartient pas';
  end if;

  -- Idempotent : rejouer la cloture renvoie le meme resultat sans rien
  -- recalculer. Le navigateur peut donc reessayer sans risque.
  if v_partie.statut = 'terminee' then
    select etoiles into v_etoiles from maitrise
     where utilisateur_id = v_partie.utilisateur_id
       and categorie = v_partie.categorie and niveau = v_partie.niveau;
    return jsonb_build_object(
      'deja_terminee', true,
      'points', v_partie.points,
      'bonnes', v_partie.bonnes,
      'gagnee', v_partie.points >= 900 and v_partie.bonnes >= 5,
      'deck_complete', v_partie.deck_complete,
      'etoiles_categorie', coalesce(v_etoiles, 0));
  end if;

  v_gagnee := (v_partie.points >= 900 and v_partie.bonnes >= 5);

  update partie set statut = 'terminee', terminee_le = now() where id = p_partie_id;

  -- Une victoire vaut une etoile, plafonnee a 2 par niveau.
  if v_gagnee and v_partie.categorie is not null and v_partie.niveau is not null then
    insert into maitrise (utilisateur_id, categorie, niveau, etoiles)
    values (v_partie.utilisateur_id, v_partie.categorie, v_partie.niveau, 1)
    on conflict (utilisateur_id, categorie, niveau)
      do update set etoiles = least(2, maitrise.etoiles + 1);
    v_etoile := true;
  end if;

  select etoiles into v_etoiles from maitrise
   where utilisateur_id = v_partie.utilisateur_id
     and categorie = v_partie.categorie and niveau = v_partie.niveau;

  return jsonb_build_object(
    'deja_terminee', false,
    'points', v_partie.points,
    'bonnes', v_partie.bonnes,
    'gagnee', v_gagnee,
    'etoile_gagnee', v_etoile,
    'deck_complete', v_partie.deck_complete,
    'etoiles_categorie', coalesce(v_etoiles, 0));
end;
$$;

grant execute on function terminer_partie to anon, authenticated;

-- -------------------------------------------------------------------------
-- Vue des categories : evite de rapatrier 1 445 lignes pour afficher une
-- liste de 12 entrees.
-- -------------------------------------------------------------------------
create or replace view categorie_publique
with (security_invoker = false) as
select
  categorie,
  count(*)::int                                          as nb_questions,
  count(*) filter (where difficulte between 1 and 2)::int as nb_facile,
  count(*) filter (where difficulte = 3)::int             as nb_moyen,
  count(*) filter (where difficulte between 4 and 5)::int as nb_difficile
from question
where statut = 'valide' and type = 'qcm'
group by categorie;

grant select on categorie_publique to anon, authenticated;
