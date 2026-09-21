import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue, LANGUE_PAR_DEFAUT } from "@/lib/i18n";
import Greeting from "../greeting";
import Progression from "../progression";
import CategoriesAccueil, { type Categorie } from "../categories-accueil";
import Offres from "../offres";

export const revalidate = 300;

export default async function Accueil({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  const supabase = await creerClientServeur();
  
  // Charger les catégories
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categorie_publique")
    .select("categorie_id, libelle, slug, nb_questions")
    .eq("langue", langue)
    .order("libelle");

  if (categoriesError) {
    return (
      <>
        <h1>{t.marque.nom}</h1>
        <p role="alert">{t.accueil.erreurCategories}</p>
      </>
    );
  }

  // Charger les données utilisateur (pseudo et XP) — optionnel si anonyme
  let userPseudo: string | null = null;
  let userXp = 0;
  
  const { data: userData } = await supabase.rpc("progression", {
    p_langue: langue,
  });
  
  if (userData) {
    userPseudo = userData.pseudo || null;
    userXp = userData.xp || 0;
  }

  const toutes = (categoriesData ?? []) as Categorie[];
  const jouables = toutes.filter((c) => c.nb_questions >= 7);
  const total = jouables.reduce((s, c) => s + c.nb_questions, 0);

  return (
    <>
      {/* Phrase d'orientation : masquée à l'œil, mais bien présente pour les
          moteurs et les lecteurs d'écran. Elle sera reprise visuellement sur
          l'écran d'accueil de première visite. */}
      <p className="visuellement-masque">
        {t.marque.presentation(total, jouables.length)}
      </p>

      {/* Greeting avec avatar + pseudo + points */}
      <Greeting langue={langue} pseudo={userPseudo} xp={userXp} />

      {langue !== LANGUE_PAR_DEFAUT && jouables.length < toutes.length && (
        <p className="note">{t.disponibilite.banniereLangue}</p>
      )}

      <Progression langue={langue} />

      {jouables.length === 0 ? (
        <p>{t.disponibilite.aucuneCategorie}</p>
      ) : (
        <CategoriesAccueil langue={langue} categories={jouables} total={jouables.length} />
      )}

      <Offres langue={langue} questions={total} categories={jouables.length} />
    </>
  );
}
