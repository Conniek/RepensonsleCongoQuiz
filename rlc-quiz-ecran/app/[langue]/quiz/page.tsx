import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue } from "@/lib/i18n";
import type { CategorieSource } from "@/lib/vues";
import QuizEcran from "./quiz-ecran";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  return { title: dictionnaire(langue).quizHub.titre };
}

export default async function PageQuiz({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();

  /* Le catalogue est rendu côté serveur : il est donc indexable et s'affiche
     sans attendre. La progression personnelle et les droits se superposent
     après montage, parce qu'ils dépendent de la session. */
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("categorie_publique")
    .select("categorie_id, libelle, slug, nb_questions, produit_requis, illustration")
    .eq("langue", langue)
    .order("libelle");

  const categories = ((data ?? []) as CategorieSource[]).filter(
    (c) => c.nb_questions >= 7
  );

  return <QuizEcran langue={langue} categories={categories} />;
}
