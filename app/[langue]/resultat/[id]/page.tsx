import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue } from "@/lib/i18n";
import type { Niveau } from "@/lib/slug";

export const metadata = { title: "Résultat" };

export default async function PageResultat({
  params,
}: {
  params: Promise<{ langue: string; id: string }>;
}) {
  const { langue, id } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);
  const supabase = await creerClientServeur();

  // La politique de sécurité garantit qu'on ne lit que ses propres parties.
  const { data: partie } = await supabase
    .from("partie").select("*").eq("id", id).single();
  if (!partie) notFound();

  const [{ data: reponses }, { data: categorie }, { data: maitrise }] =
    await Promise.all([
      supabase.from("reponse").select("position, correcte, points, question_id")
        .eq("partie_id", id).order("position"),
      supabase.from("categorie_publique").select("libelle, slug")
        .eq("langue", langue).eq("categorie_id", partie.categorie_id).maybeSingle(),
      // Les étoiles sont lues APRÈS clôture : c'est terminer_partie qui les
      // a posées, on ne fait que rapporter son résultat.
      supabase.from("maitrise").select("etoiles")
        .eq("categorie_id", partie.categorie_id)
        .eq("niveau", partie.niveau).maybeSingle(),
    ]);
  const reponsesPartie = (reponses ?? []) as {
    position: number;
    correcte: boolean;
    points: number;
    question_id: string;
  }[];

  // Les énoncés, pour que le récapitulatif dise de quelle question il parle.
  const idsQuestions = reponsesPartie.map((r) => r.question_id);
  const { data: enonces } = idsQuestions.length
    ? await supabase.from("question_publique").select("id, enonce, reponses")
        .eq("langue", langue).in("id", idsQuestions)
    : { data: [] as { id: string; enonce: string; reponses: unknown }[] };
  const { data: corrections, error: erreurCorrections } = await supabase
    .rpc("resultat_reponses_correctes", { p_partie_id: id });
  let correctionsPartie = (corrections ?? []) as {
    position: number;
    bonne_reponse: number;
  }[];
  if (erreurCorrections) {
    if (erreurCorrections.code !== "PGRST202") throw erreurCorrections;
    const { data: erreurs, error: erreurHistorique } = await supabase.rpc(
      "mes_erreurs",
      { p_langue: langue, p_limite: 10000 },
    );
    if (erreurHistorique) throw erreurHistorique;
    const erreursPartie = (erreurs ?? []) as {
      question_id: string;
      bonne_reponse: number;
    }[];
    correctionsPartie = reponsesPartie.flatMap((r) => {
      const erreur = erreursPartie.find((item) => item.question_id === r.question_id);
      return !r.correcte && erreur
        ? [{ position: r.position, bonne_reponse: erreur.bonne_reponse }]
        : [];
    });
  }

  const enonceDe = (qid: string) =>
    (enonces ?? []).find((q) => q.id === qid)?.enonce ?? "";
  const bonneReponseDe = (position: number) => {
    const correction = correctionsPartie.find((r) => r.position === position);
    const question = (enonces ?? []).find(
      (q) => q.id === reponsesPartie.find((r) => r.position === position)?.question_id,
    );
    const options = question?.reponses;
    return Array.isArray(options) && typeof correction?.bonne_reponse === "number"
      ? options[correction.bonne_reponse]
      : null;
  };

  const gagnee = partie.points >= 900 && partie.bonnes >= 5;
  const etoiles = maitrise?.etoiles ?? 0;

  /* Deux étoiles ouvrent le niveau suivant : c'est le moment où la personne
     est le plus disposée à enchaîner, donc celui où on le lui propose.
     La règle d'ouverture reste serveur (niveau_debloque) ; ici on ne fait
     que proposer le lien, qui échouerait de toute façon s'il était prématuré. */
  const niveau = partie.niveau as Niveau;
  const niveauSuivant =
    niveau === "facile" ? "moyen" : niveau === "moyen" ? "difficile" : null;
  const niveauOuvert = etoiles >= 2 && niveauSuivant !== null;
  const gagnes = (partie.badges_gagnes ?? []) as string[];
  const libelle = categorie?.libelle ?? partie.categorie_id;

  return (
    <>
      <section
        className={`resultat-hero${gagnee ? " resultat-hero--victoire" : ""}`}
        aria-labelledby="titre-resultat"
      >
        <div className="resultat-hero-contenu">
          <span className="resultat-hero-icone" aria-hidden="true">
            {gagnee ? "🏆" : "💪"}
          </span>
          <h1 id="titre-resultat" tabIndex={-1}>
            {gagnee
              ? t.resultat.heroTitreGagnee
              : t.resultat.heroTitreEncouragement}
          </h1>
          <p className="resultat-hero-message">{gagnee
            ? t.resultat.heroMessageGagnee(libelle)
            : t.resultat.heroMessageEncouragement}
          </p>
          <p className="resultat-hero-libelle">{t.resultat.libelleScoreHero}</p>
          <p className="resultat-hero-score">{partie.points}</p>
          <p className="resultat-hero-bonnes">
            {t.resultat.bonnesReponsesHero(partie.bonnes, partie.deck.length)}
          </p>
          {gagnee
            ? (
              <div className="resultat-hero-etoile-groupe">
                <p className="etoile-gagnee">{t.resultat.etoileGagnee}</p>
                <div className="resultat-hero-etoiles" aria-hidden="true">
                  {[0, 1].map((index) => (
                    <span
                      key={index}
                      className={index < etoiles ? "gagnee" : "etoile-a-gagner"}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="resultat-hero-etoiles-niveau">
                  {t.resultat.etoilesNiveau(etoiles)}
                </p>
                {etoiles >= 2 && !niveauSuivant && (
                  <p className="resultat-hero-note">{t.resultat.toutFait}</p>
                )}
              </div>
            )
            : <p className="resultat-hero-objectif">
                <strong>{t.resultat.objectif}</strong> {t.resultat.conditionTexte}
              </p>}
          {partie.deck_complete && <p className="resultat-hero-note">{t.resultat.deckComplete}</p>}
          {!partie.chrono_actif && <p className="resultat-hero-note">{t.resultat.sansChrono}</p>}
        </div>
      </section>

      {gagnes.length > 0 && (
        <section
          aria-labelledby="titre-badges"
          className={gagnee ? "resultat-apres-victoire" : undefined}
        >
          <h2 id="titre-badges">{t.badges.nouveaux(gagnes.length)}</h2>
          <ul>{gagnes.map((b) => <li key={b}><strong>{b}</strong></li>)}</ul>
        </section>
      )}

      {!gagnee && (
        <section aria-labelledby="titre-etoile">
          <h2 id="titre-etoile">{t.resultat.titreEtoile}</h2>
          <p>{t.resultat.pasDEtoile}</p>
          <p>{t.resultat.etoilesNiveau(etoiles)}</p>
          {etoiles >= 2 && !niveauSuivant && (
            <p className="note">{t.resultat.toutFait}</p>
          )}
        </section>
      )}

      {niveauOuvert && (
        <section
          aria-labelledby="titre-niveau-ouvert"
          className={`bloc-progression${gagnee && gagnes.length === 0 ? " resultat-apres-victoire" : ""}`}
        >
          <h2 id="titre-niveau-ouvert">{t.resultat.niveauOuvertTitre}</h2>
          <p>{t.resultat.niveauOuvertTexte(t.niveaux[niveauSuivant])}</p>
          <p>
            <Link className="action"
                  href={`/${langue}/partie?categorie=${partie.categorie_id}&niveau=${niveauSuivant}`}>
              {t.resultat.jouerNiveauSuivant(t.niveaux[niveauSuivant])}
            </Link>
          </p>
        </section>
      )}

      <section
        aria-labelledby="titre-detail"
        className={gagnee && gagnes.length === 0 && !niveauOuvert
          ? "resultat-apres-victoire"
          : undefined}
      >
        <h2 id="titre-detail">{t.resultat.titreDetail}</h2>
        <ol className="liste-resultat-reponses">
          {reponsesPartie.map((r) => {
            const bonneReponse = r.correcte ? null : bonneReponseDe(r.position);
            return (
              <li key={r.position} className={r.correcte ? "reponse-juste" : "reponse-fausse"}>
                <span className="recap-etat" aria-hidden="true">
                  {r.correcte ? "✓" : "×"}
                </span>
                <div className="recap-contenu">
                  <p className="recap-enonce">{enonceDe(r.question_id)}</p>
                  {bonneReponse && (
                    <p className="recap-correction">
                      <span aria-hidden="true">→ </span>
                      {bonneReponse}
                    </p>
                  )}
                </div>
                <span className="visuellement-masque">
                  {t.resultat.statutReponse(r.correcte)}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="titre-suite" className="visuellement-masque">
        <h2 id="titre-suite">{t.resultat.titreSuite}</h2>
        <ul>
          <li>
            <Link href={`/${langue}/partie?categorie=${partie.categorie_id}&niveau=${niveau}`}>
              {t.resultat.rejouer(t.niveaux[niveau])}
            </Link>
          </li>
          {categorie && (
            <li>
              <Link href={`/${langue}/categorie/${categorie.slug}`}>
                {t.partie.retourCategorie(libelle)}
              </Link>
            </li>
          )}
          <li><Link href={`/${langue}/profil`}>{t.resultat.voirProgression}</Link></li>
          <li><Link href={`/${langue}`}>{t.commun.retourAccueil}</Link></li>
        </ul>
      </section>

      <nav className="resultat-actions" aria-label={t.resultat.titreSuite}>
        <Link
          className="action action-bloc"
          href={gagnee
            ? `/${langue}/profil`
            : `/${langue}/partie?categorie=${partie.categorie_id}&niveau=${niveau}`}
        >
          {gagnee
            ? t.resultat.voirProgression
            : t.resultat.rejouer(t.niveaux[niveau])}
        </Link>
        <Link className="action action-bloc resultat-action-accueil" href={`/${langue}`}>
          {t.commun.retourAccueil}
        </Link>
      </nav>
    </>
  );
}
