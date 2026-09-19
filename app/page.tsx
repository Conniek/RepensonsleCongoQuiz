import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { slugifier } from "@/lib/slug";

// Rendu serveur : la page arrive au robot déjà remplie.
export const revalidate = 300;

type Categorie = {
  categorie: string;
  nb_questions: number;
  nb_facile: number;
  nb_moyen: number;
  nb_difficile: number;
};

export default async function Accueil() {
  const supabase = await creerClientServeur();
  const { data, error } = await supabase
    .from("categorie_publique")
    .select("*")
    .order("categorie");

  if (error) {
    return (
      <>
        <h1>Repensons le Congo Quiz</h1>
        <p role="alert">
          Les catégories n’ont pas pu être chargées. Réessaie dans un instant.
        </p>
      </>
    );
  }

  const categories = (data ?? []) as Categorie[];
  const total = categories.reduce((s, c) => s + c.nb_questions, 0);

  return (
    <>
      <h1 tabIndex={-1}>Repensons le Congo Quiz</h1>
      <p>Un grand pays, mille histoires. Joue, apprends et célèbre le Congo.</p>

      {/* Phrase d'orientation : elle sert à la fois au lecteur d'écran, au
          moteur de recherche et au modèle de langage. */}
      <p>
        Repensons le Congo Quiz est une application gratuite de culture générale
        sur la République démocratique du Congo. Elle réunit {total} questions
        réparties en {categories.length} catégories, chacune accompagnée d’une
        explication et d’un lien vers sa source.
      </p>

      {/* aria-labelledby fait de cette section une région : elle apparaît
          alors dans le rotor du lecteur d'écran. */}
      <section id="categories" aria-labelledby="titre-categories">
        <h2 id="titre-categories">Les catégories</h2>
        <ul className="cartes">
          {categories.map((c) => (
            <li key={c.categorie}>
              <h3>
                <Link href={`/categorie/${slugifier(c.categorie)}`}>
                  {c.categorie}
                </Link>
              </h3>
              <p>{c.nb_questions} questions.</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
