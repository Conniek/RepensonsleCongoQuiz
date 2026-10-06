create or replace function resultat_reponses_correctes(p_partie_id uuid)
returns table (position smallint, bonne_reponse smallint)
language sql
stable
security definer
set search_path = public
as $$
  select r.position, q.bonne_reponse
  from partie p
  join reponse r on r.partie_id = p.id
  join question q on q.id = r.question_id
  where p.id = p_partie_id
    and p.utilisateur_id = auth.uid()
    and p.statut = 'terminee';
$$;

revoke all on function resultat_reponses_correctes(uuid) from public, anon;
grant execute on function resultat_reponses_correctes(uuid) to authenticated;
