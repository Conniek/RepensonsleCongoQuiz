"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";
import Card from "@/ui/Card";

type Ligne = {
  partie_id: string; categorie: string; slug: string;
  niveau: "facile" | "moyen" | "difficile";
  points: number; bonnes: number; total: number;
  gagnee: boolean; terminee_le: string;
};

export default function Historique({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const [lignes, setLignes] = useState<Ligne[] | null>(null);
  const dateRelative = new Intl.RelativeTimeFormat(langue, {
    numeric: "auto",
    style: "narrow",
  });
  const dateCourte = new Intl.DateTimeFormat(langue, { dateStyle: "short" });

  function datePartie(valeur: string) {
    const date = new Date(valeur);
    const maintenant = new Date();
    const jourPartie = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const jourCourant = new Date(
      maintenant.getFullYear(),
      maintenant.getMonth(),
      maintenant.getDate(),
    );
    const ecart = Math.round((jourCourant.getTime() - jourPartie.getTime()) / 86_400_000);
    return ecart >= 0 && ecart < 7
      ? dateRelative.format(-ecart, "day")
      : dateCourte.format(date);
  }

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
      <div className="brand-mark entete-quiz-logo" aria-hidden="true">
        <div className="brand-mark__crest"><span /></div>
        <p className="brand-mark__name">Repensons<br />le Congo</p>
      </div>

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
        <ol className="liste-historique" aria-label={t.historique.legende}>
          {lignes.map((l) => (
            <li key={l.partie_id}>
              <Link
                href={`/${langue}/resultat/${l.partie_id}`}
                className="lien-historique"
                aria-label={`${l.categorie}, ${t.niveaux[l.niveau]}, ${t.historique.score(l.points, l.bonnes, l.total)}, ${l.gagnee ? t.historique.gagnee : t.historique.perdue}`}
              >
                <Card tone="creme" className="carte-historique">
                  <span className="historique-icone" aria-hidden="true">
                    {l.gagnee ? "🏆" : "💪"}
                  </span>
                  <span className="historique-contenu">
                    <strong className="historique-categorie">{l.categorie}</strong>
                    <span className="historique-details">
                      {t.historique.resume(
                        t.niveaux[l.niveau],
                        l.bonnes,
                        l.total,
                        datePartie(l.terminee_le),
                      )}
                    </span>
                  </span>
                  <strong className={`historique-points ${l.gagnee ? "gagnee" : "perdue"}`}>
                    {t.historique.points(l.points)}
                  </strong>
                  <time className="visuellement-masque" dateTime={l.terminee_le}>
                    {dateCourte.format(new Date(l.terminee_le))}
                  </time>
                </Card>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
