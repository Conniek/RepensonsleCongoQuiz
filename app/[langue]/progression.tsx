"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";

type Badge = {
  id: string; libelle: string; condition: string;
  objectif: number; avancement: number; obtenu: boolean;
};

type Etat = {
  xp: number; pseudo: string | null; rang: string; rang_seuil: number;
  rang_suivant: string | null; xp_rang_suivant: number | null;
  serie_jours: number; serie_record: number; parties: number;
  taux_reussite: number | null; badges: Badge[];
};

type Defi = {
  categorie_id: string; libelle: string; slug: string;
  niveau: string; recompense_xp: number; fait: boolean;
};

export default function Progression({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const [etat, setEtat] = useState<Etat | null>(null);
  const [defi, setDefi] = useState<Defi | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await assurerSession();
        const supabase = creerClientNavigateur();
        const [p, d] = await Promise.all([
          supabase.rpc("progression", { p_langue: langue }),
          supabase.rpc("defi_du_jour", { p_langue: langue }),
        ]);
        if (annule) return;
        if (p.data) setEtat(p.data as Etat);
        if (d.data) setDefi(d.data as Defi);
      } finally {
        if (!annule) setPret(true);
      }
    })();
    return () => { annule = true; };
  }, [langue]);

  if (!pret) {
    return (
      <section aria-labelledby="titre-progression">
        <h2 id="titre-progression">{t.progression.titre}</h2>
        <p>{t.progression.chargement}</p>
      </section>
    );
  }

  const enCours = etat?.xp_rang_suivant != null;
  const restant = enCours ? etat!.xp_rang_suivant! - etat!.xp : 0;
  const obtenus = etat?.badges.filter((b) => b.obtenu) ?? [];
  // Le prochain à débloquer, celui dont l'avancement est le plus proche de
  // l'objectif : ça donne une cible là où une liste de verrouillés ne
  // donnerait qu'un constat.
  const prochain = (etat?.badges ?? [])
    .filter((b) => !b.obtenu && b.avancement > 0)
    .sort((a, b) => b.avancement / b.objectif - a.avancement / a.objectif)[0];

  return (
    <>
      <section
        id="progression"
        className={etat && etat.parties > 0 ? "progression" : undefined}
        aria-labelledby="titre-progression"
      >
        {etat && etat.parties > 0 ? (
          <>
            {/* Anneau de taux de réussite. La valeur est posée en propriété
                personnalisée — une donnée, pas une décision d'apparence — et
                le pourcentage reste ÉCRIT au centre. */}
            {etat.taux_reussite != null && (
              <div
                className="anneau"
                style={{ "--taux": etat.taux_reussite } as React.CSSProperties}
                aria-hidden="true"
              >
                <span>
                  <b>{etat.taux_reussite}%</b>
                  <small>{t.progression.deReussite}</small>
                </span>
              </div>
            )}

            <div>
              <h2 id="titre-progression">{t.progression.titre}</h2>
              <p className="rang">{etat.rang}</p>

              {enCours && (
                <progress value={etat.xp - etat.rang_seuil}
                          max={etat.xp_rang_suivant! - etat.rang_seuil}
                          aria-hidden="true" />
              )}

              {/* L'information reste portée par le TEXTE : l'anneau et la
                  barre ne font que la redoubler visuellement. */}
              <p>
                {enCours
                  ? t.progression.resteAvantRang(restant, etat.rang_suivant!, etat.xp, etat.xp_rang_suivant!)
                  : t.progression.rangMaximal(etat.xp)}
              </p>
              {etat.taux_reussite != null && (
                <p>{t.progression.tauxReussite(etat.taux_reussite, etat.parties)}</p>
              )}
              {etat.serie_jours > 0 && (
                <p>
                  <time dateTime={`P${etat.serie_jours}D`}>
                    {t.progression.serie(etat.serie_jours)}
                  </time>
                  {etat.serie_record > etat.serie_jours && t.progression.record(etat.serie_record)}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 id="titre-progression">{t.progression.titre}</h2>
            <p>{t.progression.jamaisJoue}</p>
          </>
        )}
      </section>

      {defi && (
        <section aria-labelledby="titre-defi">
          <h2 id="titre-defi">{t.defi.titre}</h2>
          <h3>{defi.libelle}</h3>
          {defi.fait ? (
            <p>{t.defi.dejaFait}</p>
          ) : (
            <>
              <p>{t.defi.presentation(defi.recompense_xp)}</p>
              <p>
                <Link href={`/${langue}/partie?categorie=${defi.categorie_id}&niveau=${defi.niveau}&mode=defi_du_jour`}>
                  {t.defi.jouer(defi.libelle)}
                </Link>
              </p>
            </>
          )}
        </section>
      )}

      {etat && etat.badges.length > 0 && (
        <section aria-labelledby="titre-badges">
          <h2 id="titre-badges">{t.badges.titre}</h2>
          {/* Seuls les badges OBTENUS ici : l'accueil récompense, le profil informe. */}
          {obtenus.length === 0 ? (
            <p>{t.badges.aucun}</p>
          ) : (
            <ul className="medaillons">
              {obtenus.slice(0, 3).map((b) => (
                <li key={b.id}>
                  <span className="pastille" aria-hidden="true">
                    {b.libelle.charAt(0)}
                  </span>
                  {b.libelle}
                  {/* La condition n'encombre pas l'écran mais reste lue par
                      un lecteur d'écran : du texte réellement présent, pas
                      un title ni un alt, qui ne sont pas annoncés de façon
                      fiable. */}
                  <span className="visuellement-masque">, {t.badges.obtenuLe}. {b.condition}.</span>
                </li>
              ))}
              {prochain && (
                <li>
                  <span className="pastille" aria-hidden="true">
                    {prochain.avancement}/{prochain.objectif}
                  </span>
                  {prochain.libelle}
                  <span className="visuellement-masque">
                    , {t.badges.avancement(prochain.avancement, prochain.objectif)}. {prochain.condition}.
                  </span>
                </li>
              )}
            </ul>
          )}
          <p>
            <Link href={`/${langue}/profil`}>{t.badges.voirTous(etat.badges.length)}</Link>
          </p>
        </section>
      )}
    </>
  );
}
