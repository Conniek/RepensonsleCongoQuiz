-- =========================================================================
-- Back-office : rôles, droits d'édition, fonctions d'administration.
--
-- PRINCIPE : le droit d'éditer est un rôle porté par le profil, vérifié
-- côté serveur. La clé de service ne doit JAMAIS arriver dans un navigateur :
-- elle contourne toutes les politiques de sécurité écrites depuis la phase 2.
-- =========================================================================

begin;

alter table profil add column if not exists role text not null default 'joueur'
  check (role in ('joueur', 'editeur', 'admin'));

create or replace function est_editeur()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('editeur', 'admin') from profil where id = auth.uid()),
    false);
$$;

create or replace function est_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from profil where id = auth.uid()), false);
$$;

grant execute on function est_editeur, est_admin to authenticated;

-- -------------------------------------------------------------------------
-- Accès aux tables de contenu.
--
-- Les privilèges de table sont rendus, mais les politiques ne laissent
-- passer que les éditeurs. Un joueur connecté obtient zéro ligne : c'est
-- équivalent à l'interdiction précédente, et ça permet au back-office de
-- travailler sans clé de service.
-- -------------------------------------------------------------------------
grant select, insert, update on question, question_texte to authenticated;
grant select, insert, update, delete on question_tag to authenticated;
grant select, insert, update on tag, quiz_special, campagne, categorie, categorie_texte
  to authenticated;

create policy "editeurs lisent les questions" on question
  for select to authenticated using (est_editeur());
create policy "editeurs modifient les questions" on question
  for update to authenticated using (est_editeur()) with check (est_editeur());
create policy "editeurs creent des questions" on question
  for insert to authenticated with check (est_editeur());

create policy "editeurs lisent les textes" on question_texte
  for select to authenticated using (est_editeur());
create policy "editeurs modifient les textes" on question_texte
  for update to authenticated using (est_editeur()) with check (est_editeur());
create policy "editeurs creent des textes" on question_texte
  for insert to authenticated with check (est_editeur());

create policy "editeurs gerent les rattachements" on question_tag
  for all to authenticated using (est_editeur()) with check (est_editeur());
create policy "editeurs gerent les tags" on tag
  for all to authenticated using (est_editeur()) with check (est_editeur());
create policy "editeurs gerent les quiz speciaux" on quiz_special
  for all to authenticated using (est_editeur()) with check (est_editeur());
create policy "editeurs gerent les campagnes" on campagne
  for all to authenticated using (est_editeur()) with check (est_editeur());
create policy "editeurs gerent les categories" on categorie
  for all to authenticated using (est_editeur()) with check (est_editeur());
create policy "editeurs gerent les libelles" on categorie_texte
  for all to authenticated using (est_editeur()) with check (est_editeur());

-- -------------------------------------------------------------------------
-- Recalibration de la difficulté.
--
-- La difficulté déclarée est comparée au taux de réussite observé. Seuils
-- paramétrables, échantillon minimal de 50 présentations pour éviter les
-- faux signaux.
-- -------------------------------------------------------------------------
create or replace function questions_a_recalibrer(
  p_langue      text default 'fr',
  p_echantillon integer default 50,
  p_limite      integer default 100
)
returns table (
  question_id     text,
  enonce          text,
  categorie_id    text,
  categorie       text,
  difficulte      smallint,
  vues            integer,
  taux            numeric,
  suggestion      smallint,
  motif           text
)
language sql stable security definer set search_path = public as $$
  select
    q.id, qt.enonce, q.categorie_id, ct.libelle, q.difficulte, q.vues,
    round(100.0 * q.reussites / nullif(q.vues, 0)) as taux,
    case
      when q.reussites::numeric / nullif(q.vues, 0) > 0.85 then greatest(1, q.difficulte - 1)::smallint
      when q.reussites::numeric / nullif(q.vues, 0) < 0.40 then least(5, q.difficulte + 1)::smallint
    end,
    case
      when q.reussites::numeric / nullif(q.vues, 0) > 0.85 then 'trop-facile'
      when q.reussites::numeric / nullif(q.vues, 0) < 0.40 then 'trop-difficile'
    end
  from question q
  join question_texte qt on qt.question_id = q.id and qt.langue = p_langue
  join categorie_texte ct on ct.categorie_id = q.categorie_id and ct.langue = p_langue
  where est_editeur()
    and q.vues >= p_echantillon
    and (
      (q.reussites::numeric / nullif(q.vues, 0) > 0.85 and q.difficulte >= 4) or
      (q.reussites::numeric / nullif(q.vues, 0) < 0.40 and q.difficulte <= 2)
    )
  order by abs(q.reussites::numeric / nullif(q.vues, 0) - 0.625) desc
  limit p_limite;
$$;

