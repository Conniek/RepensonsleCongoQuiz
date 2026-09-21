import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue } from "@/lib/i18n";
import QuizHub, { type Theme } from "./quiz-hub";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  return { title: dictionnaire(langue).quizHub?.titre };
}

export default async function PageQuiz({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();

  // Les thèmes sont rendus côté serveur : la liste est indexable, et la
  // progression personnelle se superpose après montage.
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("categorie_publique")
    .select("categorie_id, libelle, slug, nb_questions")
    .eq("langue", langue)
    .order("libelle");

  const themes = ((data ?? []) as Theme[]).filter((c) => c.nb_questions >= 7);

  return <QuizHub langue={langue} themes={themes} />;
}
