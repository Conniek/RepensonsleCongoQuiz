import Link from "next/link";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { slugifier } from "@/lib/slug";
import { dictionnaire } from "@/lib/i18n";
import Progression from "./progression";

export const revalidate = 300;

type Categorie = { categorie: string; nb_questions: number };

export default async function Accueil() {
  const t = dictionnaire();
  const supabase = await creerClientServeur();
  const { data, error } = await supabase
    .from("categorie_publique")
    .select("*")
    .order("categorie");

  if (error) {
    return (
      <>
        <h1>{t.marque.nom}</h1>
        <p role="alert">{t.accueil.erreurCategories}</p>
      </>
    );
  }

  const categories = (data ?? []) as Categorie[];
  const total = categories.reduce((s, c) => s + c.nb_questions, 0);

  return (
    <>
      <h1 tabIndex={-1}>{t.marque.nom}</h1>
      <p>{t.marque.slogan}</p>
      <p>{t.marque.presentation(total, categories.length)}</p>

      <Progression />

      <section id="categories" aria-labelledby="titre-categories">
        <h2 id="titre-categories">{t.accueil.titreCategories}</h2>
        <ul className="cartes">
          {categories.map((c) => (
            <li key={c.categorie}>
              <h3>
                <Link href={`/categorie/${slugifier(c.categorie)}`}>
                  {c.categorie}
                </Link>
              </h3>
              <p>{t.accueil.nbQuestions(c.nb_questions)}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
