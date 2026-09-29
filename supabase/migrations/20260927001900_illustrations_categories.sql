-- =========================================================================
-- Illustrations de categories.
--
-- Deux sources, dans cet ordre :
--   1. categorie.illustration  -> fichier televerse depuis le back-office
--   2. /images/categories/<slug>.avif -> fichier livre avec le code
-- La colonne prime quand elle est renseignee. Sans elle, le composant tente
-- le fichier statique, et si celui-ci n'existe pas, l'aplat de couleur reste
-- visible dessous : aucune carte ne se retrouve vide.
--
-- Pourquoi les deux : le fichier statique demande un deploiement, ce qui
-- convient aux 12 categories de depart ; la colonne rend l'equipe editoriale
-- autonome pour la suite, sans passer par un developpeur.
-- =========================================================================

begin;

-- -------------------------------------------------------------------------
-- La colonne stocke un CHEMIN dans le bucket, pas une URL complete : si le
-- domaine de stockage change un jour, rien a reecrire en base.
-- -------------------------------------------------------------------------
alter table categorie add column if not exists illustration text
  check (illustration is null or illustration ~ '^[A-Za-z0-9._/-]+$');

comment on column categorie.illustration is
  'Chemin dans le bucket "categories" (ex : histoire-1727.avif). NULL = on '
  'retombe sur /images/categories/<slug>.avif livre avec le code.';

-- -------------------------------------------------------------------------
-- La vue publique expose l'illustration. On reprend la definition complete :
-- une vue ne se modifie pas par morceaux.
-- -------------------------------------------------------------------------
drop view if exists categorie_publique cascade;

create view categorie_publique
with (security_invoker = false) as
select
  c.id                                                       as categorie_id,
  ct.langue,
  ct.libelle,
  ct.slug,
  c.ordre,
  c.produit_requis,
  c.illustration,
  count(qt.question_id)::int                                 as nb_questions,
  count(qt.question_id) filter (where q.difficulte between 1 and 2)::int as nb_facile,
  count(qt.question_id) filter (where q.difficulte = 3)::int            as nb_moyen,
  count(qt.question_id) filter (where q.difficulte between 4 and 5)::int as nb_difficile
from categorie c
join categorie_texte ct on ct.categorie_id = c.id
left join question q
       on q.categorie_id = c.id and q.statut = 'valide' and q.type = 'qcm'
left join question_texte qt
       on qt.question_id = q.id and qt.langue = ct.langue and qt.statut = 'valide'
where c.actif
group by c.id, ct.langue, ct.libelle, ct.slug, c.ordre, c.produit_requis,
         c.illustration;

grant select on categorie_publique to anon, authenticated;

-- -------------------------------------------------------------------------
-- Les editeurs peuvent mettre a jour une categorie (libelle, illustration,
-- produit requis). La lecture publique reste regie par la politique
-- existante, qui ne montre que les categories actives.
-- -------------------------------------------------------------------------
drop policy if exists "categories modifiables par editeur" on categorie;
create policy "categories modifiables par editeur" on categorie
  for update to authenticated using (est_editeur()) with check (est_editeur());

-- -------------------------------------------------------------------------
-- Bucket de stockage. Public en LECTURE : une illustration de categorie n'a
-- rien de confidentiel, et un bucket public se met en cache par le CDN, donc
-- l'image ne repasse pas par le serveur a chaque affichage.
-- L'ECRITURE reste reservee aux editeurs.
-- -------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('categories', 'categories', true, 512000,
        array['image/avif', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 512000,           -- 500 ko : au-dela, c'est une photo
      allowed_mime_types = array['image/avif', 'image/webp'];

drop policy if exists "illustrations lisibles" on storage.objects;
create policy "illustrations lisibles" on storage.objects
  for select using (bucket_id = 'categories');

drop policy if exists "illustrations deposees par editeur" on storage.objects;
create policy "illustrations deposees par editeur" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'categories' and est_editeur());

drop policy if exists "illustrations remplacees par editeur" on storage.objects;
create policy "illustrations remplacees par editeur" on storage.objects
  for update to authenticated
  using (bucket_id = 'categories' and est_editeur())
  with check (bucket_id = 'categories' and est_editeur());

drop policy if exists "illustrations supprimees par editeur" on storage.objects;
create policy "illustrations supprimees par editeur" on storage.objects
  for delete to authenticated
  using (bucket_id = 'categories' and est_editeur());

commit;
