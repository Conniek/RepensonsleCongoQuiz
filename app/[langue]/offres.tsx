import Link from "next/link";
import { dictionnaire, type Langue } from "@/lib/i18n";

/** Bloc de conversion, sur l'accueil.
 *
 *  C'est ici que se joue le passage au payant : personne n'ira chercher
 *  spontanément une page Offre. Les trois offres sont présentées ensemble
 *  pour que la gratuité soit visible en premier — elle est le moteur
 *  d'acquisition, pas un lot de consolation. */
export default function Offres({
  langue, questions, categories,
}: {
  langue: Langue; questions: number; categories: number;
}) {
  const t = dictionnaire(langue);

  return (
    <section aria-labelledby="titre-offres">
      <h2 id="titre-offres">{t.offres.titre}</h2>
      <p>{t.offres.intro}</p>

      <div className="offres">

        <article className="offre" aria-labelledby="offre-gratuit">
          <p className="categorie-offre">
            {t.offres.gratuitCategorie}
            <span className="etiquette">{t.offres.gratuitEtiquette}</span>
          </p>
          <h3 id="offre-gratuit">{t.offres.gratuitTitre}</h3>
          <p>{t.offres.gratuitTexte(questions, categories)}</p>
          <ul>
            <li>{t.offres.gratuitPoint1}</li>
            <li>{t.offres.gratuitPoint2}</li>
            <li>{t.offres.gratuitPoint3}</li>
          </ul>
          <p className="prix-detail">{t.offres.gratuitPublicite}</p>
        </article>

        <article className="offre offre-plus" aria-labelledby="offre-plus">
          <p className="categorie-offre">
            {t.offres.plusCategorie}
            <span className="etiquette">{t.offres.plusEtiquette}</span>
          </p>
          <h3 id="offre-plus">{t.offres.plusTitre}</h3>
          <p>{t.offres.plusTexte}</p>
          <ul>
            <li>{t.offres.plusPoint1}</li>
            <li>{t.offres.plusPoint2}</li>
          </ul>
          <p className="prix">{t.offres.plusPrix}</p>
          <p className="prix-detail">{t.offres.plusPrixDetail}</p>
          <Link className="action" href={`/${langue}/offre`}>
            {t.offres.plusAction}
          </Link>
        </article>

        <article className="offre offre-langue" aria-labelledby="offre-langue">
          <p className="categorie-offre">{t.offres.langueCategorie}</p>
          <h3 id="offre-langue">{t.offres.langueTitre}</h3>
          <p>{t.offres.langueTexte}</p>
          <ul>
            <li>{t.offres.langueDisponible}</li>
            {/* Annoncer « bientôt » plutôt que laisser croire à une
                disponibilité : vendre une promesse non produite crée une
                dette exigible par des gens qui ont payé. */}
            <li>{t.offres.langueBientot("Tshiluba")}</li>
            <li>{t.offres.langueBientot("Swahili")}</li>
          </ul>
          <p className="prix">{t.offres.languePrix}</p>
          <p className="prix-detail">{t.offres.languePrixDetail}</p>
          <Link className="action" href={`/${langue}/offre`}>
            {t.offres.langueAction}
          </Link>
        </article>

      </div>

      <p className="note">{t.offres.independantes}</p>
    </section>
  );
}
