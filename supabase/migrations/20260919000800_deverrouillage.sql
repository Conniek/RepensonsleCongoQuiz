-- =========================================================================
-- Deverrouillage des niveaux.
--
-- Regle (§22) : facile toujours ouvert, moyen apres 2 etoiles en facile,
-- difficile apres 2 etoiles en moyen.
--
-- Le verrou vit COTE SERVEUR. Un lien direct vers /partie?niveau=difficile
-- doit echouer, sinon l'interface n'est qu'une suggestion. Meme logique que
-- pour la regle de victoire : ce qui protege une regle de jeu ne peut pas
-- vivre dans le navigateur.
-- =========================================================================

create or replace function niveau_debloque(
  p_categorie text,
  p_niveau    difficulte_niveau,
  p_uid       uuid default auth.uid()
)
returns boolean
language sql stable security definer set search_path = public as $$
  select case p_niveau
    when 'facile' then true
    when 'moyen' then coalesce(
      (select etoiles >= 2 from maitrise
        where utilisateur_id = p_uid and categorie = p_categorie and niveau = 'facile'), false)
    when 'difficile' then coalesce(
      (select etoiles >= 2 from maitrise
        where utilisateur_id = p_uid and categorie = p_categorie and niveau = 'moyen'), false)
  end;
$$;

-- Etat complet d'une categorie pour le joueur courant : ce que l'interface
-- affiche. Un niveau verrouille reste ANNONCE et explique sa condition, il
-- ne disparait pas (cf. contrat d'accessibilite, aria-disabled).
create or replace function etat_niveaux(p_categorie text)
returns table (
  niveau    difficulte_niveau,
  etoiles   smallint,
  debloque  boolean,
  condition text
)
language sql stable security definer set search_path = public as $$
  select
    n.niveau,
    coalesce(m.etoiles, 0)::smallint,
    niveau_debloque(p_categorie, n.niveau),
    case n.niveau
      when 'facile'    then null
      when 'moyen'     then 'Remporte deux parties au niveau facile pour débloquer ce niveau.'
      when 'difficile' then 'Remporte deux parties au niveau moyen pour débloquer ce niveau.'
    end
  from (values ('facile'::difficulte_niveau), ('moyen'), ('difficile')) as n(niveau)
  left join maitrise m
    on m.utilisateur_id = auth.uid()
   and m.categorie = p_categorie
   and m.niveau = n.niveau
  order by array_position(array['facile','moyen','difficile']::difficulte_niveau[], n.niveau);
$$;

-- -------------------------------------------------------------------------
-- composer_deck refuse desormais un niveau verrouille.
-- Le reste de la fonction est inchange : repli sur les difficultes voisines
-- quand le pool est insuffisant, pour qu'aucune combinaison categorie x
-- niveau debloque ne soit injouable.
-- -------------------------------------------------------------------------
create or replace function composer_deck(
  p_categorie text,
  p_niveau    difficulte_niveau,
  p_longueur  smallint default 7
)
returns table (question_id text, complete boolean)
language plpgsql stable security definer set search_path = public as $$
declare
  v_bornes int[] := case p_niveau
                      when 'facile'    then array[1,2]
                      when 'moyen'     then array[3,3]
                      when 'difficile' then array[4,5]
                    end;
  v_dispo int;
begin
  if auth.uid() is null then
    raise exception 'Session requise pour composer un deck'
      using errcode = '28000';
  end if;

  if not niveau_debloque(p_categorie, p_niveau) then
    raise exception 'Niveau verrouillé : remporte deux parties au niveau précédent'
      using errcode = '42501';
  end if;

  select count(*) into v_dispo
  from question q
  where q.categorie = p_categorie
    and q.statut = 'valide'
    and q.type = 'qcm'
    and q.difficulte between v_bornes[1] and v_bornes[2];

  if v_dispo >= p_longueur then
    return query
      select q.id, false
      from question q
      where q.categorie = p_categorie
        and q.statut = 'valide'
        and q.type = 'qcm'
        and q.difficulte between v_bornes[1] and v_bornes[2]
      order by random()
      limit p_longueur;
  else
    return query
      select q.id, true
      from question q
      where q.categorie = p_categorie
        and q.statut = 'valide'
        and q.type = 'qcm'
      order by abs(q.difficulte - ((v_bornes[1] + v_bornes[2]) / 2.0)), random()
      limit p_longueur;
  end if;
end;
$$;

grant execute on function niveau_debloque, etat_niveaux, composer_deck
  to anon, authenticated;
