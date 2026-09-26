import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue } from "@/lib/i18n";
import { Verrou } from "../pictos";

/* Cette page dépend des droits du visiteur : pas de cache partagé, sinon la
   version mise en cache pour un abonné s'afficherait aux autres. */
export const dynamic = "force-dynamic";

type Categorie = {
  categorie_id: string; libelle: string; slug: string; nb_questions: number;
  produit_requis: string | null;
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
    .select("categorie_id, libelle, slug, nb_questions, produit_requis")
    .eq("langue", langue)
    .order("libelle");

  /* Les droits du visiteur, pour savoir quoi griser. Ce n'est qu'un reflet :
     composer_deck refuse de toute façon une catégorie non acquise. */
  const { data: mesDroits } = await supabase.rpc("mes_droits");
  const droits = ((mesDroits ?? []) as { produit: string }[]).map((d) => d.produit);
  const accessible = (produit: string | null) =>
    produit === null ||
    droits.includes(produit) ||
    (produit.startsWith("langue_") && droits.includes("pack_langues"));

  const jouables = ((data ?? []) as Categorie[]).filter((c) => c.nb_questions >= 7);

  return (
    <>
      <nav aria-label={t.navigation.filAriane}>
        <ol className="ariane">
          <li><Link href={`/${langue}`}>{t.navigation.accueil}</Link></li>
          <li aria-current="page">{t.accueil.titreToutesCategories}</li>
        </ol>
      </nav>

      <h1 tabIndex={-1}>{t.accueil.titreToutesCategories}</h1>

      <ul className="cartes">
        {jouables.map((c) => {
          const ouvert = accessible(c.produit_requis);
          const offre = c.produit_requis === "plus"
            ? t.quizHub.offrePlus : t.quizHub.offreLangue;

          return (
            <li key={c.categorie_id} className={ouvert ? undefined : "carte-verrouillee"}>
              <div className="carte-visuel" aria-hidden="true" />
              <h2>
                {/* Verrouillée, la carte mène à l'offre plutôt qu'à une
                    partie qui serait refusée : l'impasse devient une
                    explication. Elle reste annoncée, jamais masquée. */}
                <Link href={ouvert
                  ? `/${langue}/categorie/${c.slug}`
                  : `/${langue}/offres?produit=${c.produit_requis}`}>
                  {c.libelle}
                  {!ouvert && (
                    <span className="visuellement-masque">
                      , {t.quizHub.verrouille}. {t.quizHub.debloquerTheme(c.libelle)}
                    </span>
                  )}
                </Link>
              </h2>
              {ouvert ? (
                <p className="carte-compte">{t.accueil.nbQuestions(c.nb_questions)}</p>
              ) : (
                <p className="theme-condition">
                  <Verrou taille={16} />
                  {t.quizHub.inclusDans(offre)}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
