"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { dictionnaire, type Langue } from "@/lib/i18n";

type Ligne = {
  question_id: string; enonce: string; categorie: string;
  difficulte: number; vues: number; taux: number;
  suggestion: number; motif: "trop-facile" | "trop-difficile";
};

export default function Recalibration({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState("");

  const charger = useCallback(async () => {
    setChargement(true);
    const supabase = creerClientNavigateur();
    const { data } = await supabase.rpc("questions_a_recalibrer", {
      p_langue: langue,
    });
    setLignes((data ?? []) as Ligne[]);
    setChargement(false);
  }, [langue]);

  useEffect(() => { void charger(); }, [charger]);

  async function appliquer(ligne: Ligne) {
    const supabase = creerClientNavigateur();
    const { error } = await supabase.rpc("recalibrer", {
      p_question_id: ligne.question_id,
      p_difficulte: ligne.suggestion,
    });
    if (error) { setMessage(error.message); return; }
    setMessage(t.admin.applique);
    await charger();
  }

  if (chargement) return <p>{t.commun.chargement}</p>;

  return (
    <>
      <div role="status" aria-live="polite">{message && <p>{message}</p>}</div>

      {lignes.length === 0 ? (
        <p>{t.admin.aucuneARecalibrer}</p>
      ) : (
        <table>
          <caption>{t.admin.titreRecalibration}</caption>
          <thead>
            <tr>
              <th scope="col">{t.admin.colEnonce}</th>
              <th scope="col">{t.admin.colDifficulte}</th>
              <th scope="col">{t.admin.colTaux}</th>
              <th scope="col">{t.admin.colVues}</th>
              <th scope="col">{t.admin.appliquer}</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.question_id}>
                <th scope="row">
                  <Link href={`/${langue}/admin/questions/${l.question_id}`}>
                    {l.enonce}
                  </Link>
                  <br />
                  {/* Le motif est écrit, pas seulement suggéré par une couleur. */}
                  <span className="note">
                    {l.motif === "trop-facile"
                      ? t.admin.motifTropFacile
                      : t.admin.motifTropDifficile}
                  </span>
                </th>
                <td>{l.difficulte}</td>
                <td>{l.taux} %</td>
                <td>{l.vues}</td>
                <td>
                  <button type="button" onClick={() => appliquer(l)}>
                    {t.admin.suggestion(l.suggestion)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
