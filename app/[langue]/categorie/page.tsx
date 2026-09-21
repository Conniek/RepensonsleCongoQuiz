import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue } from "@/lib/i18n";

export const revalidate = 300;

type Categorie = {
  categorie_id: string; libelle: string; slug: string; nb_questions: number;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  return { title: dictionnaire(langue).accueil.titreToutesCategories };
}

export default async function PageCategories({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("categorie_publique")
    .select("categorie_id, libelle, slug, nb_questions")
    .eq("langue", langue)
    .order("libelle");

  const jouables = ((data ?? []) as Categorie[]).filter((c) => c.nb_questions >= 7);

  return (
    <>
      <nav aria-label={t.navigation.filAriane}>
        <ol className="ariane">
          <li><Link href={`/${langue}/home`}>{t.navigation.accueil}</Link></li>
          <li aria-current="page">{t.accueil.titreToutesCategories}</li>
        </ol>
      </nav>

      <h1 tabIndex={-1}>{t.accueil.titreToutesCategories}</h1>

      <ul className="cartes">
        {jouables.map((c) => (
          <li key={c.categorie_id}>
            <div className="carte-visuel" aria-hidden="true" />
            <h2>
              <Link href={`/${langue}/categorie/${c.slug}`}>{c.libelle}</Link>
            </h2>
            <p className="carte-compte">{t.accueil.nbQuestions(c.nb_questions)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
