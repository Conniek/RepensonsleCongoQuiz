import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { estLangue } from "@/lib/i18n";
import type { CategorieSource } from "@/lib/vues";
import AccueilEcran from "./accueil-ecran";

export const revalidate = 300;

export default async function Accueil({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();

  /* Le catalogue vient du serveur : la page s'affiche et s'indexe sans
     attendre la session. La progression se superpose après montage. */
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("categorie_publique")
    .select("categorie_id, libelle, slug, nb_questions, produit_requis, illustration")
    .eq("langue", langue)
    .order("libelle");

  const categories = ((data ?? []) as CategorieSource[]).filter(
    (c) => c.nb_questions >= 7
  );

  return <AccueilEcran langue={langue} categories={categories} />;
}
