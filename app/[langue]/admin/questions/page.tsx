import { notFound } from "next/navigation";
import ListeQuestions from "./liste";
import { dictionnaire, estLangue } from "@/lib/i18n";
import { creerClientServeur } from "@/lib/supabase/serveur";

export const dynamic = "force-dynamic";

export default async function PageQuestions({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  const supabase = await creerClientServeur();
  const { data: categories } = await supabase
    .from("categorie_texte").select("categorie_id, libelle")
    .eq("langue", langue).order("libelle");

  return (
    <>
      <h1 tabIndex={-1}>{t.admin.questions}</h1>
      <ListeQuestions langue={langue} categories={categories ?? []} />
    </>
  );
}
