"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { NIVEAUX, LIBELLE_NIVEAU, type Niveau } from "@/lib/slug";

type Etat = {
  niveau: Niveau;
  etoiles: number;
  debloque: boolean;
  condition: string | null;
};

/** Parcours des trois niveaux d'une catégorie.
 *
 *  Ce composant est rendu une première fois sur le serveur, tous niveaux
 *  ouverts : la page reste donc indexable et arrive complète au robot.
 *  L'état de déblocage, qui dépend de la session, est chargé après montage.
 *  Le rendu initial du client est identique au rendu serveur, ce qui évite
 *  toute erreur d'hydratation.
 *
 *  L'affichage n'est qu'une commodité : le verrou réel est dans
 *  composer_deck, côté serveur. Un lien direct échoue de toute façon. */
export default function Niveaux({
  categorie,
  dispo,
}: {
  categorie: string;
  dispo: Record<Niveau, number>;
}) {
  const [etats, setEtats] = useState<Etat[] | null>(null);
  const [annonce, setAnnonce] = useState("");

  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        await assurerSession();
        const supabase = creerClientNavigateur();
        const { data, error } = await supabase.rpc("etat_niveaux", {
          p_categorie: categorie,
        });
        if (error || annule) return;

        const e = data as Etat[];
        setEtats(e);

        // Annonce unique : l'affichage change après le rendu, un lecteur
        // d'écran doit savoir que des niveaux se sont verrouillés.
        const verrouilles = e.filter((x) => !x.debloque);
        if (verrouilles.length) {
          setAnnonce(
            verrouilles.length === 1
              ? `Le niveau ${LIBELLE_NIVEAU[verrouilles[0].niveau].toLowerCase()} est verrouillé.`
              : `${verrouilles.length} niveaux sont verrouillés.`
          );
        }
      } catch {
        // En cas d'échec, on laisse les niveaux ouverts : le serveur refusera
        // de composer un deck verrouillé, et le joueur verra un message clair.
      }
    })();

    return () => {
      annule = true;
    };
  }, [categorie]);

  return (
    <>
      <p role="status" aria-live="polite" className="visuellement-masque">
        {annonce}
      </p>

      <ol className="cartes">
        {NIVEAUX.map((niveau) => {
          const etat = etats?.find((e) => e.niveau === niveau);
          const debloque = etat ? etat.debloque : true;
          const etoiles = etat?.etoiles ?? 0;
          const n = dispo[niveau];

          return (
            <li key={niveau}>
              <h3>{LIBELLE_NIVEAU[niveau]}</h3>
              <p>
                {n} questions à ce niveau. {etoiles} étoile
                {etoiles > 1 ? "s" : ""} sur 2.
              </p>

              {n < 7 && (
                <p className="note">
                  Cette catégorie manque de questions à ce niveau. La partie
                  sera complétée par des questions de difficulté voisine.
                </p>
              )}

              {debloque ? (
                <p>
                  <Link
                    href={`/partie?categorie=${encodeURIComponent(categorie)}&niveau=${niveau}`}
                  >
                    Jouer le niveau {LIBELLE_NIVEAU[niveau].toLowerCase()}
                  </Link>
                </p>
              ) : (
                <>
                  {/* aria-disabled et non disabled : un bouton disabled sort
                      de l'ordre de tabulation, donc l'utilisateur de lecteur
                      d'écran ne le rencontre jamais et n'apprend pas qu'un
                      niveau existe ni comment le débloquer. */}
                  <p>
                    <button
                      type="button"
                      aria-disabled="true"
                      aria-describedby={`condition-${niveau}`}
                      onClick={(e) => e.preventDefault()}
                    >
                      Jouer le niveau {LIBELLE_NIVEAU[niveau].toLowerCase()}
                    </button>
                  </p>
                  <p id={`condition-${niveau}`} className="note">
                    {etat?.condition ??
                      "Remporte deux parties au niveau précédent pour débloquer ce niveau."}
                  </p>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
