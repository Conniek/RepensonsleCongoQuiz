import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { slugifier, type Niveau } from "@/lib/slug";
import { dictionnaire } from "@/lib/i18n";
import Niveaux from "./niveaux";

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
  const t = dictionnaire();
  return {
    title: c.categorie,
    description: t.categorie.descriptionMeta(c.nb_questions, c.categorie),
  };
}

export default async function PageCategorie({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = dictionnaire();
  const categorie = await trouverCategorie(slug);
  if (!categorie) notFound();

  const dispo: Record<Niveau, number> = {
    facile: categorie.nb_facile,
    moyen: categorie.nb_moyen,
    difficile: categorie.nb_difficile,
  };

  return (
    <>
      <nav aria-label={t.navigation.filAriane}>
        <ol className="ariane">
          <li><Link href="/">{t.navigation.accueil}</Link></li>
          <li aria-current="page">{categorie.categorie}</li>
        </ol>
      </nav>

      <h1 tabIndex={-1}>{categorie.categorie}</h1>
      <p>{t.categorie.intro(categorie.nb_questions)}</p>

      <section aria-labelledby="titre-niveaux">
        <h2 id="titre-niveaux">{t.categorie.titreNiveaux}</h2>
        <Niveaux categorie={categorie.categorie} dispo={dispo} />
      </section>

      <section aria-labelledby="titre-regles">
        <h2 id="titre-regles">{t.categorie.titreRegles}</h2>
        <p>{t.categorie.regles}</p>
      </section>
    </>
  );
}
