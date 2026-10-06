"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";

type Erreur = {
  question_id: string; enonce: string; reponses: string[]; bonne_reponse: number;
  explication: string | null; source_url: string | null; source_titre: string | null;
  categorie: string;
};

export default function Erreurs({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const [liste, setListe] = useState<Erreur[] | null>(null);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await assurerSession();
        const { data } = await creerClientNavigateur().rpc("mes_erreurs", { p_langue: langue });
        if (!annule) setListe((data ?? []) as Erreur[]);
      } catch {
        if (!annule) setListe([]);
      }
    })();
    return () => { annule = true; };
  }, [langue]);

  return (
    <>
      <div className="brand-mark entete-quiz-logo" aria-hidden="true">
        <div className="brand-mark__crest"><span /></div>
        <p className="brand-mark__name">Repensons<br />le Congo</p>
      </div>

      <nav aria-label={t.navigation.filAriane}>
        <ol className="ariane">
          <li><Link href={`/${langue}/quiz`}>{t.quizHub.titre}</Link></li>
          <li aria-current="page">{t.erreurs.titre}</li>
        </ol>
      </nav>

      <h1 tabIndex={-1}>{t.erreurs.titre}</h1>
      <p>{t.erreurs.intro}</p>

      {liste === null ? (
        <p>{t.commun.chargement}</p>
      ) : liste.length === 0 ? (
        <p>{t.erreurs.aucune}</p>
      ) : (
        <ol className="liste-erreurs">
          {liste.map((e) => (
            <li key={e.question_id}>
              <p className="erreur-categorie">{e.categorie}</p>
              <h2 className="erreur-enonce">{e.enonce}</h2>
              <p className="erreur-correction">
                <span aria-hidden="true">→</span>
                <strong>{e.reponses[e.bonne_reponse]}</strong>
              </p>
              {e.explication && (
                <p className="erreur-explication">{e.explication}</p>
              )}
              {e.source_url && (
                <p className="erreur-source">
                  {t.partie.source}{" "}
                  <a href={e.source_url} rel="noopener" target="_blank">
                    {e.source_titre ?? t.partie.consulterSource}
                  </a>{" "}
                  {t.commun.nouvelleFenetre}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
