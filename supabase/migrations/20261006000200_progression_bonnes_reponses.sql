begin;

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
    'bonnes_total', (select coalesce(sum(bonnes), 0) from partie
                      where utilisateur_id = auth.uid() and statut = 'terminee'),
    'taux_reussite', (
      select case when sum(array_length(deck,1)) > 0
        then round(100.0 * sum(bonnes) / sum(array_length(deck,1))) end
      from partie where utilisateur_id = auth.uid() and statut = 'terminee'),
    'etoiles_total', (select coalesce(sum(etoiles), 0) from maitrise
                       where utilisateur_id = auth.uid()),
    'etoiles_max', (select count(*) * 6 from categorie_publique
                     where langue = p_langue and nb_questions >= 7),
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

commit;
