"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";

type Ligne = {
  partie_id: string; categorie: string; slug: string;
  niveau: "facile" | "moyen" | "difficile";
  points: number; bonnes: number; total: number;
  gagnee: boolean; terminee_le: string;
};

export default function Historique({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const [lignes, setLignes] = useState<Ligne[] | null>(null);
  const formatDate = new Intl.DateTimeFormat(langue, { dateStyle: "medium" });

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await assurerSession();
        const { data } = await creerClientNavigateur().rpc("mon_historique", { p_langue: langue });
        if (!annule) setLignes((data ?? []) as Ligne[]);
      } catch {
        if (!annule) setLignes([]);
      }
    })();
    return () => { annule = true; };
  }, [langue]);

  return (
    <>
      <nav aria-label={t.navigation.filAriane}>
        <ol className="ariane">
          <li><Link href={`/${langue}/quiz`}>{t.quizHub.titre}</Link></li>
          <li aria-current="page">{t.historique.titre}</li>
        </ol>
      </nav>

      <h1 tabIndex={-1}>{t.historique.titre}</h1>

      {lignes === null ? (
        <p>{t.commun.chargement}</p>
      ) : lignes.length === 0 ? (
        <p>{t.historique.aucun}</p>
      ) : (
        <table>
          <caption>{t.historique.legende}</caption>
          <thead>
            <tr>
              <th scope="col">{t.historique.colDate}</th>
              <th scope="col">{t.historique.colCategorie}</th>
              <th scope="col">{t.historique.colNiveau}</th>
              <th scope="col">{t.historique.colScore}</th>
              <th scope="col">{t.historique.colResultat}</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.partie_id}>
                <td>
                  <time dateTime={l.terminee_le}>{formatDate.format(new Date(l.terminee_le))}</time>
                </td>
                <th scope="row">
                  <Link href={`/${langue}/resultat/${l.partie_id}`}>{l.categorie}</Link>
                </th>
                <td>{t.niveaux[l.niveau]}</td>
                <td>{t.historique.score(l.points, l.bonnes, l.total)}</td>
                <td>{l.gagnee ? t.historique.gagnee : t.historique.perdue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
