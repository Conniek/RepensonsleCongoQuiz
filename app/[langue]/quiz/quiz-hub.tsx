"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { Etoile, Sablier, DocumentErreur, Document, Chevron } from "../pictos";

export type Theme = { categorie_id: string; libelle: string; slug: string; nb_questions: number };

type Campagne = { id: string; titre: string; description: string | null };
type Defi = { categorie_id: string; libelle: string; niveau: string; recompense_xp: number; fait: boolean };
type Reco = {
  categorie_id: string; libelle: string; slug: string;
  niveau: "facile" | "moyen" | "difficile"; etoiles_niveau: number; etoiles_categorie: number;
};
type Maitrise = { categorie_id: string; etoiles: number };

export default function QuizHub({ langue, themes }: { langue: Langue; themes: Theme[] }) {
  const t = dictionnaire(langue);
  const [etoiles, setEtoiles] = useState(0);
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [defi, setDefi] = useState<Defi | null>(null);
  const [erreurs, setErreurs] = useState(0);
  const [recos, setRecos] = useState<Reco[] | null>(null);
  const [maitrise, setMaitrise] = useState<Maitrise[]>([]);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await assurerSession();
        const s = creerClientNavigateur();
        const [p, d, c, e, r] = await Promise.all([
          s.rpc("progression", { p_langue: langue }),
          s.rpc("defi_du_jour", { p_langue: langue }),
          s.from("campagne").select("id, titre, description").eq("mise_en_avant", true),
          s.rpc("compter_erreurs", { p_langue: langue }),
          s.rpc("recommandations", { p_langue: langue }),
        ]);
        if (annule) return;
        setEtoiles(p.data?.etoiles_total ?? 0);
        setMaitrise((p.data?.maitrise ?? []) as Maitrise[]);
        if (d.data) setDefi(d.data as Defi);
        setCampagnes((c.data ?? []) as Campagne[]);
        setErreurs((e.data as number) ?? 0);
        setRecos((r.data ?? []) as Reco[]);
      } catch {
        if (!annule) setRecos([]);
      }
    })();
    return () => { annule = true; };
  }, [langue]);

  const etoilesDe = (id: string) => maitrise.find((m) => m.categorie_id === id)?.etoiles ?? 0;

  return (
    <>
      <div className="hub-entete">
        <h1 tabIndex={-1}>{t.quizHub.titre}</h1>
        <p className="pastille-etoiles">
          <Etoile taille={18} />
          <span aria-hidden="true">{etoiles}</span>
          <span className="visuellement-masque">{t.quizHub.etoilesGagnees(etoiles)}</span>
        </p>
      </div>

      {/* Carrousel : une liste qui défile horizontalement. Aucun défilement
          automatique — un contenu qui bouge seul est un piège pour la
          lecture et pour le clavier. */}
      <section aria-labelledby="titre-carrousel">
        <h2 id="titre-carrousel" className="visuellement-masque">{t.quizHub.titreCarrousel}</h2>
        <ul className="carrousel">
          {defi && !defi.fait && (
            <li className="diapo diapo-defi">
              <p className="etiquette-diapo"><Sablier taille={16} /> {t.quizHub.duJour}</p>
              <h3>{defi.libelle}</h3>
              <Link className="action"
                    href={`/${langue}/partie?categorie=${defi.categorie_id}&niveau=${defi.niveau}&mode=defi_du_jour`}>
                <span aria-hidden="true">{t.quizHub.jouer}</span>
                <span className="visuellement-masque">{t.defi.jouer(defi.libelle)}</span>
              </Link>
            </li>
          )}
          {campagnes.map((c) => (
            <li key={c.id} className="diapo">
              <p className="etiquette-diapo"><Sablier taille={16} /> {t.quizHub.saisonnier}</p>
              <h3>{c.titre}</h3>
              {c.description && <p>{c.description}</p>}
              <Link className="action" href={`/${langue}/quiz#campagne-${c.id}`}>
                {t.quizHub.voirDetails}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ul className="raccourcis">
        <li>
          <Link href={`/${langue}/quiz/erreurs`}>
            <DocumentErreur taille={24} />
            <span>{t.quizHub.erreurs}</span>
            <span className="compteur" aria-hidden="true">{erreurs}</span>
            <span className="visuellement-masque">, {t.quizHub.erreursCompte(erreurs)}</span>
          </Link>
        </li>
        <li>
          <Link href={`/${langue}/quiz/historique`}>
            <Document taille={24} />
            <span>{t.quizHub.historique}</span>
          </Link>
        </li>
      </ul>

      <section aria-labelledby="titre-pour-toi">
        <h2 id="titre-pour-toi">{t.quizHub.pourToi}</h2>
        {recos === null ? (
          <p>{t.commun.chargement}</p>
        ) : recos.length === 0 ? (
          <p>{t.quizHub.pourToiVide}</p>
        ) : (
          <ul className="pour-toi">
            {recos.map((r) => (
              <li key={r.categorie_id}>
                <p className={`niveau niveau-${r.niveau}`}>{t.niveaux[r.niveau]}</p>
                <h3>
                  <Link href={`/${langue}/partie?categorie=${r.categorie_id}&niveau=${r.niveau}`}>
                    {r.libelle}
                  </Link>
                </h3>
                <p className="a-gagner">
                  <Etoile taille={16} />
                  {t.quizHub.etoilesAGagner(2 - r.etoiles_niveau)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titre-themes">
        <h2 id="titre-themes">{t.quizHub.themes}</h2>
        <ul className="themes">
          {themes.map((th) => {
            const e = etoilesDe(th.categorie_id);
            return (
              <li key={th.categorie_id}>
                <h3><Link href={`/${langue}/categorie/${th.slug}`}>{th.libelle}</Link></h3>
                <p className="theme-progression">
                  <progress value={e} max={6} aria-hidden="true" />
                  <span>{t.quizHub.etoilesTheme(e)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="offre offre-plus" aria-labelledby="titre-upsell">
        <h2 id="titre-upsell">{t.quizHub.upsellTitre}</h2>
        <p>{t.quizHub.upsellTexte}</p>
        <Link className="action" href={`/${langue}/offre`}>
          {t.quizHub.upsellAction} <Chevron taille={18} />
        </Link>
      </section>
    </>
  );
}
