"use client";

import { useEffect, useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { dictionnaire, type Langue } from "@/lib/i18n";

type Quiz = {
  id: string; titre: string; tag_id: string | null;
  seuil_min: number; longueur: number; actif: boolean;
};

export default function QuizSpeciaux({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const supabase = creerClientNavigateur();

  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [comptes, setComptes] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    let annule = false;
    (async () => {
      const [{ data: qs }, { data: liens }] = await Promise.all([
        supabase.from("quiz_special").select("*").order("ordre"),
        supabase.from("question_tag").select("tag_id"),
      ]);
      if (annule) return;
      setQuiz((qs ?? []) as Quiz[]);
      const c: Record<string, number> = {};
      for (const l of (liens ?? []) as { tag_id: string }[]) {
        c[l.tag_id] = (c[l.tag_id] ?? 0) + 1;
      }
      setComptes(c);
    })();
    return () => { annule = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enregistrer(q: Quiz) {
    const { error } = await supabase.from("quiz_special")
      .update({ seuil_min: q.seuil_min, longueur: q.longueur, actif: q.actif })
      .eq("id", q.id);
    setMessage(error ? error.message : t.contenu.enregistre);
  }

  function maj(id: string, champ: keyof Quiz, valeur: unknown) {
    setQuiz((prec) => prec.map((q) => (q.id === id ? { ...q, [champ]: valeur } : q)));
  }

  return (
    <>
      <div role="status" aria-live="polite">{message && <p>{message}</p>}</div>

      <table>
        <caption>{t.contenu.quizSpeciaux}</caption>
        <thead>
          <tr>
            <th scope="col">{t.contenu.colTitre}</th>
            <th scope="col">{t.contenu.colRattachees}</th>
            <th scope="col">{t.contenu.colSeuil}</th>
            <th scope="col">{t.contenu.colActif}</th>
            <th scope="col">{t.contenu.enregistrer}</th>
          </tr>
        </thead>
        <tbody>
          {quiz.map((q) => {
            const nb = q.tag_id ? comptes[q.tag_id] ?? 0 : 0;
            const sousLeSeuil = nb < q.seuil_min;
            return (
              <tr key={q.id}>
                <th scope="row">
                  {q.titre}
                  {/* L'état est ÉCRIT, pas seulement signalé par une couleur. */}
                  {sousLeSeuil && (
                    <><br /><span className="note">{t.contenu.sousLeSeuil}</span></>
                  )}
                </th>
                <td>{nb}</td>
                <td>
                  <label htmlFor={`seuil-${q.id}`} className="visuellement-masque">
                    {t.contenu.colSeuil}
                  </label>
                  <input id={`seuil-${q.id}`} type="number" min={1} max={20}
                         value={q.seuil_min} size={3}
                         onChange={(e) => maj(q.id, "seuil_min", Number(e.target.value))} />
                </td>
                <td>
                  <label htmlFor={`actif-${q.id}`} className="visuellement-masque">
                    {t.contenu.colActif}
                  </label>
                  <input id={`actif-${q.id}`} type="checkbox" checked={q.actif}
                         onChange={(e) => maj(q.id, "actif", e.target.checked)} />
                </td>
                <td>
                  <button type="button" onClick={() => enregistrer(q)}>
                    {t.contenu.enregistrer}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
