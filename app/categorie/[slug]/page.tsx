import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { slugifier, type Niveau } from "@/lib/slug";
import Niveaux from "./niveaux";

// Rendu serveur : la page arrive au robot déjà remplie. L'état de
// déblocage, qui dépend de la session, est chargé côté client ensuite.
export const revalidate = 300;

type Categorie = {
  categorie: string;
  nb_questions: number;
  nb_facile: number;
  nb_moyen: number;
  nb_difficile: number;
};

async function trouverCategorie(slug: string) {
  const supabase = await creerClientServeur();
  const { data } = await supabase.from("categorie_publique").select("*");
  return (data as Categorie[] | null)?.find(
    (c) => slugifier(c.categorie) === slug
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await trouverCategorie(slug);
  if (!c) return {};
  return {
    title: c.categorie,
    description: `${c.nb_questions} questions sur ${c.categorie} en République démocratique du Congo, réparties en trois niveaux de difficulté.`,
  };
}

export default async function PageCategorie({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categorie = await trouverCategorie(slug);
  if (!categorie) notFound();

  const dispo: Record<Niveau, number> = {
    facile: categorie.nb_facile,
    moyen: categorie.nb_moyen,
    difficile: categorie.nb_difficile,
  };

  return (
    <>
      <nav aria-label="Fil d’Ariane">
        <ol className="ariane">
          <li>
            <Link href="/">Accueil</Link>
          </li>
          <li aria-current="page">{categorie.categorie}</li>
        </ol>
      </nav>

      <h1 tabIndex={-1}>{categorie.categorie}</h1>
      <p>{categorie.nb_questions} questions réparties en trois niveaux.</p>

      <section aria-labelledby="titre-niveaux">
        <h2 id="titre-niveaux">Choisis ton niveau</h2>
        <Niveaux categorie={categorie.categorie} dispo={dispo} />
      </section>

      <section aria-labelledby="titre-regles">
        <h2 id="titre-regles">Comment gagner une étoile</h2>
        <p>
          Une partie compte sept questions. Pour la remporter il faut atteindre
          900 points et au moins cinq bonnes réponses sur sept. Chaque victoire
          rapporte une étoile, deux par niveau, et deux étoiles débloquent le
          niveau suivant.
        </p>
      </section>
    </>
  );
}
