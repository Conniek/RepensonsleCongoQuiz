"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { NIVEAUX, type Niveau } from "@/lib/slug";
import { dictionnaire, type Langue } from "@/lib/i18n";

type Etat = {
  niveau: Niveau;
  etoiles: number;
  debloque: boolean;
  disponibles: number;
};

export default function Niveaux({
  langue, categorieId, libelle,
}: {
  langue: Langue; categorieId: string; libelle: string;
}) {
  const t = dictionnaire(langue);
  const [etats, setEtats] = useState<Etat[] | null>(null);
  const [annonce, setAnnonce] = useState("");

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await assurerSession();
        const supabase = creerClientNavigateur();
        const { data, error } = await supabase.rpc("etat_niveaux", {
          p_categorie_id: categorieId,
          p_langue: langue,
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
        // Le serveur refusera de toute façon un niveau verrouillé.
      }
    })();
    return () => { annule = true; };
  }, [categorieId, langue, t]);

  const condition: Record<Niveau, string> = {
    facile: "",
    moyen: t.categorie.conditionMoyen,
    difficile: t.categorie.conditionDifficile,
  };

  return (
    <>
      <p role="status" aria-live="polite" className="visuellement-masque">{annonce}</p>

      <ol className="cartes">
        {NIVEAUX.map((niveau) => {
          const etat = etats?.find((e) => e.niveau === niveau);
          const debloque = etat ? etat.debloque : true;
          const etoiles = etat?.etoiles ?? 0;
          const n = etat?.disponibles ?? 0;

          return (
            <li key={niveau}>
              <h3>{t.niveaux[niveau]}</h3>
              <p>{t.categorie.questionsNiveau(n)} {t.categorie.etoiles(etoiles)}</p>
              {etats && n < 7 && <p className="note">{t.categorie.poolInsuffisant}</p>}

              {debloque ? (
                <p>
                  <Link href={`/${langue}/partie?categorie=${categorieId}&niveau=${niveau}`}>
                    {t.categorie.jouerNiveau(t.niveaux[niveau])}
                  </Link>
                </p>
              ) : (
                <>
                  {/* aria-disabled et non disabled : le niveau reste
                      atteignable au clavier et annonce sa condition. */}
                  <p>
                    <button type="button" aria-disabled="true"
                            aria-describedby={`condition-${niveau}`}
                            onClick={(e) => e.preventDefault()}>
                      {t.categorie.jouerNiveau(t.niveaux[niveau])}
                    </button>
                  </p>
                  <p id={`condition-${niveau}`} className="note">
                    {condition[niveau] || t.categorie.conditionGenerique}
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
