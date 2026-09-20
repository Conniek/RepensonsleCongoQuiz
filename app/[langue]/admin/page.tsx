import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue, LANGUES } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Completude = {
  categorie_id: string; libelle: string; langue: string;
  traduites: number; totales: number; pourcentage: number | null;
};

type Stats = {
  questions_totales: number;
  questions_validees: number;
  sans_image_alt: number;
  a_recalibrer: number;
  completude: Completude[];
  quiz_sous_seuil: { id: string; titre: string; nb: number }[];
};

export default async function TableauDeBord({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  const supabase = await creerClientServeur();
  const { data } = await supabase.rpc("stats_editoriales", { p_langue: langue });
  const stats = data as Stats | null;
  if (!stats) return null;

  return (
    <>
      <h1 tabIndex={-1}>{t.admin.tableauDeBord}</h1>

      <section aria-labelledby="titre-chiffres">
        <h2 id="titre-chiffres">{t.admin.questions}</h2>
        <dl>
          <dt>{t.admin.questionsTotales}</dt>
          <dd>{stats.questions_totales}</dd>
          <dt>{t.admin.questionsValidees}</dt>
          <dd>{stats.questions_validees}</dd>
          <dt>{t.admin.aRecalibrer}</dt>
          <dd>{stats.a_recalibrer}</dd>
          <dt>{t.admin.sansTexteAlternatif}</dt>
          <dd>{stats.sans_image_alt}</dd>
        </dl>
      </section>

      <section aria-labelledby="titre-completude">
        <h2 id="titre-completude">{t.admin.titreCompletude}</h2>
        <table>
          <caption>{t.admin.titreCompletude}</caption>
          <thead>
            <tr>
              <th scope="col">{t.admin.filtreCategorie}</th>
              {LANGUES.map((l) => (
                <th scope="col" key={l}>{t.langues[l]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(new Set(stats.completude.map((c) => c.categorie_id))).map((id) => {
              const lignes = stats.completude.filter((c) => c.categorie_id === id);
              const libelle = lignes[0]?.libelle ?? id;
              return (
                <tr key={id}>
                  <th scope="row">{libelle}</th>
                  {LANGUES.map((l) => {
                    const c = lignes.find((x) => x.langue === l);
                    return (
                      <td key={l}>
                        {c ? `${c.traduites} / ${c.totales}` : t.commun.sansValeur}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="titre-quiz">
        <h2 id="titre-quiz">{t.admin.titreQuizSousSeuil}</h2>
        {stats.quiz_sous_seuil.length === 0 ? (
          <p>{t.admin.aucunQuizSousSeuil}</p>
        ) : (
          <ul>
            {stats.quiz_sous_seuil.map((q) => (
              <li key={q.id}>{t.admin.quizSousSeuil(q.titre, q.nb)}</li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
