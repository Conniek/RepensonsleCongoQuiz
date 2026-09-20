"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { dictionnaire, type Langue } from "@/lib/i18n";

type Ligne = {
  id: string;
  difficulte: number;
  statut: string;
  vues: number;
  reussites: number;
  categorie_id: string;
  question_texte: { enonce: string; statut: string }[];
};

export default function ListeQuestions({
  langue, categories,
}: {
  langue: Langue;
  categories: { categorie_id: string; libelle: string }[];
}) {
  const t = dictionnaire(langue);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [recherche, setRecherche] = useState("");
  const [categorie, setCategorie] = useState("");
  const [difficulte, setDifficulte] = useState("");
  const [statut, setStatut] = useState("");
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      setChargement(true);
      const supabase = creerClientNavigateur();
      let requete = supabase
        .from("question")
        .select("id, difficulte, statut, vues, reussites, categorie_id, question_texte!inner(enonce, statut)")
        .eq("question_texte.langue", langue)
        .order("id")
        .limit(200);

      if (categorie) requete = requete.eq("categorie_id", categorie);
      if (difficulte) requete = requete.eq("difficulte", Number(difficulte));
      if (statut) requete = requete.eq("statut", statut);

      const { data } = await requete;
      if (!annule) {
        setLignes((data ?? []) as unknown as Ligne[]);
        setChargement(false);
      }
    })();
    return () => { annule = true; };
  }, [langue, categorie, difficulte, statut]);

  // La recherche textuelle se fait côté client sur le lot déjà chargé :
  // suffisant pour 200 lignes, à remplacer par une recherche plein texte
  // en base le jour où la banque dépassera quelques milliers de questions.
  const filtrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return lignes;
    return lignes.filter((l) =>
      l.question_texte[0]?.enonce.toLowerCase().includes(q)
    );
  }, [lignes, recherche]);

  return (
    <>
      <section aria-labelledby="titre-filtres">
        <h2 id="titre-filtres">{t.admin.filtreCategorie}</h2>

        <p>
          <label htmlFor="recherche">{t.admin.rechercher}</label><br />
          <input id="recherche" type="search" value={recherche}
                 onChange={(e) => setRecherche(e.target.value)} />
        </p>

        <p>
          <label htmlFor="f-categorie">{t.admin.filtreCategorie}</label><br />
          <select id="f-categorie" value={categorie}
                  onChange={(e) => setCategorie(e.target.value)}>
            <option value="">{t.admin.toutes}</option>
            {categories.map((c) => (
              <option key={c.categorie_id} value={c.categorie_id}>{c.libelle}</option>
            ))}
          </select>
        </p>

        <p>
          <label htmlFor="f-difficulte">{t.admin.filtreDifficulte}</label><br />
          <select id="f-difficulte" value={difficulte}
                  onChange={(e) => setDifficulte(e.target.value)}>
            <option value="">{t.admin.tous}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </p>

        <p>
          <label htmlFor="f-statut">{t.admin.filtreStatut}</label><br />
          <select id="f-statut" value={statut}
                  onChange={(e) => setStatut(e.target.value)}>
            <option value="">{t.admin.tous}</option>
            <option value="brouillon">{t.admin.statutBrouillon}</option>
            <option value="valide">{t.admin.statutValide}</option>
            <option value="a_reverifier">{t.admin.statutAReverifier}</option>
            <option value="retiree">{t.admin.statutRetiree}</option>
          </select>
        </p>
      </section>

      <div role="status" aria-live="polite">
        <p>{chargement ? t.commun.chargement : t.admin.resultats(filtrees.length)}</p>
      </div>

      {!chargement && filtrees.length === 0 ? (
        <p>{t.admin.aucunResultat}</p>
      ) : (
        <table>
          <caption>{t.admin.questions}</caption>
          <thead>
            <tr>
              <th scope="col">{t.admin.colEnonce}</th>
              <th scope="col">{t.admin.colDifficulte}</th>
              <th scope="col">{t.admin.colVues}</th>
              <th scope="col">{t.admin.colTaux}</th>
              <th scope="col">{t.admin.colStatut}</th>
            </tr>
          </thead>
          <tbody>
            {filtrees.map((l) => (
              <tr key={l.id}>
                <th scope="row">
                  <Link href={`/${langue}/admin/questions/${l.id}`}>
                    {l.question_texte[0]?.enonce ?? l.id}
                  </Link>
                </th>
                <td>{l.difficulte}</td>
                <td>{l.vues}</td>
                <td>
                  {l.vues > 0
                    ? `${Math.round((100 * l.reussites) / l.vues)} %`
                    : t.commun.sansValeur}
                </td>
                <td>{l.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