-- Changer la difficulté remet les compteurs à zéro : l'échantillon d'avant
-- portait sur l'ancien classement, le conserver fausserait la mesure
-- suivante.
create or replace function recalibrer(p_question_id text, p_difficulte smallint)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not est_editeur() then
    raise exception 'Droits insuffisants' using errcode = '42501';
  end if;
  if p_difficulte not between 1 and 5 then
    raise exception 'Difficulté hors bornes';
  end if;

  update question
     set difficulte = p_difficulte, vues = 0, reussites = 0, modifie_le = now()
   where id = p_question_id;
end;
$$;

-- -------------------------------------------------------------------------
-- Enregistrement d'une traduction.
--
-- L'index de la bonne réponse est PARTAGÉ entre toutes les langues : cette
-- fonction impose que le nombre de propositions reste identique à celui de
-- la langue de référence. Un traducteur qui en ajoute ou en retire casserait
-- la justesse dans toutes les langues à la fois.
-- -------------------------------------------------------------------------
create or replace function enregistrer_traduction(
  p_question_id text,
  p_langue      text,
  p_enonce      text,
  p_reponses    jsonb,
  p_explication text default null,
  p_source_url  text default null,
  p_source_titre text default null,
  p_sous_categorie text default null,
  p_image_alt   text default null,
  p_statut      text default 'brouillon'
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_reference int;
begin
  if not est_editeur() then
    raise exception 'Droits insuffisants' using errcode = '42501';
  end if;

  select jsonb_array_length(reponses) into v_reference
  from question_texte
  where question_id = p_question_id
    and langue = (select code from langue where defaut limit 1);

  if v_reference is not null and jsonb_array_length(p_reponses) <> v_reference then
    return jsonb_build_object('ok', false, 'motif', 'nombre_de_reponses',
      'attendu', v_reference, 'recu', jsonb_array_length(p_reponses));
  end if;

  if p_statut = 'valide' and (p_source_url is null or p_source_url = '') then
    return jsonb_build_object('ok', false, 'motif', 'source_obligatoire');
  end if;

  insert into question_texte (question_id, langue, enonce, reponses, explication,
    source_url, source_titre, sous_categorie, image_alt, statut,
    traduit_par, traduit_le, modifie_le)
  values (p_question_id, p_langue, p_enonce, p_reponses, p_explication,
    p_source_url, p_source_titre, p_sous_categorie, p_image_alt,
    p_statut::question_statut, auth.uid(), now(), now())
  on conflict (question_id, langue) do update set
    enonce = excluded.enonce, reponses = excluded.reponses,
    explication = excluded.explication, source_url = excluded.source_url,
    source_titre = excluded.source_titre, sous_categorie = excluded.sous_categorie,
    image_alt = excluded.image_alt, statut = excluded.statut,
    traduit_par = auth.uid(), modifie_le = now();

  return jsonb_build_object('ok', true);
end;
$$;

-- -------------------------------------------------------------------------
-- Tableau de bord éditorial.
-- -------------------------------------------------------------------------
create or replace function stats_editoriales(p_langue text default 'fr')
returns jsonb
language sql stable security definer set search_path = public as $$
  select case when not est_editeur() then null else jsonb_build_object(
    'questions_totales',  (select count(*) from question),
    'questions_validees', (select count(*) from question where statut = 'valide'),
    'sans_image_alt',     (select count(*) from question q
                            join question_texte qt on qt.question_id = q.id
                           where q.image_id is not null
                             and (qt.image_alt is null or qt.image_alt = '')),
    'a_recalibrer',       (select count(*) from questions_a_recalibrer(p_langue)),
    'completude',         (select coalesce(jsonb_agg(jsonb_build_object(
                             'categorie_id', c.categorie_id,
                             'libelle', ct.libelle,
                             'langue', c.langue,
                             'traduites', c.questions_traduites,
                             'totales', c.questions_totales,
                             'pourcentage', c.pourcentage) order by ct.libelle), '[]'::jsonb)
                           from completude_traduction c
                           join categorie_texte ct
                             on ct.categorie_id = c.categorie_id and ct.langue = p_langue),
    'quiz_sous_seuil',    (select coalesce(jsonb_agg(jsonb_build_object(
                             'id', qs.id, 'titre', qs.titre,
                             'nb', quiz_special_nb_questions(qs.*))), '[]'::jsonb)
                           from quiz_special qs
                           where quiz_special_nb_questions(qs.*) < qs.seuil_min)
  ) end;
$$;

grant execute on function questions_a_recalibrer, recalibrer,
                          enregistrer_traduction, stats_editoriales
  to authenticated;

commit;

-- =========================================================================
-- AMORÇAGE : à exécuter une fois, en remplaçant l'adresse.
--
--   update profil set role = 'admin'
--    where id = (select id from auth.users where email = 'ton@email.fr');
--
-- Il n'y a volontairement aucun moyen de se donner ce rôle depuis
-- l'application.
-- =========================================================================
