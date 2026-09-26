import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionnaire, estLangue } from "@/lib/i18n";
import "./offres.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  return { title: dictionnaire(langue).offres.titre };
}

export default async function PageOffres({
  params,
  searchParams,
}: {
  params: Promise<{ langue: string }>;
  searchParams: Promise<{ produit?: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const { produit } = await searchParams;
  const t = dictionnaire(langue);
  const { offres } = t;

  /* Un thème verrouillé renvoie ici avec son produit : on met en avant
     l'offre correspondante plutôt que de laisser chercher dans la page. */
  const viseePlus = produit === "plus";
  const viseeLangue = produit === "langue_lingala" || produit === "pack_langues";

  return (
    <>
      <nav aria-label={t.navigation.filAriane}>
        <ol className="ariane">
          <li><Link href={`/${langue}`}>{t.navigation.accueil}</Link></li>
          <li aria-current="page">{offres.titre}</li>
        </ol>
      </nav>

      <h1 tabIndex={-1}>{offres.titre}</h1>
      <p className="intro">{offres.intro}</p>
      <p className="independantes">{offres.independantes}</p>

      <div className="cartes-offres">
        {/* Gratuit */}
        <article className="carte-offre gratuit">
          <div className="offre-entete">
            <span className="etiquette">{offres.gratuitEtiquette}</span>
            <h2>{offres.gratuitTitre}</h2>
          </div>

          <div className="offre-contenu">
            <p className="categorie">{offres.gratuitCategorie}</p>
            <p className="description">{offres.gratuitTexte(1445, 12)}</p>

            <ul className="points">
              <li>{offres.gratuitPoint1}</li>
              <li>{offres.gratuitPoint2}</li>
              <li>{offres.gratuitPoint3}</li>
            </ul>

            <p className="note">{offres.gratuitPublicite}</p>

            <Link href={`/${langue}`} className="btn btn-primaire">
              {t.navigation.accueil}
            </Link>
          </div>
        </article>

        {/* Plus */}
        <article className={`carte-offre plus${viseePlus ? " en-avant" : ""}`}>
          {viseePlus && <p className="offre-visee">{offres.offreMiseEnAvant}</p>}
          <div className="offre-entete">
            <span className="etiquette">{offres.plusEtiquette}</span>
            <h2>{offres.plusTitre}</h2>
          </div>

          <div className="offre-contenu">
            <p className="categorie">{offres.plusCategorie}</p>
            <p className="description">{offres.plusTexte}</p>

            <ul className="points">
              <li>{offres.plusPoint1}</li>
              <li>{offres.plusPoint2}</li>
            </ul>

            <div className="prix">
              <strong>{offres.plusPrix}</strong>
              <small>{offres.plusPrixDetail}</small>
            </div>

            <button className="btn btn-secondaire" disabled>
              {offres.plusAction}
            </button>
            <p className="note">{offres.bientotDisponible} — {offres.paiementBientot}</p>
          </div>
        </article>

        {/* Langue */}
        <article className={`carte-offre langue${viseeLangue ? " en-avant" : ""}`}>
          {viseeLangue && <p className="offre-visee">{offres.offreMiseEnAvant}</p>}
          <div className="offre-entete">
            <span className="etiquette">{offres.langueBientot("Lingala")}</span>
            <h2>{offres.langueTitre}</h2>
          </div>

          <div className="offre-contenu">
            <p className="categorie">{offres.langueCategorie}</p>
            <p className="description">{offres.langueTexte}</p>

            <p className="disponible">{offres.langueDisponible}</p>

            <div className="prix">
              <strong>{offres.languePrix}</strong>
              <small>{offres.languePrixDetail}</small>
            </div>

            <button className="btn btn-secondaire" disabled>
              {offres.langueAction}
            </button>
            <p className="note">{offres.bientotDisponible} — {offres.paiementBientot}</p>
          </div>
        </article>
      </div>
    </>
  );
}