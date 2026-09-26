"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { Etoile } from "./pictos";

export type Categorie = {
  produit_requis?: string | null;
  categorie_id: string; libelle: string; slug: string; nb_questions: number;
};

type Maitrise = { categorie_id: string; etoiles: number };

const ETOILES_MAX = 6;

/** Les quatre catégories mises en avant sur l'accueil.
 *
 *  Rendu une première fois côté serveur avec les quatre premières, ce qui
 *  garde la page indexable. Après montage, les catégories déjà jouées
 *  remontent en tête : on revient à ce qu'on a commencé plutôt qu'à une
 *  liste alphabétique. */
export default function CategoriesAccueil({
  langue, categories, total,
}: {
  langue: Langue; categories: Categorie[]; total: number;
}) {
  const t = dictionnaire(langue);
  const [maitrise, setMaitrise] = useState<Maitrise[]>([]);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await assurerSession();
        const supabase = creerClientNavigateur();
        const { data } = await supabase.rpc("progression", { p_langue: langue });
        if (!annule && data?.maitrise) setMaitrise(data.maitrise as Maitrise[]);
      } catch {
        // Sans session, on garde l'ordre servi par le serveur.
      }
    })();
    return () => { annule = true; };
  }, [langue]);

  const etoilesDe = (id: string) =>
    maitrise.find((m) => m.categorie_id === id)?.etoiles ?? 0;

  const ordonnees = [...categories].sort((a, b) =>
    etoilesDe(b.categorie_id) - etoilesDe(a.categorie_id)
  ).slice(0, 4);

  return (
    <section id="categories" aria-labelledby="titre-categories">
      <div className="titre-section">
        <h2 id="titre-categories">{t.accueil.titreCategories}</h2>
        <Link href={`/${langue}/categories`}>
          <span aria-hidden="true">{t.accueil.voirTout}</span>
          <span className="visuellement-masque">{t.accueil.voirToutesCategories(total)}</span>
        </Link>
      </div>

      <ul className="cartes">
        {ordonnees.map((c) => {
          const etoiles = etoilesDe(c.categorie_id);
          const pourcentage = Math.round((100 * etoiles) / ETOILES_MAX);
          return (
            <li key={c.categorie_id}>
              <div className="carte-visuel" aria-hidden="true" />
              <h3>{c.libelle}</h3>
              <p className="carte-compte">{t.accueil.nbQuestions(c.nb_questions)}</p>

              {/* Les étoiles sont décoratives : leur nombre est écrit juste
                  à côté, pour le lecteur d'écran comme pour l'impression. */}
              <p className="etoiles">
                <span aria-hidden="true">
                  {Array.from({ length: ETOILES_MAX }, (_, i) => (
                    <Etoile key={i} taille={14} pleine={i < etoiles} />
                  ))}
                </span>
                <span className="visuellement-masque">
                  {t.accueil.etoilesSur(etoiles, ETOILES_MAX)}
                </span>
              </p>

              <p className="carte-progression">
                <progress value={etoiles} max={ETOILES_MAX} aria-hidden="true" />
                <span aria-hidden="true">{pourcentage} %</span>
                <span className="visuellement-masque">{t.accueil.maitrise(pourcentage)}</span>
              </p>

              <Link className="action" href={`/${langue}/categorie/${c.slug}`}>
                <span aria-hidden="true">{t.accueil.jouer}</span>
                <span className="visuellement-masque">
                  {t.categorie.jouerNiveau(c.libelle)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
