-- =========================================================================
-- Ce que le client a le droit de voir, et par ou il passe.
--
-- PRINCIPE : la table question n'est PAS exposee a l'API. Sinon n'importe
-- qui lit bonne_reponse depuis la console du navigateur. Postgres ne fait
-- pas de securite au niveau colonne : on passe donc par une vue sans la
-- reponse, et par des fonctions serveur pour jouer.
-- =========================================================================

revoke all on question from anon, authenticated;

-- Vue publique : tout sauf la reponse et l'explication.
create view question_publique
with (security_invoker = false) as
select id, type, categorie, sous_categorie, enonce, reponses,
       image_id, image_alt, difficulte, langue, campagne_id
from question
where statut = 'valide';

grant select on question_publique to anon, authenticated;

-- -------------------------------------------------------------------------
-- Composition du deck, cote serveur.
--
-- Garantit qu'aucune combinaison categorie x niveau ne peut echouer : si le
-- pool est insuffisant, on complete avec les difficultes voisines de la
-- meme categorie et on le signale. Trois categories sont concernees
-- aujourd'hui : Langues & proverbes, Nature & environnement, Economie.
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
    -- Repli : meme categorie, difficulte la plus proche d'abord.
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

-- -------------------------------------------------------------------------
-- Validation d'une reponse, cote serveur.
-- Le client envoie son choix, le serveur dit si c'est juste et renvoie
-- l'explication et la source. La bonne reponse ne circule qu'apres coup.
-- -------------------------------------------------------------------------
create or replace function valider_reponse(
  p_partie_id   uuid,
  p_position    smallint,
  p_choix       smallint,
  p_duree_ms    integer
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_partie   partie;
  v_qid      text;
  v_q        question;
  v_correcte boolean;
  v_points   integer := 0;
  v_bonus    integer := 0;
begin
  select * into v_partie from partie where id = p_partie_id;
  if v_partie.id is null then
    raise exception 'Partie introuvable';
  end if;
  if v_partie.utilisateur_id <> auth.uid() then
    raise exception 'Cette partie ne vous appartient pas';
  end if;
  if v_partie.statut <> 'en_cours' then
    raise exception 'Cette partie est terminee';
  end if;

  v_qid := v_partie.deck[p_position + 1];
  select * into v_q from question where id = v_qid;

  v_correcte := (p_choix is not null and p_choix = v_q.bonne_reponse);

  if v_correcte then
    v_points := 125;
    -- Bonus de rapidite uniquement si le chronometre etait actif : une
    -- partie sans chrono reste valide mais ne le rapporte pas.
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
    'bonne_reponse', v_q.bonne_reponse,
    'explication',   v_q.explication,
    'source_url',    v_q.source_url,
    'source_titre',  v_q.source_titre,
    'points',        v_points + v_bonus
  );
end;
$$;

-- -------------------------------------------------------------------------
-- Pack hors ligne.
--
-- Contient les bonnes reponses, puisque le §19 exige de jouer sans reseau.
-- ARBITRAGE ASSUME : ce pack est lisible par un utilisateur determine. Il
-- est donc reserve au SOLO. Les modes competitifs passent obligatoirement
-- par composer_deck et valider_reponse.
-- -------------------------------------------------------------------------
create or replace function pack_hors_ligne(p_categorie text)
returns setof question
language sql stable security definer set search_path = public as $$
  select * from question
  where categorie = p_categorie and statut = 'valide' and type = 'qcm';
$$;

grant execute on function composer_deck, valider_reponse, pack_hors_ligne
  to anon, authenticated;
