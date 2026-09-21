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
              <p className="meta">{e.categorie}</p>
              <h2>{e.enonce}</h2>
              <p>
                <strong>{t.erreurs.bonneReponse}</strong> {e.reponses[e.bonne_reponse]}
              </p>
              {e.explication && <p>{e.explication}</p>}
              {e.source_url && (
                <p>
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
