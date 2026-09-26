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

  // Les énoncés, pour que le récapitulatif dise de quelle question il parle.
  const idsQuestions = (reponses ?? []).map((r) => r.question_id);
  const { data: enonces } = idsQuestions.length
    ? await supabase.from("question_publique").select("id, enonce")
        .eq("langue", langue).in("id", idsQuestions)
    : { data: [] as { id: string; enonce: string }[] };

  const enonceDe = (qid: string) =>
    (enonces ?? []).find((q) => q.id === qid)?.enonce ?? "";

  const gagnee = partie.points >= 900 && partie.bonnes >= 5;
  const etoiles = maitrise?.etoiles ?? 0;

  /* Décomposition de l'expérience. Le TOTAL affiché reste partie.xp_gagne,
     écrit par terminer_partie : les lignes n'expliquent qu'un chiffre déjà
     décidé côté serveur, elles ne le recalculent pas. */
  const xpBase = Math.floor(partie.points / 10);
  const xpVictoire = gagnee ? 40 : 0;
  const xpDefi = gagnee && partie.mode === "defi_du_jour" ? 50 : 0;

  /* Deux étoiles ouvrent le niveau suivant : c'est le moment où la personne
     est le plus disposée à enchaîner, donc celui où on le lui propose.
     La règle d'ouverture reste serveur (niveau_debloque) ; ici on ne fait
     que proposer le lien, qui échouerait de toute façon s'il était prématuré. */
  const niveauSuivant =
    niveau === "facile" ? "moyen" : niveau === "moyen" ? "difficile" : null;
  const niveauOuvert = etoiles >= 2 && niveauSuivant !== null;
  const niveau = partie.niveau as Niveau;
  const gagnes = (partie.badges_gagnes ?? []) as string[];
  const libelle = categorie?.libelle ?? partie.categorie_id;

  return (
    <>
      <h1 tabIndex={-1}>{gagnee ? t.resultat.remportee : t.resultat.terminee}</h1>

      <section aria-labelledby="titre-score">
        <h2 id="titre-score">{t.resultat.titreScore}</h2>
        <dl>
          <dt>{t.resultat.points}</dt>
          <dd>{t.resultat.pointsValeur(partie.points)}</dd>
          <dt>{t.resultat.bonnesReponses}</dt>
          <dd>{t.resultat.bonnesValeur(partie.bonnes, partie.deck.length)}</dd>
          <dt>{t.resultat.experience}</dt>
          <dd>{t.resultat.experienceValeur(partie.xp_gagne)}</dd>
          <dt>{t.resultat.conditionVictoire}</dt>
          <dd>
            {t.resultat.conditionTexte}{" "}
            {gagnee ? t.resultat.conditionAtteinte : t.resultat.conditionNonAtteinte}
          </dd>
        </dl>
        {partie.deck_complete && <p className="note">{t.resultat.deckComplete}</p>}
        {!partie.chrono_actif && <p className="note">{t.resultat.sansChrono}</p>}
      </section>

      {gagnes.length > 0 && (
        <section aria-labelledby="titre-badges">
          <h2 id="titre-badges">{t.badges.nouveaux(gagnes.length)}</h2>
          <ul>{gagnes.map((b) => <li key={b}><strong>{b}</strong></li>)}</ul>
        </section>
      )}

      <section aria-labelledby="titre-etoile">
        <h2 id="titre-etoile">{t.resultat.titreEtoile}</h2>
        {gagnee ? (
          <p className="etoile-gagnee">{t.resultat.etoileGagnee}</p>
        ) : (
          <p>{t.resultat.pasDEtoile}</p>
        )}
        <p>{t.resultat.etoilesNiveau(etoiles)}</p>
        {etoiles >= 2 && !niveauSuivant && (
          <p className="note">{t.resultat.toutFait}</p>
        )}
      </section>

      {niveauOuvert && (
        <section aria-labelledby="titre-niveau-ouvert" className="bloc-progression">
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

      <section aria-labelledby="titre-xp">
        <h2 id="titre-xp">{t.resultat.titreXp}</h2>
        <table className="detail-xp">
          <tbody>
            <tr>
              <th scope="row">{t.resultat.xpBase}</th>
              <td>{xpBase}</td>
            </tr>
            {xpVictoire > 0 && (
              <tr>
                <th scope="row">{t.resultat.xpVictoire}</th>
                <td>{xpVictoire}</td>
              </tr>
            )}
            {xpDefi > 0 && (
              <tr>
                <th scope="row">{t.resultat.xpDefi}</th>
                <td>{xpDefi}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{t.resultat.xpTotal}</th>
              <td>{partie.xp_gagne}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section aria-labelledby="titre-detail">
        <h2 id="titre-detail">{t.resultat.titreDetail}</h2>
        <ol>
          {(reponses ?? []).map((r) => (
            <li key={r.position} className={r.correcte ? "reponse-juste" : "reponse-fausse"}>
              <p className="recap-enonce">{enonceDe(r.question_id)}</p>
              <p className="recap-bilan">
                {t.resultat.ligneReponse(r.position + 1, r.correcte, r.points)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titre-suite">
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
    </>
  );
}
