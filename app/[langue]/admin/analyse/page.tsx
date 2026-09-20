import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Retention = {
  cohorte: string; joueurs: number;
  revenus_j1: number; revenus_j7: number; revenus_j30: number;
};
type Completion = {
  semaine: string; parties_lancees: number; terminees: number;
  abandonnees: number; taux_completion: number | null; gagnees: number;
};
type Abandon = { derniere_question: number; parties: number };
type Popularite = {
  libelle: string; niveau: string; parties: number; joueurs: number;
  points_moyens: number; taux_victoire: number | null;
};
type Analyse = {
  retention: Retention[]; completion: Completion[];
  abandon: Abandon[]; popularite: Popularite[];
  jamais_servies: number;
  joueurs: { total: number; avec_compte: number; actifs_7j: number; actifs_30j: number };
};

export default async function PageAnalyse({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  const supabase = await creerClientServeur();
  const { data } = await supabase.rpc("analyse_usage");
  const a = data as Analyse | null;
  if (!a) return null;

  const pourcent = (n: number, sur: number) =>
    sur > 0 ? `${Math.round((100 * n) / sur)} %` : t.commun.sansValeur;

  return (
    <>
      <h1 tabIndex={-1}>{t.analyse.titre}</h1>

      <section aria-labelledby="titre-joueurs">
        <h2 id="titre-joueurs">{t.analyse.joueurs}</h2>
        <dl>
          <dt>{t.analyse.total}</dt><dd>{a.joueurs.total}</dd>
          <dt>{t.analyse.avecCompte}</dt><dd>{a.joueurs.avec_compte}</dd>
          <dt>{t.analyse.actifs7}</dt><dd>{a.joueurs.actifs_7j}</dd>
          <dt>{t.analyse.actifs30}</dt><dd>{a.joueurs.actifs_30j}</dd>
        </dl>
      </section>

      <section aria-labelledby="titre-retention">
        <h2 id="titre-retention">{t.analyse.titreRetention}</h2>
        <p className="note">{t.analyse.introRetention}</p>
        {a.retention.length === 0 ? (
          <p>{t.analyse.aucuneDonnee}</p>
        ) : (
          <table>
            <caption>{t.analyse.titreRetention}</caption>
            <thead>
              <tr>
                <th scope="col">{t.analyse.colCohorte}</th>
                <th scope="col">{t.analyse.colJoueurs}</th>
                <th scope="col">{t.analyse.colJ1}</th>
                <th scope="col">{t.analyse.colJ7}</th>
                <th scope="col">{t.analyse.colJ30}</th>
              </tr>
            </thead>
            <tbody>
              {a.retention.map((r) => (
                <tr key={r.cohorte}>
                  <th scope="row">{r.cohorte}</th>
                  <td>{r.joueurs}</td>
                  <td>{pourcent(r.revenus_j1, r.joueurs)}</td>
                  <td>{pourcent(r.revenus_j7, r.joueurs)}</td>
                  <td>{pourcent(r.revenus_j30, r.joueurs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="titre-completion">
        <h2 id="titre-completion">{t.analyse.titreCompletion}</h2>
        {a.completion.length === 0 ? (
          <p>{t.analyse.aucuneDonnee}</p>
        ) : (
          <table>
            <caption>{t.analyse.titreCompletion}</caption>
            <thead>
              <tr>
                <th scope="col">{t.analyse.colSemaine}</th>
                <th scope="col">{t.analyse.colLancees}</th>
                <th scope="col">{t.analyse.colTerminees}</th>
                <th scope="col">{t.analyse.colAbandonnees}</th>
                <th scope="col">{t.analyse.colTauxCompletion}</th>
                <th scope="col">{t.analyse.colGagnees}</th>
              </tr>
            </thead>
            <tbody>
              {a.completion.map((c) => (
                <tr key={c.semaine}>
                  <th scope="row">{c.semaine}</th>
                  <td>{c.parties_lancees}</td>
                  <td>{c.terminees}</td>
                  <td>{c.abandonnees}</td>
                  <td>{c.taux_completion != null ? `${c.taux_completion} %` : t.commun.sansValeur}</td>
                  <td>{c.gagnees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="titre-abandon">
        <h2 id="titre-abandon">{t.analyse.titreAbandon}</h2>
        <p className="note">{t.analyse.introAbandon}</p>
        {a.abandon.length === 0 ? (
          <p>{t.analyse.aucuneDonnee}</p>
        ) : (
          <table>
            <caption>{t.analyse.titreAbandon}</caption>
            <thead>
              <tr>
                <th scope="col">{t.analyse.colDerniereQuestion}</th>
                <th scope="col">{t.analyse.colParties}</th>
              </tr>
            </thead>
            <tbody>
              {a.abandon.map((x) => (
                <tr key={x.derniere_question}>
                  <th scope="row">{x.derniere_question}</th>
                  <td>{x.parties}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="titre-popularite">
        <h2 id="titre-popularite">{t.analyse.titrePopularite}</h2>
        {a.popularite.length === 0 ? (
          <p>{t.analyse.aucuneDonnee}</p>
        ) : (
          <table>
            <caption>{t.analyse.titrePopularite}</caption>
            <thead>
              <tr>
                <th scope="col">{t.admin.filtreCategorie}</th>
                <th scope="col">{t.analyse.colNiveau}</th>
                <th scope="col">{t.analyse.colParties}</th>
                <th scope="col">{t.analyse.colJoueurs}</th>
                <th scope="col">{t.analyse.colPointsMoyens}</th>
                <th scope="col">{t.analyse.colTauxVictoire}</th>
              </tr>
            </thead>
            <tbody>
              {a.popularite.map((p, i) => (
                <tr key={i}>
                  <th scope="row">{p.libelle}</th>
                  <td>{t.niveaux[p.niveau as "facile" | "moyen" | "difficile"]}</td>
                  <td>{p.parties}</td>
                  <td>{p.joueurs}</td>
                  <td>{p.points_moyens}</td>
                  <td>{p.taux_victoire != null ? `${p.taux_victoire} %` : t.commun.sansValeur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="titre-angle-mort">
        <h2 id="titre-angle-mort">{t.analyse.titreAngleMort}</h2>
        <p>
          {a.jamais_servies > 0
            ? t.analyse.jamaisServies(a.jamais_servies)
            : t.analyse.aucunAngleMort}
        </p>
      </section>
    </>
  );
}
