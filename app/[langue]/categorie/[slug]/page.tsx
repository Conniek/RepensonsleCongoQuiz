import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue, LANGUES } from "@/lib/i18n";
import Niveaux from "./niveaux";
import { Verrou } from "../../pictos";

/* Les droits du visiteur décident de ce qui s'affiche : pas de cache
   partagé entre abonnés et non-abonnés. */
export const dynamic = "force-dynamic";

type Categorie = {
  categorie_id: string; libelle: string; slug: string;
  nb_questions: number; nb_facile: number; nb_moyen: number; nb_difficile: number;
};

async function trouver(langue: string, slug: string) {
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("categorie_publique").select("*")
    .eq("langue", langue).eq("slug", slug).maybeSingle();
  return data as Categorie | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ langue: string; slug: string }>;
}) {
  const { langue, slug } = await params;
  if (!estLangue(langue)) return {};
  const c = await trouver(langue, slug);
  if (!c) return {};
  const t = dictionnaire(langue);

  // Les slugs diffèrent par langue : les alternates sont donc résolus
  // depuis la base, pas devinés.
  const supabase = await creerClientServeur();
  const { data: tous } = await supabase
    .from("categorie_publique").select("langue, slug")
    .eq("categorie_id", c.categorie_id);

  return {
    title: c.libelle,
    description: t.categorie.descriptionMeta(c.nb_questions, c.libelle),
    alternates: {
      canonical: `/${langue}/categorie/${c.slug}`,
      languages: Object.fromEntries(
        (tous ?? [])
          .filter((x) => LANGUES.includes(x.langue))
          .map((x) => [x.langue, `/${x.langue}/categorie/${x.slug}`])
      ),
    },
  };
}

export default async function PageCategorie({
  params,
}: {
  params: Promise<{ langue: string; slug: string }>;
}) {
  const { langue, slug } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);
  const categorie = await trouver(langue, slug);
  if (!categorie) notFound();

  const jouable = categorie.nb_questions >= 7;

  /* Reflet des droits, pour expliquer plutôt que laisser buter : la partie
     serait refusée par composer_deck, autant le dire avant. */
  const { data: mesDroits } = await (await creerClientServeur()).rpc("mes_droits");
  const droits = ((mesDroits ?? []) as { produit: string }[]).map((d) => d.produit);
  const produit = categorie.produit_requis as string | null;
  const ouvert =
    produit == null ||
    droits.includes(produit) ||
    (produit.startsWith("langue_") && droits.includes("pack_langues"));

  return (
    <>
      <nav aria-label={t.navigation.filAriane}>
        <ol className="ariane">
          <li><Link href={`/${langue}`}>{t.navigation.accueil}</Link></li>
          <li aria-current="page">{categorie.libelle}</li>
        </ol>
      </nav>

      <h1 tabIndex={-1}>{categorie.libelle}</h1>
      <p>{t.categorie.intro(categorie.nb_questions)}</p>

      {!ouvert ? (
        <section aria-labelledby="titre-verrou" className="bloc-verrou">
          <h2 id="titre-verrou">{t.quizHub.verrouille}</h2>
          <p className="theme-condition">
            <Verrou taille={16} />
            {t.quizHub.inclusDans(
              produit === "plus" ? t.quizHub.offrePlus : t.quizHub.offreLangue
            )}
          </p>
          <p>
            <Link className="action" href={`/${langue}/offres?produit=${produit}`}>
              {t.quizHub.debloquerTheme(categorie.libelle)}
            </Link>
          </p>
        </section>
      ) : !jouable ? (
        <p role="status">{t.disponibilite.categorieIndisponible}</p>
      ) : (
        <section aria-labelledby="titre-niveaux">
          <h2 id="titre-niveaux">{t.categorie.titreNiveaux}</h2>
          <Niveaux
            langue={langue}
            categorieId={categorie.categorie_id}
            libelle={categorie.libelle}
          />
        </section>
      )}

      <section aria-labelledby="titre-regles">
        <h2 id="titre-regles">{t.categorie.titreRegles}</h2>
        <p>{t.categorie.regles}</p>
      </section>
    </>
  );
}
