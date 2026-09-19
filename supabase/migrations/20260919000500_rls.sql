-- =========================================================================
-- Politiques de securite au niveau ligne.
--
-- Regle generale : le contenu editorial est lisible par tous, les donnees
-- personnelles ne sont lisibles que par leur proprietaire, et rien n'est
-- modifiable depuis le client. Les ecritures passent par les fonctions
-- ci-dessus ou par le back-office avec la cle de service.
-- =========================================================================

alter table question      enable row level security;
alter table tag           enable row level security;
alter table question_tag  enable row level security;
alter table quiz_special  enable row level security;
alter table campagne      enable row level security;
alter table profil        enable row level security;
alter table entitlement   enable row level security;
alter table maitrise      enable row level security;
alter table badge         enable row level security;
alter table badge_obtenu  enable row level security;
alter table partie        enable row level security;
alter table reponse       enable row level security;

-- --- Contenu : lecture publique, aucune ecriture depuis le client --------
create policy "tags lisibles" on tag for select using (true);
create policy "rattachements lisibles" on question_tag for select using (true);
create policy "badges lisibles" on badge for select using (true);

create policy "quiz speciaux actifs lisibles" on quiz_special
  for select using (actif = true);

create policy "campagnes actives lisibles" on campagne
  for select using (
    statut = 'active'
    and (date_debut is null or date_debut <= now())
    and (date_fin   is null or date_fin   >  now())
  );

-- question : aucune policy de select. La table reste inaccessible, seules
-- la vue question_publique et les fonctions y donnent acces.

-- --- Donnees personnelles : chacun ne voit que les siennes ---------------
create policy "mon profil lisible" on profil
  for select using (id = auth.uid());
create policy "mon profil modifiable" on profil
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "mes droits lisibles" on entitlement
  for select using (utilisateur_id = auth.uid());
-- Aucune policy d'insertion : seuls les webhooks Stripe, avec la cle de
-- service, creent un entitlement. C'est le point le plus sensible du
-- schema.

create policy "ma maitrise lisible" on maitrise
  for select using (utilisateur_id = auth.uid());

create policy "mes badges lisibles" on badge_obtenu
  for select using (utilisateur_id = auth.uid());

-- --- Parties : les miennes, et celles ou je suis l'adversaire ------------
create policy "mes parties lisibles" on partie
  for select using (utilisateur_id = auth.uid() or adversaire_id = auth.uid());
create policy "creer mes parties" on partie
  for insert with check (utilisateur_id = auth.uid());

create policy "mes reponses lisibles" on reponse
  for select using (
    exists (select 1 from partie p
            where p.id = reponse.partie_id
              and (p.utilisateur_id = auth.uid() or p.adversaire_id = auth.uid()))
  );
-- Aucune policy d'insertion sur reponse : tout passe par valider_reponse,
-- sinon le client pourrait s'attribuer des points.
