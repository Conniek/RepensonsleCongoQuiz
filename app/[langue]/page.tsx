import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue, LANGUE_PAR_DEFAUT } from "@/lib/i18n";
import Progression from "./progression";
import CategoriesAccueil, { type Categorie } from "./categories-accueil";

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
  const { data, error } = await supabase
    .from("categorie_publique")
    .select("categorie_id, libelle, slug, nb_questions, produit_requis")
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
  /* L'accueil ne montre que les thèmes ouverts : un thème payant sans
     cadenas serait un piège. Les verrouillés vivent sur la page Quiz, qui
     sait les griser et expliquer la condition. */
  const jouables = toutes.filter(
    (c) => c.nb_questions >= 7 && c.produit_requis == null
  );
  const total = jouables.reduce((s, c) => s + c.nb_questions, 0);

  return (
    <>
      {/* Phrase d'orientation : masquée à l'œil, mais bien présente pour les
          moteurs et les lecteurs d'écran. Elle sera reprise visuellement sur
          l'écran d'accueil de première visite. */}
      <p className="visuellement-masque">
        {t.marque.presentation(total, jouables.length)}
      </p>

      {langue !== LANGUE_PAR_DEFAUT && jouables.length < toutes.length && (
        <p className="note">{t.disponibilite.banniereLangue}</p>
      )}

      {/* La salutation sert de titre de page : elle remplace le logo, et
          réutilise les données déjà chargées par la progression plutôt que
          de rappeler la même RPC une seconde fois. */}
      <Progression langue={langue} avecSalutation />

      {jouables.length === 0 ? (
        <p>{t.disponibilite.aucuneCategorie}</p>
      ) : (
        <CategoriesAccueil langue={langue} categories={jouables} total={jouables.length} />
      )}
    </>
  );
}
