"use client";

import { useEffect, useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { nomPays } from "@/lib/pays";

type Ligne = {
  position: number;
  pseudo: string;
  pays: string | null;
  points: number;
  moi: boolean;
};

type Resultat = {
  portee: "monde" | "pays";
  periode: "semaine" | "mois" | "tout";
  pays: string | null;
  top: Ligne[];
  moi: Ligne | null;
};

const PORTEES = ["monde", "pays"] as const;
const PERIODES = ["semaine", "mois", "tout"] as const;

/** Classement.
 *
 *  Le calcul est entièrement serveur : la RPC renvoie le haut de tableau ET
 *  la ligne du joueur, même hors du top. Sans cette seconde ligne, un
 *  classement ne parle qu'aux dix premiers et décourage tous les autres. */
export default function Classement({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const [portee, setPortee] = useState<(typeof PORTEES)[number]>("monde");
  const [periode, setPeriode] = useState<(typeof PERIODES)[number]>("semaine");
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    let annule = false;
    setCharge(false);
    (async () => {
      try {
        await assurerSession();
        const { data } = await creerClientNavigateur().rpc("classement", {
          p_portee: portee,
          p_periode: periode,
          p_limite: 10,
        });
        if (!annule) setResultat(data as Resultat);
      } catch {
        if (!annule) setResultat(null);
      } finally {
        if (!annule) setCharge(true);
      }
    })();
    return () => { annule = true; };
  }, [portee, periode]);

  const dansLeTop = resultat?.top.some((l) => l.moi) ?? false;

  return (
    <section id="classement" aria-labelledby="titre-classement">
      <h2 id="titre-classement">{t.classement.titre}</h2>

      {/* Deux groupes de boutons plutôt que des listes déroulantes : le choix
          est court, et l'état courant reste visible sans ouvrir un menu. */}
      <div className="classement-filtres">
        <div role="group" aria-label={t.classement.portee} className="segment">
          {PORTEES.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={portee === p}
              onClick={() => setPortee(p)}
            >
              {t.classement[p]}
            </button>
          ))}
        </div>

        <div role="group" aria-label={t.classement.periode} className="segment">
          {PERIODES.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={periode === p}
              onClick={() => setPeriode(p)}
            >
              {t.classement[p]}
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite">
        {!charge ? (
          <p>{t.classement.chargement}</p>
        ) : portee === "pays" && resultat && !resultat.pays ? (
          <p>{t.classement.sansPays}</p>
        ) : !resultat || resultat.top.length === 0 ? (
          <p>{t.classement.vide}</p>
        ) : (
          <>
            <table className="classement">
              <caption className="visuellement-masque">
                {t.classement.titre} — {t.classement[portee]}, {t.classement[periode]}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{t.classement.colPosition}</th>
                  <th scope="col">{t.classement.colJoueur}</th>
                  <th scope="col">{t.classement.colPoints}</th>
                </tr>
              </thead>
              <tbody>
                {resultat.top.map((l) => (
                  <tr key={`${l.position}-${l.pseudo}`} className={l.moi ? "moi" : undefined}>
                    <td>{l.position}</td>
                    <td>
                      {l.pseudo}
                      {l.pays && portee === "monde" && (
                        <span className="classement-pays"> · {nomPays(l.pays, langue)}</span>
                      )}
                      {l.moi && <span className="visuellement-masque"> {t.classement.moi}</span>}
                    </td>
                    <td>{l.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Hors du tableau quand le joueur n'y figure pas : sa place
                reste lisible sans faire défiler cent lignes. */}
            {!dansLeTop && resultat.moi && (
              <p className="classement-moi">
                {t.classement.maPosition(resultat.moi.position)} — {resultat.moi.points}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
