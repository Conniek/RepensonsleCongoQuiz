"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { NIVEAUX, type Niveau } from "@/lib/slug";
import { dictionnaire } from "@/lib/i18n";

type Etat = {
  niveau: Niveau;
  etoiles: number;
  debloque: boolean;
  condition: string | null;
};

/** Parcours des trois niveaux d'une catégorie.
 *
 *  Rendu une première fois sur le serveur, tous niveaux ouverts : la page
 *  reste indexable. L'état de déblocage, qui dépend de la session, est
 *  chargé après montage. Le rendu initial du client étant identique à celui
 *  du serveur, il n'y a pas d'erreur d'hydratation.
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
  const t = dictionnaire();
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

        const verrouilles = e.filter((x) => !x.debloque);
        if (verrouilles.length) {
          setAnnonce(
            verrouilles.length === 1
              ? t.categorie.annonceVerrou(t.niveaux[verrouilles[0].niveau])
              : t.categorie.annonceVerrous(verrouilles.length)
          );
        }
      } catch {
        // En cas d'échec, les niveaux restent ouverts : le serveur refusera
        // de composer un deck verrouillé et le joueur verra un message clair.
      }
    })();
    return () => {
      annule = true;
    };
  }, [categorie, t]);

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
              <h3>{t.niveaux[niveau]}</h3>
              <p>
                {t.categorie.questionsNiveau(n)} {t.categorie.etoiles(etoiles)}
              </p>

              {n < 7 && <p className="note">{t.categorie.poolInsuffisant}</p>}

              {debloque ? (
                <p>
                  <Link
                    href={`/partie?categorie=${encodeURIComponent(categorie)}&niveau=${niveau}`}
                  >
                    {t.categorie.jouerNiveau(t.niveaux[niveau])}
                  </Link>
                </p>
              ) : (
                <>
                  {/* aria-disabled et non disabled : un bouton disabled sort
                      de l'ordre de tabulation, donc l'utilisateur de lecteur
                      d'écran ne rencontre jamais ce niveau et n'apprend pas
                      comment le débloquer. */}
                  <p>
                    <button
                      type="button"
                      aria-disabled="true"
                      aria-describedby={`condition-${niveau}`}
                      onClick={(e) => e.preventDefault()}
                    >
                      {t.categorie.jouerNiveau(t.niveaux[niveau])}
                    </button>
                  </p>
                  <p id={`condition-${niveau}`} className="note">
                    {etat?.condition ?? t.categorie.conditionGenerique}
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
