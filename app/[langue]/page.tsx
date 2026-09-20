import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue, LANGUE_PAR_DEFAUT } from "@/lib/i18n";
import Progression from "./progression";
import Offres from "./offres";

export const revalidate = 300;

type Categorie = {
  categorie_id: string; libelle: string; slug: string; nb_questions: number;
};

export default async function Accueil({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  const supabase = await creerClientServeur();
  const { data, error } = await supabase
    .from("categorie_publique")
    .select("categorie_id, libelle, slug, nb_questions")
    .eq("langue", langue)
    .order("libelle");

  if (error) {
    return (
      <>
        <h1>{t.marque.nom}</h1>
        <p role="alert">{t.accueil.erreurCategories}</p>
      </>
    );
  }

  const toutes = (data ?? []) as Categorie[];
  const jouables = toutes.filter((c) => c.nb_questions >= 7);
  const total = jouables.reduce((s, c) => s + c.nb_questions, 0);

  return (
    <>
      <h1 tabIndex={-1}>{t.marque.nom}</h1>
      <p>{t.marque.slogan}</p>
      <p>{t.marque.presentation(total, jouables.length)}</p>

      {langue !== LANGUE_PAR_DEFAUT && jouables.length < toutes.length && (
        <p className="note">{t.disponibilite.banniereLangue}</p>
      )}

      <Progression langue={langue} />

      {/* Rappel des règles : pour le nouveau venu qui ne sait pas encore ce
          qu'il va faire. */}
      <section className="regles" aria-labelledby="titre-regles">
        <h2 id="titre-regles" className="visuellement-masque">{t.regles.titre}</h2>
        <p>{t.regles.texte}</p>
      </section>

      <section id="categories" aria-labelledby="titre-categories">
        <h2 id="titre-categories">{t.accueil.titreCategories}</h2>
        {jouables.length === 0 ? (
          <p>{t.disponibilite.aucuneCategorie}</p>
        ) : (
          <ul className="cartes">
            {jouables.map((c) => (
              <li key={c.categorie_id}>
                <h3>
                  <Link href={`/${langue}/categorie/${c.slug}`}>{c.libelle}</Link>
                </h3>
                <p>{t.accueil.nbQuestions(c.nb_questions)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Offres langue={langue} questions={total} categories={jouables.length} />
    </>
  );
}
