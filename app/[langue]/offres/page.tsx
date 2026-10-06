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

  const viseePlus = produit === "plus";
  const viseeLangue = produit === "langue_lingala" || produit === "pack_langues";

  return (
    <>
      <header className="offres-hero">
        <div className="brand-mark offres-brand">
          <div className="brand-mark__crest" aria-hidden="true"><span /></div>
          <h1 className="brand-mark__name">Repensons le Congo</h1>
        </div>
        <p className="offres-intro">{offres.intro}</p>
      </header>

      <section className="page-offres" aria-labelledby="titre-offres">
        <h2 id="titre-offres" className="visuellement-masque">{offres.titre}</h2>
        <div className="cartes-offres">
          <article className="carte-offre gratuit">
            <div className="offre-entete">
              <div>
                <h3>{offres.gratuitTitre}</h3>
                <p className="offre-sous-titre">{offres.gratuitSousTitre}</p>
              </div>
              <span className="etiquette">{offres.gratuitEtiquette}</span>
            </div>
            <ul className="points">
              {offres.gratuitAvantages(1445, 12).map((point: string) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <article className={`carte-offre plus${viseePlus ? " en-avant" : ""}`}>
            {viseePlus && <p className="offre-visee">{offres.offreMiseEnAvant}</p>}
            <div className="offre-entete">
              <div>
                <h3>{offres.plusTitre}</h3>
                <p className="offre-sous-titre">{offres.plusCategorie}</p>
              </div>
              <span className="etiquette">{offres.plusEtiquette}</span>
            </div>
            <ul className="points">
              {offres.plusAvantages.map((point: string) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className="offre-contenu">
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

          <article className={`carte-offre langue${viseeLangue ? " en-avant" : ""}`}>
            {viseeLangue && <p className="offre-visee">{offres.offreMiseEnAvant}</p>}
            <div className="offre-entete">
              <span className="offre-icone" aria-hidden="true">abc</span>
              <div className="offre-titre">
                <h3>{offres.langueTitre}</h3>
                <p className="offre-sous-titre">{offres.langueCategorie}</p>
              </div>
            </div>
            <ul className="points">
              {offres.langueAvantages.map((point: string) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className="offre-contenu">
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

        <footer className="offres-footer">
          <Link href={`/${langue}/conditions`}>{t.conditions.titre}</Link>
        </footer>
      </section>
    </>
  );
}
